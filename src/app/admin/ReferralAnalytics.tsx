"use client";

import { useMemo } from "react";
import { AlertTriangle, Share2, TrendingUp, Users, Wallet } from "lucide-react";
import { programStats, SOURCE_LABEL } from "@/lib/referrals";
import { cn, formatPrice } from "@/lib/format";

/** Programme-level view of the referral engine, for the finance/growth side. */
export function ReferralAnalytics({ now }: { now: number }) {
  // Bucketed to the hour so the roll-up isn't recomputed on every 15s tick.
  const stats = useMemo(() => programStats(Math.floor(now / 3_600_000) * 3_600_000), [now]);
  const maxDaily = Math.max(...stats.daily.map((d) => d.invites), 1);
  const maxChannel = Math.max(...stats.byChannel.map((c) => c.revenue), 1);
  const healthy = stats.kFactor >= 0.5;

  return (
    <section className="mt-6 rounded-3xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-semibold"><Share2 className="size-4 text-frost-600 dark:text-frost-300" /> Referral programme</h2>
          <p className="text-sm text-muted">{stats.referrers.toLocaleString()} active referrers · last 90 days</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold",
          healthy ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200")}>
          K-factor {stats.kFactor.toFixed(2)} · {healthy ? "healthy" : "needs a push"}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric icon={Users} label="Referred customers" value={stats.converted.toLocaleString()} note={`${stats.conversionRate.toFixed(0)}% of ${stats.invites.toLocaleString()} invites`} />
        <Metric icon={Wallet} label="Programme cost" value={formatPrice(stats.rewardCost + stats.discountCost)} note={`${formatPrice(stats.rewardCost)} rewards · ${formatPrice(stats.discountCost)} discounts`} />
        <Metric icon={TrendingUp} label="Attributed revenue" value={formatPrice(stats.attributedRevenue)} note={`${stats.roi.toFixed(1)}× return on spend`} good />
        <Metric icon={AlertTriangle} label="Cost per customer" value={formatPrice(stats.cac)} note={`${stats.fraudRate.toFixed(1)}% flagged as fraud`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h3 className="text-sm font-semibold">Invites vs conversions</h3>
          <p className="text-xs text-muted">Last 14 days</p>
          <div className="mt-4 flex h-40 items-end gap-1.5">
            {stats.daily.map((d) => (
              <div key={d.label} className="group flex h-full flex-1 flex-col justify-end gap-0.5" title={`${d.label}: ${d.invites} invites, ${d.conversions} conversions`}>
                <span className="block w-full rounded-t-[3px] bg-frost-200 dark:bg-frost-800" style={{ height: `${(Math.max(0, d.invites - d.conversions) / maxDaily) * 100}%` }} />
                <span className="block w-full rounded-t-[3px] bg-frost-600 dark:bg-frost-400" style={{ height: `${(d.conversions / maxDaily) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            <span>{stats.daily[0].label}</span><span>Today</span>
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-frost-600 dark:bg-frost-400" /> Converted</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-frost-200 dark:bg-frost-800" /> Still invited</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Revenue by share channel</h3>
          <p className="text-xs text-muted">Where the money actually comes from</p>
          <ul className="mt-4 space-y-3.5">
            {stats.byChannel.map((c) => (
              <li key={c.source}>
                <div className="flex justify-between text-sm">
                  <span>{SOURCE_LABEL[c.source]}</span>
                  <span className="font-semibold tabular-nums">{formatPrice(c.revenue)}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-frost-500 dark:bg-frost-400" style={{ width: `${(c.revenue / maxChannel) * 100}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-muted">{c.converted} of {c.invites} invites converted · {c.invites ? ((c.converted / c.invites) * 100).toFixed(0) : 0}%</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, note, good }: { icon: typeof Users; label: string; value: string; note: string; good?: boolean }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-4">
      <Icon className="size-4 text-muted" />
      <p className={cn("mt-2 font-display text-2xl font-semibold tabular-nums", good && "text-emerald-600 dark:text-emerald-400")}>{value}</p>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-0.5 text-xs text-muted">{note}</p>
    </div>
  );
}
