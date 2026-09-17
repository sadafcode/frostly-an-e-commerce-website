"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { getProductById } from "@/lib/products";
import { useHydrated, useShop, useUI } from "@/lib/store";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";

export function WishlistView() {
  const hydrated = useHydrated();
  const wishlist = useShop((s) => s.wishlist);
  const addToCart = useShop((s) => s.addToCart);
  const { toast, setCartOpen } = useUI();
  const items = wishlist.map(getProductById).filter((p) => !!p);

  return (
    <div className="container-x py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-4xl font-semibold md:text-5xl">Your wishlist</h1>
          <p className="mt-2 text-muted">{hydrated ? `${items.length} saved item${items.length === 1 ? "" : "s"}` : "Loading…"}</p>
        </div>
        {hydrated && items.length > 0 && (
          <button
            onClick={() => { items.forEach((p) => addToCart(p.id)); toast({ title: "Added to cart", body: `${items.length} wishlist items` }); setCartOpen(true); }}
            className="rounded-full bg-frost-600 px-6 py-3 font-semibold text-white hover:bg-frost-700"
          >
            Add all to cart
          </button>
        )}
      </div>

      {!hydrated ? (
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-line p-16 text-center">
          <Heart className="mx-auto size-12 text-muted" />
          <p className="mt-4 font-display text-2xl font-semibold">Nothing saved yet</p>
          <p className="mt-2 text-muted">Tap the heart on any product to save it for later.</p>
          <Link href="/shop" className="mt-6 inline-block rounded-full bg-frost-600 px-6 py-3 font-semibold text-white">Explore products</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}
