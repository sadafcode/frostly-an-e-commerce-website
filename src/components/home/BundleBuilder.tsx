"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { getProduct } from "@/lib/products";
import { useShop, useUI } from "@/lib/store";
import { cn, formatPrice, img } from "@/lib/format";

const BUNDLE_OFF = 0.12;
const slugs = ["crispy-chicken-nuggets", "masala-crinkle-fries", "chicken-seekh-kebab", "granite-non-stick-wok"];

export function BundleBuilder() {
  const items = slugs.map((s) => getProduct(s)!).filter(Boolean);
  const [picked, setPicked] = useState<string[]>(items.map((p) => p.id));
  const addToCart = useShop((s) => s.addToCart);
  const applyPromo = useShop((s) => s.applyPromo);
  const { toast, setCartOpen } = useUI();

  const chosen = items.filter((p) => picked.includes(p.id));
  const full = chosen.reduce((s, p) => s + p.variants[0].price, 0);
  const qualifies = chosen.length >= 3;
  const price = qualifies ? Math.round(full * (1 - BUNDLE_OFF)) : full;

  return (
    <div className="grid gap-8 rounded-[2rem] border border-line bg-surface p-6 md:p-10 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-ember-500">Build your bundle</p>
        <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Friday Movie Night Box</h2>
        <p className="mt-2 text-muted">Pick 3 or more and save 12% instantly — frozen favourites plus the wok to cook them in.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((p) => {
            const on = picked.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => setPicked(on ? picked.filter((id) => id !== p.id) : [...picked, p.id])}
                aria-pressed={on}
                className={cn("group relative overflow-hidden rounded-2xl border-2 text-left transition", on ? "border-frost-500" : "border-line opacity-60 hover:opacity-100")}
              >
                <div className="relative aspect-square">
                  <Image src={img(p.image, 300)} alt={p.name} fill sizes="200px" className="object-cover" />
                </div>
                <span className={cn("absolute right-2 top-2 grid size-6 place-items-center rounded-full", on ? "bg-frost-600 text-white" : "bg-white text-frost-900")}>
                  {on ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                </span>
                <div className="p-2.5">
                  <p className="line-clamp-1 text-xs font-semibold">{p.name}</p>
                  <p className="text-xs text-muted">{formatPrice(p.variants[0].price)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-frost-600 to-frost-900 p-6 text-white md:p-8">
        <p className="text-sm opacity-80">{chosen.length} item{chosen.length === 1 ? "" : "s"} selected</p>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="font-display text-4xl font-semibold">{formatPrice(price)}</span>
          {qualifies && <span className="text-lg line-through opacity-60">{formatPrice(full)}</span>}
        </div>
        <p className="mt-2 text-sm">
          {qualifies ? <span className="rounded-full bg-emerald-400/20 px-3 py-1 font-semibold text-emerald-200">You save {formatPrice(full - price)}</span> : `Add ${3 - chosen.length} more to unlock 12% off`}
        </p>
        <button
          disabled={chosen.length === 0}
          onClick={() => {
            chosen.forEach((p) => addToCart(p.id, 0, 1));
            if (qualifies) applyPromo("BUNDLE12");
            toast({ title: "Bundle added to cart", body: `${chosen.length} items` });
            setCartOpen(true);
          }}
          className="mt-6 rounded-full bg-white py-3.5 font-semibold text-frost-900 transition hover:bg-frost-50 disabled:opacity-50"
        >
          Add bundle to cart
        </button>
        <p className="mt-3 text-center text-xs opacity-70">Code BUNDLE12 is applied to your cart automatically.</p>
      </div>
    </div>
  );
}
