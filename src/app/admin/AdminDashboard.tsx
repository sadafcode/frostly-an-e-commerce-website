"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Boxes, Download, Package, Search, ShoppingCart, Wallet } from "lucide-react";
import { categories, getProductById, products } from "@/lib/products";
import { demoOrders, STAGES, stageIndex } from "@/lib/orders";
import { useHydrated, useShop, type Order } from "@/lib/store";
import { cn, formatPrice, img } from "@/lib/format";
import { ReferralAnalytics } from "./ReferralAnalytics";

const DAY = 86_400_000;

const statusStyle: Record<string, string> = {
  confirmed: "bg-surface-2 text-fg",
  packed: "bg-frost-100 text-frost-800 dark:bg-frost-900/50 dark:text-frost-100",
  dispatched: "bg-frost-100 text-frost-800 dark:bg-frost-900/50 dark:text-frost-100",
  out: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
};

export function AdminDashboard() {
  const hydrated = useHydrated();
  const myOrders = useShop((s) => s.orders);
  const [now, setNow] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 15000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, []);

  const data = useMemo(() => {
    if (now === null) return null;
    const orders: Order[] = [...myOrders, ...demoOrders(now)].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const inRange = (o: Order, from: number, to: number) => { const t = +new Date(o.createdAt); return t >= now - from * DAY && t < now - to * DAY; };
    const cur = orders.filter((o) => inRange(o, 7, 0));
    const prev = orders.filter((o) => inRange(o, 14, 7));
    const sum = (list: Order[]) => list.reduce((s, o) => s + o.total, 0);
    const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);

    const days = Array.from({ length: 14 }, (_, i) => {
      const start = new Date(now - (13 - i) * DAY);
      start.setHours(0, 0, 0, 0);
      const list = orders.filter((o) => { const t = +new Date(o.createdAt); return t >= +start && t < +start + DAY; });
      return { label: start.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), revenue: sum(list), orders: list.length };
    });

    const units = new Map<string, number>();
    const catRevenue = new Map<string, number>();
    orders.forEach((o) => o.items.forEach((it) => {
      units.set(it.productId, (units.get(it.productId) ?? 0) + it.qty);
      const cat = getProductById(it.productId)?.category ?? "other";
      catRevenue.set(cat, (catRevenue.get(cat) ?? 0) + it.price * it.qty);
    }));

    return {
      orders,
      revenue: sum(cur), revenueDelta: pct(sum(cur), sum(prev)),
      count: cur.length, countDelta: pct(cur.length, prev.length),
      aov: cur.length ? sum(cur) / cur.length : 0, aovDelta: pct(cur.length ? sum(cur) / cur.length : 0, prev.length ? sum(prev) / prev.length : 0),
      days,
      top: [...units.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => ({ product: getProductById(id)!, n })).filter((x) => x.product),
      cats: [...catRevenue.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([slug, v]) => ({ name: categories.find((c) => c.slug === slug)?.name ?? slug, v })),
    };
  }, [now, myOrders]);

  if (!hydrated || !data || now === null) {
    return <div className="container-x space-y-4 py-10">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-40 rounded-3xl" />)}</div>;
  }

  const lowStock = products.filter((p) => p.stock <= 20).sort((a, b) => a.stock - b.stock);
  const maxRevenue = Math.max(...data.days.map((d) => d.revenue), 1);
  const maxCat = Math.max(...data.cats.map((c) => c.v), 1);
  const filtered = data.orders.filter((o) => {
    const s = STAGES[stageIndex(o.createdAt, now)].key;
    if (status !== "all" && s !== status) return false;
    const q = query.trim().toLowerCase();
    return !q || `${o.id} ${o.address.name} ${o.address.city}`.toLowerCase().includes(q);
  });

  const exportCsv = () => {
    const rows = [["Order", "Date", "Customer", "City", "Payment", "Total", "Status"], ...filtered.map((o) => [o.id, new Date(o.createdAt).toISOString(), o.address.name, o.address.city, o.payment, String(o.total), STAGES[stageIndex(o.createdAt, now)].label])];
    const blob = new Blob([rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "frostly-orders.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="container-x py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex size-2 rounded-full bg-emerald-500" /></span>
            Live · updated {new Date(now).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold md:text-5xl">Store overview</h1>
          <p className="mt-1 text-muted">Last 7 days vs previous 7 days · demo data merged with orders you place</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-surface-2 md:self-auto"><Download className="size-4" /> Export CSV</button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Wallet} label="Revenue" value={formatPrice(data.revenue)} delta={data.revenueDelta} />
        <Kpi icon={ShoppingCart} label="Orders" value={data.count.toLocaleString()} delta={data.countDelta} />
        <Kpi icon={Package} label="Avg. order value" value={formatPrice(data.aov)} delta={data.aovDelta} />
        <Kpi icon={Boxes} label="Low-stock SKUs" value={String(lowStock.length)} note="≤ 20 units left" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-line bg-surface p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Daily revenue</h2>
              <p className="text-sm text-muted">Last 14 days</p>
            </div>
            <div className="text-right" aria-live="polite">
              <p className="font-display text-2xl font-semibold tabular-nums">{formatPrice(hover !== null ? data.days[hover].revenue : data.days.reduce((s, d) => s + d.revenue, 0))}</p>
              <p className="text-xs text-muted">{hover !== null ? `${data.days[hover].label} · ${data.days[hover].orders} orders` : "14-day total"}</p>
            </div>
          </div>
          <div className="relative mt-6 h-56">
            {[0, 0.5, 1].map((f) => (
              <div key={f} className="absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${f * 100}%` }}>
                <span className="absolute -top-2.5 right-0 bg-surface pl-1 text-[10px] text-muted">{f ? `${Math.round((maxRevenue * f) / 1000)}k` : "0"}</span>
              </div>
            ))}
            <div className="absolute inset-0 right-8 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
              {data.days.map((d, i) => (
                <button
                  key={d.label}
                  className="group flex h-full flex-1 items-end focus:outline-none"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={`${d.label}: ${formatPrice(d.revenue)} from ${d.orders} orders`}
                >
                  <span
                    className={cn("block w-full rounded-t-[4px] transition-colors", hover === i ? "bg-frost-700 dark:bg-frost-300" : "bg-frost-500 dark:bg-frost-400")}
                    style={{ height: `${Math.max(d.revenue ? 2 : 0, (d.revenue / maxRevenue) * 100)}%` }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mr-8 mt-2 flex justify-between text-[10px] text-muted">
            <span>{data.days[0].label}</span><span>{data.days[7].label}</span><span>Today</span>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-6">
          <h2 className="font-semibold">Revenue by category</h2>
          <p className="text-sm text-muted">All time (demo)</p>
          <ul className="mt-5 space-y-4">
            {data.cats.map((c) => (
              <li key={c.name}>
                <div className="flex justify-between text-sm"><span>{c.name}</span><span className="font-semibold tabular-nums">{formatPrice(c.v)}</span></div>
                <div className="mt-1.5 h-2 rounded-full bg-surface-2"><div className="h-full rounded-full bg-frost-500 dark:bg-frost-400" style={{ width: `${(c.v / maxCat) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ReferralAnalytics now={now} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-surface p-6">
          <h2 className="font-semibold">Top sellers</h2>
          <ul className="mt-4 divide-y divide-line">
            {data.top.map(({ product, n }, i) => (
              <li key={product.id} className="flex items-center gap-3 py-3">
                <span className="w-5 text-sm font-semibold text-muted">{i + 1}</span>
                <div className="relative size-11 overflow-hidden rounded-xl bg-surface-2"><Image src={img(product.image, 120)} alt="" fill sizes="44px" className="object-cover" /></div>
                <Link href={`/product/${product.slug}`} className="min-w-0 flex-1 truncate text-sm font-semibold hover:underline">{product.name}</Link>
                <span className="text-sm text-muted">{n} units</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-4 text-amber-500" /> Inventory alerts</h2>
          <ul className="mt-4 divide-y divide-line">
            {lowStock.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <div className="relative size-11 overflow-hidden rounded-xl bg-surface-2"><Image src={img(p.image, 120)} alt="" fill sizes="44px" className="object-cover" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <div className="mt-1 h-1.5 w-full max-w-40 rounded-full bg-surface-2"><div className={cn("h-full rounded-full", p.stock <= 10 ? "bg-red-500" : "bg-amber-500")} style={{ width: `${(p.stock / 20) * 100}%` }} /></div>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", p.stock <= 10 ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200")}>
                  {p.stock <= 10 ? "Critical" : "Low"} · {p.stock} left
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-line bg-surface">
        <div className="flex flex-col gap-3 border-b border-line p-6 md:flex-row md:items-center md:justify-between">
          <h2 className="font-semibold">Orders <span className="text-muted">({filtered.length})</span></h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex gap-1 overflow-x-auto rounded-full bg-surface-2 p-1 no-scrollbar">
              {[{ key: "all", label: "All" }, ...STAGES.filter((s) => s.key !== "dispatched")].map((s) => (
                <button key={s.key} onClick={() => setStatus(s.key)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold", status === s.key ? "bg-surface shadow" : "text-muted")}>
                  {s.key === "confirmed" ? "Confirmed" : s.label.replace(" in cold box", "")}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order, customer, city" aria-label="Search orders" className="w-full rounded-full border border-line bg-bg py-2 pl-9 pr-4 text-sm outline-none focus:border-frost-400 sm:w-64" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>{["Order", "Customer", "Date", "Items", "Payment", "Total", "Status"].map((h) => <th key={h} className="px-6 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.slice(0, 12).map((o) => {
                const s = STAGES[stageIndex(o.createdAt, now)];
                return (
                  <tr key={o.id} className="hover:bg-surface-2">
                    <td className="px-6 py-3.5 font-semibold"><Link href={`/order/${o.id}`} className="hover:underline">{o.id}</Link></td>
                    <td className="px-6 py-3.5">{o.address.name}<span className="block text-xs text-muted">{o.address.city}</span></td>
                    <td className="px-6 py-3.5 text-muted">{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                    <td className="px-6 py-3.5">{o.items.reduce((n, it) => n + it.qty, 0)}</td>
                    <td className="px-6 py-3.5 text-muted">{o.payment}</td>
                    <td className="px-6 py-3.5 font-semibold tabular-nums">{formatPrice(o.total)}</td>
                    <td className="px-6 py-3.5"><span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusStyle[s.key])}>{s.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-10 text-center text-muted">No orders match.</p>}
        </div>
      </section>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, delta, note }: { icon: React.ElementType; label: string; value: string; delta?: number; note?: string }) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <Icon className="size-4 text-muted" />
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tabular-nums md:text-3xl">{value}</p>
      {delta !== undefined ? (
        <p className={cn("mt-1 inline-flex items-center gap-0.5 text-xs font-semibold", up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
          {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}{Math.abs(delta).toFixed(1)}% <span className="font-normal text-muted">vs prev. week</span>
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted">{note}</p>
      )}
    </div>
  );
}
