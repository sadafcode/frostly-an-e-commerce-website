"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, CheckCircle2, ChefHat, ThumbsUp } from "lucide-react";
import type { Product, reviewsFor } from "@/lib/products";
import { cn } from "@/lib/format";
import { Rating } from "@/components/Rating";

type Review = ReturnType<typeof reviewsFor>[number];

export function ProductTabs({ product, reviews }: { product: Product; reviews: Review[] }) {
  const tabs = [
    { key: "details", label: "Details" },
    product.nutrition && { key: "nutrition", label: "Nutrition" },
    product.cooking && { key: "cooking", label: "Cooking guide" },
    product.specs && { key: "specs", label: "Specifications" },
    { key: "reviews", label: `Reviews (${product.reviews.toLocaleString()})` },
  ].filter(Boolean) as { key: string; label: string }[];
  const [tab, setTab] = useState("details");
  const [helpful, setHelpful] = useState<string[]>([]);

  useEffect(() => {
    const onHash = () => { if (location.hash === "#reviews") setTab("reviews"); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Rating distribution derived from the average so the bars look consistent with the score.
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const weight = Math.exp(-Math.abs(product.rating - star) * 1.6);
    return { star, weight };
  });
  const totalWeight = dist.reduce((s, d) => s + d.weight, 0);

  return (
    <section id="reviews" className="mt-16 scroll-mt-28">
      <div className="flex gap-1 overflow-x-auto border-b border-line no-scrollbar" role="tablist">
        {tabs.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={cn("relative shrink-0 px-5 py-4 text-sm font-semibold transition", tab === t.key ? "text-fg" : "text-muted hover:text-fg")}>
            {t.label}
            {tab === t.key && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-frost-600" />}
          </button>
        ))}
      </div>

      <div key={tab} className="animate-fade-up py-8" role="tabpanel">
        {tab === "details" && (
          <div className="grid gap-10 md:grid-cols-2">
            <p className="leading-relaxed text-muted">{product.description}</p>
            <ul className="space-y-3">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />{h}</li>
              ))}
              {product.store === "frozen" && <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />Store at -18°C. Do not refreeze once thawed.</li>}
            </ul>
          </div>
        )}

        {tab === "nutrition" && product.nutrition && (
          <div className="max-w-md rounded-3xl border-2 border-fg p-6">
            <p className="font-display text-3xl font-semibold">Nutrition Facts</p>
            <p className="border-b-8 border-fg pb-2 text-sm">Per serving ({product.nutrition.serving})</p>
            {[["Calories", `${product.nutrition.calories} kcal`], ["Protein", `${product.nutrition.protein} g`], ["Carbohydrates", `${product.nutrition.carbs} g`], ["Total Fat", `${product.nutrition.fat} g`]].map(([k, val]) => (
              <p key={k} className="flex justify-between border-b border-line py-2.5 font-semibold"><span>{k}</span><span>{val}</span></p>
            ))}
            <p className="mt-3 text-xs text-muted">Values are approximate. Allergens: may contain wheat, soy, milk and egg.</p>
          </div>
        )}

        {tab === "cooking" && product.cooking && (
          <div className="grid gap-4 md:grid-cols-3">
            {product.cooking.map((c) => (
              <div key={c.method} className="rounded-3xl border border-line bg-surface p-6">
                <ChefHat className="size-6 text-frost-600 dark:text-frost-300" />
                <p className="mt-3 font-semibold">{c.method}</p>
                <p className="text-sm font-semibold text-ember-600">{c.time}</p>
                <p className="mt-2 text-sm text-muted">{c.steps}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "specs" && product.specs && (
          <dl className="max-w-xl divide-y divide-line rounded-3xl border border-line bg-surface">
            {Object.entries(product.specs).map(([k, val]) => (
              <div key={k} className="flex justify-between gap-4 px-6 py-4"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{val}</dd></div>
            ))}
          </dl>
        )}

        {tab === "reviews" && (
          <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
            <div>
              <p className="font-display text-6xl font-semibold">{product.rating.toFixed(1)}</p>
              <Rating value={product.rating} size="md" />
              <p className="mt-1 text-sm text-muted">Based on {product.reviews.toLocaleString()} verified reviews</p>
              <div className="mt-6 space-y-2">
                {dist.map((d) => {
                  const pct = Math.round((d.weight / totalWeight) * 100);
                  return (
                    <div key={d.star} className="flex items-center gap-3 text-sm">
                      <span className="w-8">{d.star}★</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} /></div>
                      <span className="w-10 text-right text-muted">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-3xl border border-line bg-surface p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-frost-400 to-frost-700 font-semibold text-white">{r.name[0]}</span>
                      <div>
                        <p className="font-semibold">{r.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted"><BadgeCheck className="size-3.5 text-emerald-500" /> Verified purchase · {r.city}</p>
                      </div>
                    </div>
                    <time className="text-xs text-muted" dateTime={r.date}>{new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time>
                  </div>
                  <div className="mt-3"><Rating value={r.rating} /></div>
                  <p className="mt-2 leading-relaxed">{r.body}</p>
                  <button
                    onClick={() => setHelpful((h) => (h.includes(r.id) ? h.filter((x) => x !== r.id) : [...h, r.id]))}
                    className={cn("mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition", helpful.includes(r.id) ? "border-frost-600 bg-frost-50 text-frost-700 dark:bg-frost-900/40 dark:text-frost-200" : "border-line text-muted hover:text-fg")}
                  >
                    <ThumbsUp className="size-3.5" /> Helpful ({Number(r.id.slice(-1)) * 5 + 3 + (helpful.includes(r.id) ? 1 : 0)})
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
