"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Eye, Heart, Minus, Plus, Share2, ShieldCheck, Snowflake, Truck, Undo2 } from "lucide-react";
import { tagLabels, type Product } from "@/lib/products";
import { MAX_QTY, useHydrated, useShop, useUI } from "@/lib/store";
import { cn, discountPercent, formatPrice, img } from "@/lib/format";
import { Rating } from "@/components/Rating";

export function PurchasePanel({ product, categoryName, bundleWith }: { product: Product; categoryName: string; bundleWith: Product[] }) {
  const hydrated = useHydrated();
  const [variant, setVariant] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart, toggleWishlist, pushRecent } = useShop();
  const wished = useShop((s) => s.wishlist.includes(product.id));
  const { toast, setCartOpen } = useUI();
  const v = product.variants[variant];
  const off = discountPercent(v.price, v.compareAt);
  const viewers = 8 + (Number(product.id.slice(1)) * 7) % 23;

  useEffect(() => { pushRecent(product.id); }, [product.id, pushRecent]);

  const add = () => {
    addToCart(product.id, variant, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    toast({ title: "Added to cart", body: `${qty} × ${product.name} · ${v.label}`, image: product.image });
  };

  const bundleTotal = v.price + bundleWith.reduce((s, p) => s + p.variants[0].price, 0);

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-frost-600 dark:text-frost-300">{categoryName}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-tight md:text-5xl">{product.name}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <a href="#reviews"><Rating value={product.rating} count={product.reviews} size="md" /></a>
        <span className="text-sm text-muted">{product.sold.toLocaleString()} sold</span>
      </div>
      <p className="mt-4 text-lg text-muted">{product.short}</p>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="font-display text-4xl font-semibold">{formatPrice(v.price)}</span>
        {v.compareAt && <span className="text-lg text-muted line-through">{formatPrice(v.compareAt)}</span>}
        {off > 0 && <span className="rounded-full bg-ember-500 px-2.5 py-1 text-xs font-bold text-white">Save {off}%</span>}
      </div>
      <p className="mt-1 text-xs text-muted">Inclusive of all taxes · or 3 interest-free payments of {formatPrice(Math.ceil(v.price / 3))}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {product.tags.filter((t) => t !== "bestseller").map((t) => (
          <span key={t} className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold">{tagLabels[t]}</span>
        ))}
      </div>

      {product.variants.length > 1 && (
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">{product.store === "frozen" ? "Pack size" : "Option"}: <span className="text-muted">{v.label}</span></legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((opt, i) => (
              <button key={opt.label} onClick={() => setVariant(i)} aria-pressed={i === variant}
                className={cn("rounded-2xl border-2 px-4 py-2.5 text-left transition", i === variant ? "border-frost-600 bg-frost-50 dark:bg-frost-900/40" : "border-line hover:border-muted")}>
                <span className="block text-sm font-semibold">{opt.label}</span>
                <span className="block text-xs text-muted">{formatPrice(opt.price)}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-line bg-surface">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3.5" aria-label="Decrease quantity"><Minus className="size-4" /></button>
          <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} className="p-3.5" aria-label="Increase quantity"><Plus className="size-4" /></button>
        </div>
        <button onClick={add} className={cn("flex min-w-48 flex-1 items-center justify-center gap-2 rounded-full py-4 font-semibold text-white shadow-xl transition active:scale-[0.98]", added ? "bg-emerald-600 shadow-emerald-600/25" : "bg-frost-600 shadow-frost-600/25 hover:bg-frost-700")}>
          {added ? <><Check className="size-5" /> Added!</> : <>Add to cart · {formatPrice(v.price * qty)}</>}
        </button>
        <button
          onClick={() => { const on = toggleWishlist(product.id); toast({ title: on ? "Saved to wishlist" : "Removed from wishlist", body: product.name }); }}
          className="grid size-13 place-items-center rounded-full border border-line bg-surface transition hover:bg-surface-2"
          aria-label="Toggle wishlist"
          aria-pressed={hydrated && wished}
        >
          <Heart className={cn("size-5", hydrated && wished && "fill-ember-500 text-ember-500")} />
        </button>
        <button
          onClick={async () => {
            try {
              if (navigator.share) await navigator.share({ title: product.name, url: location.href });
              else { await navigator.clipboard.writeText(location.href); toast({ title: "Link copied", body: "Share it with friends & family" }); }
            } catch {}
          }}
          className="grid size-13 place-items-center rounded-full border border-line bg-surface transition hover:bg-surface-2"
          aria-label="Share product"
        >
          <Share2 className="size-5" />
        </button>
      </div>
      <button onClick={() => { add(); setCartOpen(true); }} className="mt-3 w-full rounded-full border-2 border-fg py-3.5 font-semibold transition hover:bg-fg hover:text-bg">
        Buy it now
      </button>

      <div className="mt-5 space-y-2 text-sm">
        {product.stock <= 10 ? (
          <p className="font-semibold text-ember-600">🔥 Hurry — only {product.stock} left in stock</p>
        ) : (
          <p className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400"><span className="size-2 rounded-full bg-emerald-500" /> In stock, ready to dispatch</p>
        )}
        <p className="flex items-center gap-2 text-muted"><Eye className="size-4" /> {viewers} people are viewing this right now</p>
      </div>

      <div className="mt-6 grid gap-3 rounded-3xl border border-line bg-surface p-5 sm:grid-cols-3">
        {[
          { icon: product.store === "frozen" ? Snowflake : Truck, title: product.store === "frozen" ? "Cold-chain -18°C" : "Free over Rs. 3,000", body: product.store === "frozen" ? "Insulated box delivery" : "Delivered with your groceries" },
          { icon: ShieldCheck, title: product.store === "frozen" ? "HFA Halal" : "Official warranty", body: product.store === "frozen" ? "Certified every batch" : product.specs?.Warranty ?? "Manufacturer backed" },
          { icon: Undo2, title: product.store === "frozen" ? "Freshness promise" : "7-day returns", body: product.store === "frozen" ? "Replace if not frozen" : "Easy doorstep pickup" },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3 sm:flex-col sm:gap-2">
            <Icon className="size-5 shrink-0 text-frost-600 dark:text-frost-300" />
            <div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-muted">{body}</p></div>
          </div>
        ))}
      </div>

      {bundleWith.length > 0 && (
        <div className="mt-6 rounded-3xl border border-line bg-surface p-5">
          <p className="font-semibold">{product.store === "frozen" ? "Cook it better with" : "Pairs perfectly with"}</p>
          <div className="mt-4 flex items-center gap-2">
            {[product, ...bundleWith].map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                {i > 0 && <Plus className="size-4 text-muted" />}
                <Link href={`/product/${p.slug}`} className="relative size-16 overflow-hidden rounded-2xl bg-surface-2" title={p.name}>
                  <Image src={img(p.image, 200)} alt={p.name} fill sizes="64px" className="object-cover" />
                </Link>
              </div>
            ))}
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {bundleWith.map((p) => (
              <li key={p.id} className="flex justify-between gap-2"><Link href={`/product/${p.slug}`} className="truncate hover:underline">{p.name}</Link><span className="font-semibold">{formatPrice(p.variants[0].price)}</span></li>
            ))}
          </ul>
          <button
            onClick={() => {
              addToCart(product.id, variant, 1);
              bundleWith.forEach((p) => addToCart(p.id, 0, 1));
              toast({ title: "Added to cart", body: `${bundleWith.length + 1} items · ${formatPrice(bundleTotal)}` });
              setCartOpen(true);
            }}
            className="mt-4 w-full rounded-full bg-fg py-3 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            Add all {bundleWith.length + 1} · {formatPrice(bundleTotal)}
          </button>
        </div>
      )}
    </div>
  );
}
