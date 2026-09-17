"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, MapPin, Package, Phone, Printer, Thermometer, Truck } from "lucide-react";
import { useHydrated, useShop, type Order } from "@/lib/store";
import { demoOrders, STAGES, stageIndex } from "@/lib/orders";
import { cn, formatPrice, img } from "@/lib/format";

export function OrderTracking({ id, isNew }: { id: string; isNew: boolean }) {
  const hydrated = useHydrated();
  const orders = useShop((s) => s.orders);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 3000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, []);

  if (!hydrated || now === null) return <div className="container-x py-24"><div className="skeleton mx-auto h-96 max-w-4xl rounded-3xl" /></div>;

  const order: Order | undefined = orders.find((o) => o.id === id) ?? demoOrders(now).find((o) => o.id === id);

  if (!order) {
    return (
      <div className="container-x py-24 text-center">
        <Package className="mx-auto size-14 text-muted" />
        <h1 className="mt-4 font-display text-4xl font-semibold">We couldn’t find order {id}</h1>
        <p className="mt-2 text-muted">Double-check the order number from your confirmation SMS or email.</p>
        <Link href="/track" className="mt-8 inline-block rounded-full bg-frost-600 px-7 py-4 font-semibold text-white">Try again</Link>
      </div>
    );
  }

  const stage = stageIndex(order.createdAt, now);
  const progress = stage / (STAGES.length - 1);
  // Gentle, deterministic fluctuation around -18°C.
  const temp = (-18.2 + Math.sin(now / 9000) * 0.5).toFixed(1);
  const slotDate = new Date(order.slot.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="container-x py-10">
      {isNew && (
        <div className="mb-10 animate-fade-up overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-center text-white md:p-12">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-white/20"><CheckCircle2 className="size-9" /></div>
          <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">Thank you, {order.address.name.split(" ")[0]}!</h1>
          <p className="mt-2 text-white/90">Your order <b>{order.id}</b> is confirmed. A confirmation has been sent to {order.address.email}.</p>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-frost-600 dark:text-frost-300">Order {order.id}</p>
          <h2 className="mt-1 font-display text-4xl font-semibold">{STAGES[stage].label}</h2>
          <p className="mt-1 text-muted">Scheduled for {slotDate}, {order.slot.window}</p>
        </div>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-surface-2 md:self-auto">
          <Printer className="size-4" /> Print invoice
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Live map */}
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface">
            <RouteMap progress={progress} />
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-semibold shadow backdrop-blur">
              <Truck className="size-3.5 text-frost-600" /> Frostly Hub · {order.address.city}
            </div>
            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-semibold shadow backdrop-blur">
              <MapPin className="size-3.5 text-ember-500" /> {order.address.area}
            </div>
            <div className="grid grid-cols-3 divide-x divide-line border-t border-line text-center">
              <div className="p-4"><p className="text-xs text-muted">Box temperature</p><p className="flex items-center justify-center gap-1 font-bold tabular-nums text-frost-600 dark:text-frost-300"><Thermometer className="size-4" />{temp}°C</p></div>
              <div className="p-4"><p className="text-xs text-muted">ETA</p><p className="font-bold">{stage >= 4 ? "Delivered" : stage === 3 ? "~15 min" : order.slot.window}</p></div>
              <div className="p-4"><p className="text-xs text-muted">Rider</p><p className="font-bold">{stage >= 3 ? "Kamran A." : "Assigning…"}</p></div>
            </div>
          </div>

          {/* Timeline */}
          <ol className="rounded-3xl border border-line bg-surface p-6">
            {STAGES.map((s, i) => {
              const done = i <= stage;
              const time = new Date(new Date(order.createdAt).getTime() + s.at * 60000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
              return (
                <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < STAGES.length - 1 && <span className={cn("absolute left-4 top-9 h-[calc(100%-2.25rem)] w-0.5", i < stage ? "bg-emerald-500" : "bg-line")} />}
                  <span className={cn("relative grid size-8 shrink-0 place-items-center rounded-full", done ? "bg-emerald-500 text-white" : "border-2 border-line bg-surface text-muted", i === stage && i < STAGES.length - 1 && "ring-4 ring-emerald-500/20")}>
                    {done ? <Check className="size-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <p className={cn("font-semibold", !done && "text-muted")}>{s.label}</p>
                      {done && <time className="text-xs text-muted">{time}</time>}
                    </div>
                    <p className="text-sm text-muted">{s.body}</p>
                  </div>
                </li>
              );
            })}
            <li className="mt-6 rounded-2xl bg-surface-2 p-3 text-xs text-muted">Demo note: the tracking timeline is accelerated so you can watch every stage in ~5 minutes.</li>
          </ol>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-line bg-surface p-6">
            <h3 className="font-display text-xl font-semibold">Items ({order.items.reduce((s, i) => s + i.qty, 0)})</h3>
            <ul className="mt-4 space-y-3">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-2"><Image src={img(it.image, 150)} alt="" fill sizes="56px" className="object-cover" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{it.name}</p><p className="text-xs text-muted">{it.variant} × {it.qty}</p></div>
                  <p className="text-sm font-semibold">{formatPrice(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-700 dark:text-emerald-400"><dt>Discount {order.promo && `(${order.promo})`}</dt><dd>-{formatPrice(order.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{order.delivery ? formatPrice(order.delivery) : "FREE"}</dd></div>
              <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
          </div>
          <div className="rounded-3xl border border-line bg-surface p-6 text-sm">
            <h3 className="font-display text-xl font-semibold">Delivery details</h3>
            <p className="mt-3 font-semibold">{order.address.name}</p>
            <p className="text-muted">{order.address.address}, {order.address.area}, {order.address.city}</p>
            <p className="mt-1 text-muted">{order.address.phone}</p>
            <p className="mt-4"><span className="text-muted">Payment:</span> <b>{order.payment}</b></p>
            <a href="tel:+923001234567" className="mt-5 flex items-center justify-center gap-2 rounded-full border border-line py-3 font-semibold hover:bg-surface-2"><Phone className="size-4" /> Contact support</a>
          </div>
          <Link href="/shop" className="block rounded-full bg-frost-600 py-4 text-center font-semibold text-white hover:bg-frost-700">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}

const ROUTE = "M60 180 C 160 180, 180 60, 300 90 S 460 200, 540 60";

function RouteMap({ progress }: { progress: number }) {
  const pathRef = useRef<SVGPathElement>(null);
  const riderRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const rider = riderRef.current;
    if (!path || !rider) return;
    const pt = path.getPointAtLength(path.getTotalLength() * progress);
    rider.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
  }, [progress]);

  return (
    <svg viewBox="0 0 600 240" className="h-56 w-full md:h-64" role="img" aria-label="Delivery route map">
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="currentColor" strokeOpacity="0.08" /></pattern>
      </defs>
      <rect width="600" height="240" fill="url(#grid)" className="text-fg" />
      <path ref={pathRef} d={ROUTE} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="10" strokeLinecap="round" className="text-fg" />
      <path d={ROUTE} fill="none" stroke="#1f84f5" strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - progress} style={{ transition: "stroke-dashoffset 1s ease" }} />
      <circle cx="60" cy="180" r="9" fill="#0f51ad" />
      <circle cx="540" cy="60" r="9" fill="#ff6b35" />
      <g ref={riderRef} transform="translate(60 180)" style={{ transition: "transform 1s ease" }}>
        <circle r="16" fill="#1f84f5" opacity="0.25"><animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" /></circle>
        <circle r="9" fill="#fff" stroke="#1f84f5" strokeWidth="4" />
      </g>
    </svg>
  );
}
