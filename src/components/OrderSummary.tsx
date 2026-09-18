"use client";

import { useState } from "react";
import { Gift, Tag, Wallet, X } from "lucide-react";
import { computeTotals, PROMOS, useInviteEligible, useShop, useWallet, type Line } from "@/lib/store";
import { maxCreditFor, REFERRAL } from "@/lib/referrals";
import { cn, formatPrice } from "@/lib/format";

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

/**
 * Redeem referral credit. The slider is capped by both the wallet balance and
 * the per-basket share, so the UI can never stage more than checkout accepts.
 */
export function CreditInput({ lines }: { lines: Line[] }) {
  const data = useWallet();
  const creditApplied = useShop((s) => s.creditApplied);
  const applyCredit = useShop((s) => s.applyCredit);
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  if (!data || data.wallet.balance <= 0) return null;
  const cap = maxCreditFor(subtotal, data.wallet.balance);
  const staged = Math.min(creditApplied, cap);

  return (
    <div className="rounded-2xl border border-frost-400 bg-frost-50 p-4 dark:border-frost-700 dark:bg-frost-900/30">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold"><Wallet className="size-4 text-frost-600 dark:text-frost-300" /> Frostly credit</span>
        <span className="text-sm font-semibold">{formatPrice(data.wallet.balance)} available</span>
      </div>
      {cap === 0 ? (
        <p className="mt-2 text-xs text-muted">Add more to your basket to use credit — it covers up to {REFERRAL.maxCreditShare * 100}% of an order.</p>
      ) : (
        <>
          <input
            type="range" min={0} max={cap} step={10} value={staged}
            onChange={(e) => applyCredit(Number(e.target.value))}
            aria-label="Referral credit to apply"
            className="mt-3 w-full accent-frost-600"
          />
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Applying <strong className="text-fg">{formatPrice(staged)}</strong> of max {formatPrice(cap)}</span>
            <button onClick={() => applyCredit(staged === cap ? 0 : cap)} className="font-semibold text-frost-600 hover:underline dark:text-frost-300">
              {staged === cap ? "Clear" : "Use max"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Totals({ lines }: { lines: Line[] }) {
  const promo = useShop((s) => s.promo);
  const creditApplied = useShop((s) => s.creditApplied);
  const inviteEligible = useInviteEligible();
  const t = computeTotals(lines, promo, creditApplied, inviteEligible);
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between"><dt className="text-muted">Subtotal ({t.count} items)</dt><dd className="font-semibold">{formatPrice(t.subtotal)}</dd></div>
      {t.savings > 0 && <div className="flex justify-between text-emerald-700 dark:text-emerald-400"><dt>Product savings</dt><dd>-{formatPrice(t.savings)}</dd></div>}
      {t.discount > 0 && <div className="flex justify-between text-emerald-700 dark:text-emerald-400"><dt>Promo ({t.promo?.code})</dt><dd>-{formatPrice(t.discount)}</dd></div>}
      {t.inviteDiscount > 0 && (
        <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
          <dt className="flex items-center gap-1.5"><Gift className="size-3.5" /> Friend invite</dt><dd>-{formatPrice(t.inviteDiscount)}</dd>
        </div>
      )}
      {t.inviteShortfall > 0 && (
        <p className={cn("text-xs text-frost-600 dark:text-frost-300")}>Add {formatPrice(t.inviteShortfall)} more to unlock your {formatPrice(REFERRAL.friendDiscount)} invite discount</p>
      )}
      {t.creditUsed > 0 && <div className="flex justify-between text-emerald-700 dark:text-emerald-400"><dt className="flex items-center gap-1.5"><Wallet className="size-3.5" /> Referral credit</dt><dd>-{formatPrice(t.creditUsed)}</dd></div>}
      {t.promoError && <p className="text-xs text-ember-600">{t.promoError}</p>}
      <div className="flex justify-between"><dt className="text-muted">Cold-chain delivery</dt><dd className="font-semibold">{t.delivery === 0 ? <span className="text-emerald-700 dark:text-emerald-400">FREE</span> : formatPrice(t.delivery)}</dd></div>
      <div className="flex justify-between border-t border-line pt-3 text-lg font-bold"><dt>Total</dt><dd>{formatPrice(t.total)}</dd></div>
    </dl>
  );
}
