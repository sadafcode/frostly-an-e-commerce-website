"use client";

import { useState } from "react";
import { products } from "@/lib/products";
import { ProductCard } from "../ProductCard";
import { cn } from "@/lib/format";

const tabs = [
  { key: "all", label: "All" },
  { key: "frozen", label: "Frozen Foods" },
  { key: "kitchen", label: "Kitchen" },
] as const;

export function BestsellerTabs() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("all");
  const list = products
    .filter((p) => tab === "all" || p.store === tab)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 8);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition",
              tab === t.key ? "bg-fg text-bg" : "border border-line bg-surface hover:bg-surface-2",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div key={tab} className="mt-8 grid animate-fade-up grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </>
  );
}
