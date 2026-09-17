"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { categories, products, tagLabels, type Tag } from "@/lib/products";
import { cn, discountPercent, formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";

interface Filters {
  store: string;
  category: string;
  tag: string;
  q: string;
  sort: string;
}

const sorts = [
  { key: "featured", label: "Featured" },
  { key: "bestselling", label: "Best selling" },
  { key: "rating", label: "Top rated" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "discount", label: "Biggest discount" },
];

const filterTags: Tag[] = ["halal", "veg", "spicy", "air-fryer", "family-pack", "bestseller", "new"];
const PRICE_MAX = Math.ceil(Math.max(...products.map((p) => p.variants[0].price)) / 1000) * 1000;

export function ShopView({ initial }: { initial: Filters }) {
  const router = useRouter();
  const [f, setF] = useState<Filters>(initial);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [minRating, setMinRating] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [drawer, setDrawer] = useState(false);

  // Keep local filters in sync when the URL changes from elsewhere (e.g. header nav).
  const [prevInitial, setPrevInitial] = useState(initial);
  if (JSON.stringify(prevInitial) !== JSON.stringify(initial)) {
    setPrevInitial(initial);
    setF(initial);
  }

  const update = (patch: Partial<Filters>) => {
    const next = { ...f, ...patch };
    if (patch.store !== undefined && patch.category === undefined) next.category = "";
    setF(next);
    const params = new URLSearchParams();
    (Object.entries(next) as [keyof Filters, string][]).forEach(([k, v]) => {
      if (v && !(k === "sort" && v === "featured")) params.set(k, v);
    });
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  };

  const results = useMemo(() => {
    const term = f.q.trim().toLowerCase();
    const list = products.filter((p) => {
      if (f.store && p.store !== f.store) return false;
      if (f.category && p.category !== f.category) return false;
      if (f.tag && !p.tags.includes(f.tag as Tag)) return false;
      if (term && !`${p.name} ${p.short} ${p.category}`.toLowerCase().includes(term)) return false;
      if (p.variants[0].price > maxPrice) return false;
      if (p.rating < minRating) return false;
      if (inStock && p.stock <= 0) return false;
      return true;
    });
    const price = (p: (typeof products)[number]) => p.variants[0].price;
    const sorters: Record<string, (a: (typeof products)[number], b: (typeof products)[number]) => number> = {
      bestselling: (a, b) => b.sold - a.sold,
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      "price-asc": (a, b) => price(a) - price(b),
      "price-desc": (a, b) => price(b) - price(a),
      discount: (a, b) => discountPercent(b.variants[0].price, b.variants[0].compareAt) - discountPercent(a.variants[0].price, a.variants[0].compareAt),
    };
    return sorters[f.sort] ? [...list].sort(sorters[f.sort]) : list;
  }, [f, maxPrice, minRating, inStock]);

  const visibleCats = categories.filter((c) => !f.store || c.store === f.store);
  const title = f.q ? `Results for “${f.q}”` : f.store === "frozen" ? "Frozen Foods" : f.store === "kitchen" ? "Kitchen Essentials" : "Shop all products";
  const activeCat = categories.find((c) => c.slug === f.category);

  const chips = [
    f.store && { label: f.store === "frozen" ? "Frozen Foods" : "Kitchen", clear: () => update({ store: "" }) },
    activeCat && { label: activeCat.name, clear: () => update({ category: "" }) },
    f.tag && { label: tagLabels[f.tag as Tag] ?? f.tag, clear: () => update({ tag: "" }) },
    f.q && { label: `“${f.q}”`, clear: () => update({ q: "" }) },
    maxPrice < PRICE_MAX && { label: `Under ${formatPrice(maxPrice)}`, clear: () => setMaxPrice(PRICE_MAX) },
    minRating > 0 && { label: `${minRating}★ & up`, clear: () => setMinRating(0) },
    inStock && { label: "In stock", clear: () => setInStock(false) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const clearAll = () => {
    setMaxPrice(PRICE_MAX);
    setMinRating(0);
    setInStock(false);
    update({ store: "", category: "", tag: "", q: "" });
  };

  const panel = (
    <div className="space-y-8">
      <FilterGroup title="Store">
        {[["", "Everything"], ["frozen", "Frozen Foods"], ["kitchen", "Kitchen Essentials"]].map(([k, l]) => (
          <Radio key={k} checked={f.store === k} onChange={() => update({ store: k })} label={l} count={k ? products.filter((p) => p.store === k).length : products.length} />
        ))}
      </FilterGroup>
      <FilterGroup title="Category">
        <Radio checked={!f.category} onChange={() => update({ category: "" })} label="All categories" />
        {visibleCats.map((c) => (
          <Radio key={c.slug} checked={f.category === c.slug} onChange={() => update({ store: c.store, category: c.slug })} label={c.name} count={products.filter((p) => p.category === c.slug).length} />
        ))}
      </FilterGroup>
      <FilterGroup title="Max price">
        <input type="range" min={500} max={PRICE_MAX} step={500} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-frost-600" aria-label="Maximum price" />
        <div className="flex justify-between text-xs text-muted"><span>Rs. 500</span><span className="font-semibold text-fg">{formatPrice(maxPrice)}</span></div>
      </FilterGroup>
      <FilterGroup title="Dietary & features">
        <div className="flex flex-wrap gap-2">
          {filterTags.map((t) => (
            <button key={t} onClick={() => update({ tag: f.tag === t ? "" : t })} aria-pressed={f.tag === t}
              className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", f.tag === t ? "border-frost-600 bg-frost-600 text-white" : "border-line hover:bg-surface-2")}>
              {tagLabels[t]}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Customer rating">
        {[4.5, 4, 0].map((r) => (
          <Radio key={r} checked={minRating === r} onChange={() => setMinRating(r)} label={r ? `${r}★ & up` : "Any rating"} />
        ))}
      </FilterGroup>
      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-line p-3 text-sm font-semibold">
        In stock only
        <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="size-4 accent-frost-600" />
      </label>
    </div>
  );

  return (
    <div className="container-x py-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-fg">Home</Link><ChevronRight className="size-3.5" />
        <Link href="/shop" className="hover:text-fg">Shop</Link>
        {activeCat && <><ChevronRight className="size-3.5" /><span className="text-fg">{activeCat.name}</span></>}
      </nav>

      <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-4xl font-semibold md:text-5xl">{activeCat?.name ?? title}</h1>
          <p className="mt-2 text-muted">{results.length} product{results.length === 1 ? "" : "s"}{activeCat ? ` · ${activeCat.blurb}` : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDrawer(true)} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold lg:hidden">
            <SlidersHorizontal className="size-4" /> Filters {chips.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-frost-600 text-[10px] text-white">{chips.length}</span>}
          </button>
          <label className="sr-only" htmlFor="sort">Sort by</label>
          <select id="sort" value={f.sort} onChange={(e) => update({ sort: e.target.value })} className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold outline-none focus:border-frost-400">
            {sorts.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* store quick switch */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {visibleCats.map((c) => (
          <button key={c.slug} onClick={() => update({ store: c.store, category: f.category === c.slug ? "" : c.slug })}
            className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition", f.category === c.slug ? "border-fg bg-fg text-bg" : "border-line bg-surface hover:bg-surface-2")}>
            {c.name}
          </button>
        ))}
      </div>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button key={c.label} onClick={c.clear} className="inline-flex items-center gap-1 rounded-full bg-frost-50 px-3 py-1.5 text-xs font-semibold text-frost-800 dark:bg-frost-900/40 dark:text-frost-100">
              {c.label} <X className="size-3" />
            </button>
          ))}
          <button onClick={clearAll} className="text-xs font-semibold text-muted underline hover:text-fg">Clear all</button>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-28">{panel}</div></aside>
        <div>
          {results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line p-12 text-center">
              <p className="font-display text-2xl font-semibold">No products match those filters</p>
              <p className="mt-2 text-muted">Try removing a filter or searching for something else.</p>
              <button onClick={clearAll} className="mt-6 rounded-full bg-frost-600 px-6 py-3 font-semibold text-white">Reset filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
              {results.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 3} />)}
            </div>
          )}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] animate-fade-up overflow-y-auto rounded-t-[2rem] bg-surface p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Filters</h2>
              <button onClick={() => setDrawer(false)} aria-label="Close filters" className="rounded-full p-2 hover:bg-surface-2"><X className="size-5" /></button>
            </div>
            {panel}
            <button onClick={() => setDrawer(false)} className="sticky bottom-0 mt-8 w-full rounded-full bg-frost-600 py-3.5 font-semibold text-white">
              Show {results.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">{title}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}

function Radio({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count?: number }) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition", checked ? "bg-frost-50 font-semibold text-frost-800 dark:bg-frost-900/40 dark:text-frost-100" : "hover:bg-surface-2")}>
      <span className="flex items-center gap-2">
        <input type="radio" checked={checked} onChange={onChange} className="accent-frost-600" />
        {label}
      </span>
      {count !== undefined && <span className="text-xs text-muted">{count}</span>}
    </label>
  );
}
