"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProductById, type Product, type Variant } from "./products";

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

interface ShopState {
  cart: CartItem[];
  wishlist: string[];
  recent: string[];
  orders: Order[];
  promo: string | null;
  user: { name: string; email: string } | null;
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
}

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      recent: [],
      orders: [],
      promo: null,
      user: null,
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
      clearCart: () => set({ cart: [], promo: null }),
      toggleWishlist: (productId) => {
        const has = get().wishlist.includes(productId);
        set({ wishlist: has ? get().wishlist.filter((id) => id !== productId) : [productId, ...get().wishlist] });
        return !has;
      },
      pushRecent: (productId) =>
        set({ recent: [productId, ...get().recent.filter((id) => id !== productId)].slice(0, 8) }),
      applyPromo: (code) => set({ promo: code }),
      placeOrder: (order) => set({ orders: [order, ...get().orders] }),
      login: (name, email) => set({ user: { name, email } }),
      logout: () => set({ user: null }),
    }),
    { name: "frostly-shop", version: 1 },
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

export function computeTotals(lines: Line[], promoCode: string | null) {
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const savings = lines.reduce((s, l) => s + ((l.variant.compareAt ?? l.variant.price) - l.variant.price) * l.item.qty, 0);
  const promo = PROMOS.find((p) => p.code === promoCode);
  const promoValid = !!promo && subtotal >= promo.min;
  let discount = 0;
  if (promoValid && promo.kind === "percent") discount = Math.round((subtotal * promo.value) / 100);
  if (promoValid && promo.kind === "flat") discount = promo.value;
  const freeShip = subtotal >= FREE_SHIPPING_AT || (promoValid && promo.kind === "shipping");
  const delivery = subtotal === 0 || freeShip ? 0 : DELIVERY_FEE;
  return {
    subtotal,
    savings,
    discount,
    delivery,
    total: Math.max(0, subtotal - discount + delivery),
    promo: promoValid ? promo : undefined,
    promoError: promo && !promoValid ? `Add Rs. ${promo.min - subtotal} more to use ${promo.code}` : undefined,
    toFreeShipping: Math.max(0, FREE_SHIPPING_AT - subtotal),
    count: lines.reduce((s, l) => s + l.item.qty, 0),
  };
}
