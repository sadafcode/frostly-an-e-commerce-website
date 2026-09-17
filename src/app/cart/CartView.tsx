"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { computeTotals, resolveLines, useHydrated, useShop, useUI } from "@/lib/store";
import { products } from "@/lib/products";
import { formatPrice, img } from "@/lib/format";
import { FreeShippingBar } from "@/components/FreeShippingBar";
import { PromoInput, Totals } from "@/components/OrderSummary";
import { ProductCard } from "@/components/ProductCard";

export function CartView() {
  const hydrated = useHydrated();
  const { cart, promo, setQty, removeFromCart, toggleWishlist } = useShop();
  const toast = useUI((s) => s.toast);
  const lines = resolveLines(cart);
  const totals = computeTotals(lines, promo);
  const suggestions = products.filter((p) => !cart.some((c) => c.productId === p.id)).sort((a, b) => b.sold - a.sold).slice(0, 4);

  if (!hydrated) return <div className="container-x py-24"><div className="skeleton mx-auto h-64 max-w-3xl rounded-3xl" /></div>;

  if (lines.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-frost-50 dark:bg-frost-900/40"><ShoppingBag className="size-10 text-frost-500" /></div>
        <h1 className="mt-6 font-display text-4xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted">Looks like you haven’t added anything yet.</p>
        <Link href="/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-frost-600 px-7 py-4 font-semibold text-white hover:bg-frost-700">Browse products <ArrowRight className="size-4" /></Link>
        <div className="mt-20 grid grid-cols-2 gap-3 text-left sm:gap-5 lg:grid-cols-4">{suggestions.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <Steps current={0} />
      <h1 className="mt-8 font-display text-4xl font-semibold md:text-5xl">Shopping cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <FreeShippingBar subtotal={totals.subtotal} />
          <ul className="mt-6 divide-y divide-line rounded-3xl border border-line bg-surface">
            {lines.map(({ item, product, variant, lineTotal }) => (
              <li key={item.key} className="flex gap-4 p-5 sm:gap-6">
                <Link href={`/product/${product.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-surface-2 sm:size-28">
                  <Image src={img(product.image, 300)} alt={product.name} fill sizes="112px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/product/${product.slug}`} className="font-semibold hover:underline">{product.name}</Link>
                      <p className="text-sm text-muted">{variant.label} · {product.store === "frozen" ? "❄️ Cold box" : "📦 Standard box"}</p>
                    </div>
                    <p className="font-bold">{formatPrice(lineTotal)}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button onClick={() => setQty(item.key, item.qty - 1)} className="p-2.5" aria-label="Decrease quantity"><Minus className="size-4" /></button>
                      <span className="w-8 text-center font-semibold">{item.qty}</span>
                      <button onClick={() => setQty(item.key, item.qty + 1)} className="p-2.5" aria-label="Increase quantity"><Plus className="size-4" /></button>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <button onClick={() => { toggleWishlist(product.id); removeFromCart(item.key); toast({ title: "Moved to wishlist", body: product.name }); }} className="text-muted hover:text-fg hover:underline">Save for later</button>
                      <button onClick={() => removeFromCart(item.key)} className="inline-flex items-center gap-1 text-muted hover:text-ember-600"><Trash2 className="size-4" /> Remove</button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="space-y-5 rounded-3xl border border-line bg-surface p-6">
            <h2 className="font-display text-2xl font-semibold">Order summary</h2>
            <PromoInput />
            <Totals lines={lines} />
            <Link href="/checkout" className="flex items-center justify-center gap-2 rounded-full bg-frost-600 py-4 font-semibold text-white shadow-xl shadow-frost-600/25 hover:bg-frost-700">
              <Lock className="size-4" /> Secure checkout
            </Link>
            <p className="text-center text-xs text-muted">COD · Visa · Mastercard · JazzCash · Easypaisa</p>
          </div>
        </aside>
      </div>
      <section className="mt-20">
        <h2 className="font-display text-3xl font-semibold">Customers also bought</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{suggestions.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>
    </div>
  );
}

export function Steps({ current }: { current: number }) {
  const steps = ["Cart", "Details", "Delivery", "Payment"];
  return (
    <ol className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={`grid size-7 place-items-center rounded-full ${i <= current ? "bg-frost-600 text-white" : "bg-surface-2 text-muted"}`}>{i + 1}</span>
          <span className={i <= current ? "" : "text-muted"}>{s}</span>
          {i < steps.length - 1 && <span className={`h-px w-6 sm:w-12 ${i < current ? "bg-frost-600" : "bg-line"}`} />}
        </li>
      ))}
    </ol>
  );
}
