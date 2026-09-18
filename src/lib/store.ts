"use client";

import { useMemo, useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProductById, type Product, type Variant } from "./products";
import {
  buildWallet,
  codeFor,
  evaluateInvite,
  maxCreditFor,
  REFERRAL,
  seedReferrals,
  summarize,
  type CreditSpend,
  type Referral,
  type RejectReason,
  type ReferralSource,
} from "./referrals";

export interface CartItem {
  key: string;
  productId: string;
  variant: number;
  qty: number;
}

export interface OrderAddress {
  name: string;
  phone: string;
  email: string;
  city: string;
  area: string;
  address: string;
  notes?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  items: { productId: string; name: string; variant: string; price: number; qty: number; image: string }[];
  address: OrderAddress;
  slot: { date: string; window: string };
  payment: string;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  promo?: string;
  /** Referral credit redeemed against this order. */
  credit?: number;
  /** One-off discount from the invite link this customer arrived on. */
  inviteDiscount?: number;
}

export interface Promo {
  code: string;
  label: string;
  kind: "percent" | "flat" | "shipping";
  value: number;
  min: number;
}

export const PROMOS: Promo[] = [
  { code: "WELCOME10", label: "10% off your first order", kind: "percent", value: 10, min: 0 },
  { code: "FROSTY500", label: "Rs. 500 off orders above Rs. 5,000", kind: "flat", value: 500, min: 5000 },
  { code: "BUNDLE12", label: "Bundle deal — 12% off", kind: "percent", value: 12, min: 2500 },
  { code: "FREESHIP", label: "Free cold-chain delivery", kind: "shipping", value: 0, min: 0 },
];

export const FREE_SHIPPING_AT = 3000;
export const DELIVERY_FEE = 199;
export const MAX_QTY = 20;

/** An invite captured from a link before the visitor has an account. */
export interface PendingInvite {
  code: string;
  at: string;
  source: ReferralSource;
}

interface ShopState {
  cart: CartItem[];
  wishlist: string[];
  recent: string[];
  orders: Order[];
  promo: string | null;
  user: { name: string; email: string } | null;
  /** Friends this account has invited. */
  referrals: Referral[];
  /** The code that brought this account in — locked in at signup, never changes. */
  referredBy: string | null;
  /** Captured from an invite link; upgraded to `referredBy` once they sign up. */
  pendingInvite: PendingInvite | null;
  /** Append-only debits. Credits are derived from `referrals`, never stored. */
  creditSpends: CreditSpend[];
  /** Referral credit staged against the current cart. */
  creditApplied: number;
  addToCart: (productId: string, variant?: number, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => boolean;
  pushRecent: (productId: string) => void;
  applyPromo: (code: string | null) => void;
  placeOrder: (order: Order) => void;
  login: (name: string, email: string) => void;
  logout: () => void;
  /** Remember an invite link so it survives until the visitor signs up. */
  captureInvite: (code: string, source?: ReferralSource) => void;
  /** Runs the eligibility checks and binds the invite to this account. */
  acceptInvite: (code: string, source?: ReferralSource) => RejectReason | null;
  dismissInvite: () => void;
  applyCredit: (amount: number) => void;
  /** Demo control: adds a friend at the "invited" stage. */
  simulateInvite: (name: string, source: ReferralSource) => void;
  /** Demo control: converts an invited friend so the reward starts clearing. */
  simulateConversion: (id: string) => void;
}

/** Your own invite code, derived from the signed-in account. */
export const myCode = (user: { name: string; email: string } | null) =>
  user ? codeFor(user.name, user.email) : null;

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      recent: [],
      orders: [],
      promo: null,
      user: null,
      referrals: [],
      referredBy: null,
      pendingInvite: null,
      creditSpends: [],
      creditApplied: 0,
      addToCart: (productId, variant = 0, qty = 1) => {
        const key = `${productId}:${variant}`;
        const existing = get().cart.find((i) => i.key === key);
        set({
          cart: existing
            ? get().cart.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i))
            : [...get().cart, { key, productId, variant, qty: Math.min(MAX_QTY, qty) }],
        });
      },
      setQty: (key, qty) =>
        set({
          cart: qty <= 0
            ? get().cart.filter((i) => i.key !== key)
            : get().cart.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)),
        }),
      removeFromCart: (key) => set({ cart: get().cart.filter((i) => i.key !== key) }),
      clearCart: () => set({ cart: [], promo: null, creditApplied: 0 }),
      toggleWishlist: (productId) => {
        const has = get().wishlist.includes(productId);
        set({ wishlist: has ? get().wishlist.filter((id) => id !== productId) : [productId, ...get().wishlist] });
        return !has;
      },
      pushRecent: (productId) =>
        set({ recent: [productId, ...get().recent.filter((id) => id !== productId)].slice(0, 8) }),
      applyPromo: (code) => set({ promo: code }),
      placeOrder: (order) =>
        set({
          orders: [order, ...get().orders],
          // Credit leaves the wallet as a debit row the moment it is spent.
          creditSpends: order.credit
            ? [...get().creditSpends, { id: `spend-${order.id}`, orderId: order.id, amount: order.credit, at: order.createdAt }]
            : get().creditSpends,
        }),
      login: (name, email) => {
        const { pendingInvite, referredBy, referrals } = get();
        set({
          user: { name, email },
          // A link clicked before signup is honoured here, not lost.
          referredBy: referredBy ?? (pendingInvite && pendingInvite.code !== codeFor(name, email) ? pendingInvite.code : null),
          pendingInvite: null,
          // Give a fresh account a believable history so the dashboard has something to show.
          referrals: referrals.length ? referrals : seedReferrals(email, Date.now()),
        });
      },
      logout: () => set({ user: null }),

      captureInvite: (code, source = "link") =>
        set({ pendingInvite: { code: code.trim().toUpperCase(), at: new Date().toISOString(), source } }),

      acceptInvite: (code, source = "link") => {
        const clean = code.trim().toUpperCase();
        const { user, referredBy, pendingInvite, orders } = get();
        const reason = evaluateInvite(clean, {
          ownCode: myCode(user),
          referredBy,
          pendingCode: pendingInvite?.code ?? null,
          hasOrders: orders.length > 0,
        });
        if (reason) return reason;
        // Signed in: bind it now. Otherwise park it until they create an account.
        if (user) set({ referredBy: clean, pendingInvite: null });
        else if (pendingInvite?.code !== clean) get().captureInvite(clean, source);
        return null;
      },

      dismissInvite: () => set({ pendingInvite: null }),

      applyCredit: (amount) => set({ creditApplied: Math.max(0, Math.round(amount)) }),

      simulateInvite: (name, source) =>
        set({
          referrals: [
            {
              id: `ref-sim-${Date.now().toString(36)}`,
              name,
              email: `${name.split(" ")[0].toLowerCase()}@mail.pk`,
              joinedAt: new Date().toISOString(),
              source,
            },
            ...get().referrals,
          ],
        }),

      simulateConversion: (id) =>
        set({
          referrals: get().referrals.map((r) =>
            r.id === id && !r.order
              ? { ...r, order: { id: `FRL-${Math.floor(10000 + Math.random() * 89999)}`, total: 2400 + Math.floor(Math.random() * 45) * 100, placedAt: new Date().toISOString() } }
              : r,
          ),
        }),
    }),
    {
      name: "frostly-shop",
      version: 2,
      migrate: (state, from) =>
        from < 2
          ? { ...(state as ShopState), referrals: [], referredBy: null, pendingInvite: null, creditSpends: [], creditApplied: 0 }
          : (state as ShopState),
    },
  ),
);

/** UI-only state that should not be persisted. */
interface UIState {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  toasts: { id: number; title: string; body?: string; image?: string }[];
  toast: (t: { title: string; body?: string; image?: string }) => void;
  dismiss: (id: number) => void;
}

export const useUI = create<UIState>()((set, get) => ({
  cartOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  toasts: [],
  toast: (t) => {
    const id = Date.now() + Math.random();
    set({ toasts: [...get().toasts, { id, ...t }].slice(-3) });
    setTimeout(() => get().dismiss(id), 3200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

const noopSubscribe = () => () => {};

/** Persisted state is only available after mount; use this to avoid hydration mismatches. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/**
 * One shared clock per interval, living outside React. Components subscribe to
 * it rather than each running their own timer, so ten countdowns on a page
 * still tick off a single `setInterval`.
 */
const clocks = new Map<number, { subscribe: (cb: () => void) => () => void; get: () => number }>();

function getClock(intervalMs: number) {
  const existing = clocks.get(intervalMs);
  if (existing) return existing;

  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setInterval> | null = null;
  let value = Date.now();

  const clock = {
    get: () => value,
    subscribe: (cb: () => void) => {
      listeners.add(cb);
      timer ??= setInterval(() => {
        value = Date.now();
        listeners.forEach((l) => l());
      }, intervalMs);
      return () => {
        listeners.delete(cb);
        if (listeners.size === 0 && timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
  };
  clocks.set(intervalMs, clock);
  return clock;
}

/**
 * A ticking clock for time-derived UI (reward countdowns, delivery stages).
 * Null on the server and during hydration, so both renders always agree.
 */
export function useNow(intervalMs = 1000): number | null {
  const clock = getClock(intervalMs);
  return useSyncExternalStore<number | null>(clock.subscribe, clock.get, () => null);
}

/**
 * Referral standing derived on a coarse tick — the balance only ever changes
 * when a holding period elapses, so a 30s clock is plenty and keeps the cart
 * from re-rendering every second.
 */
export function useWallet() {
  const now = useNow(30_000);
  const referrals = useShop((s) => s.referrals);
  const creditSpends = useShop((s) => s.creditSpends);
  return useMemo(() => {
    if (now === null) return null;
    const summary = summarize(referrals, now);
    return { summary, wallet: buildWallet(summary, creditSpends, now) };
  }, [referrals, creditSpends, now]);
}

/** True while this account still qualifies for the friend-side invite discount. */
export function useInviteEligible() {
  return useShop((s) => !!(s.referredBy ?? s.pendingInvite) && s.orders.length === 0);
}

export interface Line {
  item: CartItem;
  product: Product;
  variant: Variant;
  lineTotal: number;
}

export function resolveLines(cart: CartItem[]): Line[] {
  return cart.flatMap((item) => {
    const product = getProductById(item.productId);
    const variant = product?.variants[item.variant];
    return product && variant ? [{ item, product, variant, lineTotal: variant.price * item.qty }] : [];
  });
}

/**
 * `inviteEligible` is the friend side of the referral: a customer who arrived
 * on an invite link gets a one-off discount on their first qualifying order.
 */
export function computeTotals(lines: Line[], promoCode: string | null, credit = 0, inviteEligible = false) {
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const savings = lines.reduce((s, l) => s + ((l.variant.compareAt ?? l.variant.price) - l.variant.price) * l.item.qty, 0);
  const promo = PROMOS.find((p) => p.code === promoCode);
  const promoValid = !!promo && subtotal >= promo.min;
  let discount = 0;
  if (promoValid && promo.kind === "percent") discount = Math.round((subtotal * promo.value) / 100);
  if (promoValid && promo.kind === "flat") discount = promo.value;
  const freeShip = subtotal >= FREE_SHIPPING_AT || (promoValid && promo.kind === "shipping");
  const delivery = subtotal === 0 || freeShip ? 0 : DELIVERY_FEE;
  const inviteDiscount = inviteEligible && subtotal >= REFERRAL.friendMinSpend ? REFERRAL.friendDiscount : 0;
  // Credit is capped at half the basket and can never eat into the delivery fee.
  const creditUsed = Math.min(maxCreditFor(subtotal, credit), Math.max(0, subtotal - discount - inviteDiscount));
  return {
    subtotal,
    savings,
    discount,
    inviteDiscount,
    /** How much more is needed before the invite discount kicks in. */
    inviteShortfall: inviteEligible && !inviteDiscount ? REFERRAL.friendMinSpend - subtotal : 0,
    creditUsed,
    creditCap: maxCreditFor(subtotal, Infinity),
    delivery,
    total: Math.max(0, subtotal - discount - inviteDiscount - creditUsed + delivery),
    promo: promoValid ? promo : undefined,
    promoError: promo && !promoValid ? `Add Rs. ${promo.min - subtotal} more to use ${promo.code}` : undefined,
    toFreeShipping: Math.max(0, FREE_SHIPPING_AT - subtotal),
    count: lines.reduce((s, l) => s + l.item.qty, 0),
  };
}
