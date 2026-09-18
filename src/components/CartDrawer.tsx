"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { computeTotals, resolveLines, useInviteEligible, useShop, useUI } from "@/lib/store";
import { formatPrice, img } from "@/lib/format";
import { FreeShippingBar } from "./FreeShippingBar";

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI();
  const cart = useShop((s) => s.cart);
  const promo = useShop((s) => s.promo);
  const { setQty, removeFromCart } = useShop();
  const creditApplied = useShop((s) => s.creditApplied);
  const inviteEligible = useInviteEligible();
  const lines = resolveLines(cart);
  const totals = computeTotals(lines, promo, creditApplied, inviteEligible);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="font-display text-2xl font-semibold">Your cart <span className="text-base text-muted">({totals.count})</span></h2>
          <button onClick={() => setCartOpen(false)} className="rounded-full p-2 hover:bg-surface-2" aria-label="Close cart"><X className="size-5" /></button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid size-20 place-items-center rounded-full bg-frost-50 dark:bg-frost-900/40"><ShoppingBag className="size-9 text-frost-500" /></div>
            <p className="font-display text-xl font-semibold">Your cart is feeling a little empty</p>
            <p className="text-sm text-muted">Stock your freezer with bestsellers loved by 50,000+ families.</p>
            <Link href="/shop" onClick={() => setCartOpen(false)} className="rounded-full bg-frost-600 px-6 py-3 font-semibold text-white hover:bg-frost-700">Start shopping</Link>
          </div>
        ) : (
          <>
            <div className="p-5 pb-0"><FreeShippingBar subtotal={totals.subtotal} /></div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map(({ item, product, variant, lineTotal }) => (
                <li key={item.key} className="flex gap-4 py-4">
                  <Link href={`/product/${product.slug}`} onClick={() => setCartOpen(false)} className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
                    <Image src={img(product.image, 200)} alt={product.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="truncate font-semibold">{product.name}</p>
                      <button onClick={() => removeFromCart(item.key)} className="text-muted hover:text-ember-600" aria-label={`Remove ${product.name}`}><Trash2 className="size-4" /></button>
                    </div>
                    <p className="text-xs text-muted">{variant.label}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line">
                        <button onClick={() => setQty(item.key, item.qty - 1)} className="p-2" aria-label="Decrease quantity"><Minus className="size-3.5" /></button>
                        <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                        <button onClick={() => setQty(item.key, item.qty + 1)} className="p-2" aria-label="Increase quantity"><Plus className="size-3.5" /></button>
                      </div>
                      <p className="font-bold">{formatPrice(lineTotal)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-line p-5">
              {totals.savings > 0 && (
                <p className="flex justify-between text-sm text-emerald-700 dark:text-emerald-400"><span>You’re saving</span><span className="font-semibold">{formatPrice(totals.savings)}</span></p>
              )}
              <p className="flex justify-between text-lg font-bold"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></p>
              <p className="text-xs text-muted">Delivery & promo codes calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={() => setCartOpen(false)} className="rounded-full border border-line py-3 text-center font-semibold hover:bg-surface-2">View cart</Link>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="rounded-full bg-frost-600 py-3 text-center font-semibold text-white hover:bg-frost-700">Checkout</Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
