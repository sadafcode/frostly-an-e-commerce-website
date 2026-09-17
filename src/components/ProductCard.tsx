"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame, Heart, Leaf, Plus, Snowflake } from "lucide-react";
import type { Product } from "@/lib/products";
import { useHydrated, useShop, useUI } from "@/lib/store";
import { cn, discountPercent, formatPrice, img } from "@/lib/format";
import { Rating } from "./Rating";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const hydrated = useHydrated();
  const wished = useShop((s) => s.wishlist.includes(product.id));
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const addToCart = useShop((s) => s.addToCart);
  const { toast, setCartOpen } = useUI();
  const v = product.variants[0];
  const off = discountPercent(v.price, v.compareAt);
  const lowStock = product.stock <= 10;

  const add = () => {
    addToCart(product.id, 0, 1);
    toast({ title: "Added to cart", body: `${product.name} · ${v.label}`, image: product.image });
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-frost-900/5">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-surface-2">
        <Image
          src={img(product.image, 600)}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {off > 0 && <span className="rounded-full bg-ember-500 px-2.5 py-1 text-[11px] font-bold text-white">-{off}%</span>}
          {product.tags.includes("bestseller") && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-frost-900">★ Bestseller</span>}
          {product.tags.includes("new") && <span className="rounded-full bg-frost-600 px-2.5 py-1 text-[11px] font-bold text-white">New</span>}
        </div>
        {product.store === "frozen" && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-frost-900/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
            <Snowflake className="size-3" /> -18°C
          </span>
        )}
      </Link>
      <button
        onClick={() => {
          const added = toggleWishlist(product.id);
          toast({ title: added ? "Saved to wishlist" : "Removed from wishlist", body: product.name });
        }}
        className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-frost-900 shadow backdrop-blur transition hover:scale-110"
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={hydrated && wished}
      >
        <Heart className={cn("size-4.5 transition", hydrated && wished && "fill-ember-500 text-ember-500")} />
      </button>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {product.tags.includes("halal") && <span className="text-emerald-600 dark:text-emerald-400">Halal</span>}
          {product.tags.includes("spicy") && <span className="inline-flex items-center gap-0.5 text-ember-600"><Flame className="size-3" />Spicy</span>}
          {product.tags.includes("veg") && <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400"><Leaf className="size-3" />Veg</span>}
          {product.store === "kitchen" && <span>Kitchen</span>}
        </div>
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 font-semibold leading-snug hover:text-frost-600 dark:hover:text-frost-300">
          {product.name}
        </Link>
        <div className="mt-1.5"><Rating value={product.rating} count={product.reviews} /></div>
        {lowStock && <p className="mt-2 text-xs font-semibold text-ember-600">Only {product.stock} left — order soon</p>}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-xs text-muted">{v.label}</p>
            <p className="flex items-baseline gap-1.5">
              <span className="whitespace-nowrap text-base font-bold sm:text-lg">{formatPrice(v.price)}</span>
              {v.compareAt && <span className="hidden whitespace-nowrap text-xs text-muted line-through sm:inline">{formatPrice(v.compareAt)}</span>}
            </p>
          </div>
          <button
            onClick={add}
            onDoubleClick={() => setCartOpen(true)}
            className="grid size-10 shrink-0 place-items-center rounded-2xl sm:size-11 bg-frost-600 text-white shadow-lg shadow-frost-600/25 transition hover:bg-frost-700 active:scale-95"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="skeleton aspect-square" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton mt-4 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
