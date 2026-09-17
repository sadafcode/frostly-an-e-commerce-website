"use client";

import { getProductById } from "@/lib/products";
import { useHydrated, useShop } from "@/lib/store";
import { ProductCard } from "./ProductCard";

export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const hydrated = useHydrated();
  const recent = useShop((s) => s.recent);
  const list = recent.filter((id) => id !== exclude).map(getProductById).filter((p) => !!p).slice(0, 4);
  if (!hydrated || list.length === 0) return null;

  return (
    <section className="container-x mt-20">
      <h2 className="font-display text-3xl font-semibold">Recently viewed</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
