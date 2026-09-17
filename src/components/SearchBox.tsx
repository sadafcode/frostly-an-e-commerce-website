"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { categories, products } from "@/lib/products";
import { cn, formatPrice, img } from "@/lib/format";

export function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((p) => {
        const cat = categories.find((c) => c.slug === p.category)?.name ?? "";
        return `${p.name} ${cat} ${p.short} ${p.tags.join(" ")}`.toLowerCase().includes(term);
      })
      .slice(0, 6);
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(target.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    inputRef.current?.blur();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) go(`/product/${results[active].slug}`);
      else if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => { setQ(e.target.value); setActive(0); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        placeholder="Search nuggets, kebabs, cookware…"
        className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-10 text-sm outline-none transition placeholder:text-muted focus:border-frost-400 focus:ring-4 focus:ring-frost-400/15"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-label="Search products"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line px-1.5 text-[10px] text-muted md:block">/</kbd>

      {open && q.trim() && (
        <div id={listId} role="listbox" className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted">No matches for “{q}”. Try “chicken” or “pan”.</p>
          ) : (
            <>
              {results.map((p, i) => (
                <button
                  key={p.id}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(`/product/${p.slug}`)}
                  className={cn("flex w-full items-center gap-3 px-3 py-2.5 text-left", i === active && "bg-surface-2")}
                >
                  <Image src={img(p.image, 120)} alt="" width={40} height={40} className="size-10 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.name}</span>
                    <span className="block text-xs text-muted">{p.store === "frozen" ? "Frozen Foods" : "Kitchen Essentials"}</span>
                  </span>
                  <span className="text-sm font-bold">{formatPrice(p.variants[0].price)}</span>
                </button>
              ))}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(`/shop?q=${encodeURIComponent(q.trim())}`)}
                className="w-full border-t border-line px-4 py-3 text-left text-sm font-semibold text-frost-600 hover:bg-surface-2 dark:text-frost-300"
              >
                See all results for “{q}” →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
