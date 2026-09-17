"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { computeTotals, PROMOS, useShop, type Line } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export function PromoInput() {
  const promo = useShop((s) => s.promo);
  const applyPromo = useShop((s) => s.applyPromo);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (promo) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-emerald-500 bg-emerald-500/10 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300"><Tag className="size-4" /> {promo} applied</span>
        <button onClick={() => applyPromo(null)} aria-label="Remove promo code" className="text-muted hover:text-fg"><X className="size-4" /></button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const found = PROMOS.find((p) => p.code === code.trim().toUpperCase());
        if (!found) return setError("That code isn’t valid. Try WELCOME10.");
        applyPromo(found.code);
        setCode("");
        setError("");
      }}
    >
      <div className="flex gap-2">
        <input value={code} onChange={(e) => { setCode(e.target.value); setError(""); }} placeholder="Promo code" aria-label="Promo code"
          className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2.5 text-sm uppercase outline-none placeholder:normal-case focus:border-frost-400" />
        <button className="rounded-full bg-fg px-5 text-sm font-semibold text-bg">Apply</button>
      </div>
      {error && <p className="mt-2 text-xs text-ember-600">{error}</p>}
      <p className="mt-2 text-xs text-muted">Try: {PROMOS.filter((p) => p.code !== "BUNDLE12").map((p) => p.code).join(" · ")}</p>
    </form>
  );
}

export function Totals({ lines }: { lines: Line[] }) {
  const promo = useShop((s) => s.promo);
  const t = computeTotals(lines, promo);
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between"><dt className="text-muted">Subtotal ({t.count} items)</dt><dd className="font-semibold">{formatPrice(t.subtotal)}</dd></div>
      {t.savings > 0 && <div className="flex justify-between text-emerald-700 dark:text-emerald-400"><dt>Product savings</dt><dd>-{formatPrice(t.savings)}</dd></div>}
      {t.discount > 0 && <div className="flex justify-between text-emerald-700 dark:text-emerald-400"><dt>Promo ({t.promo?.code})</dt><dd>-{formatPrice(t.discount)}</dd></div>}
      {t.promoError && <p className="text-xs text-ember-600">{t.promoError}</p>}
      <div className="flex justify-between"><dt className="text-muted">Cold-chain delivery</dt><dd className="font-semibold">{t.delivery === 0 ? <span className="text-emerald-700 dark:text-emerald-400">FREE</span> : formatPrice(t.delivery)}</dd></div>
      <div className="flex justify-between border-t border-line pt-3 text-lg font-bold"><dt>Total</dt><dd>{formatPrice(t.total)}</dd></div>
    </dl>
  );
}
