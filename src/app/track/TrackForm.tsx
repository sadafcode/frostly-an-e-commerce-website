"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { useHydrated, useShop } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export function TrackForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const orders = useShop((s) => s.orders);
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  return (
    <>
      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          const clean = id.trim().toUpperCase();
          if (!/^FRL-\d{4,6}$/.test(clean)) return setError("Order numbers look like FRL-28413");
          router.push(`/order/${clean}`);
        }}
      >
        <div className="flex gap-2 rounded-full border border-line bg-surface p-1.5 shadow-lg shadow-frost-900/5">
          <input value={id} onChange={(e) => { setId(e.target.value); setError(""); }} placeholder="FRL-28413" aria-label="Order number"
            className="min-w-0 flex-1 bg-transparent px-4 uppercase outline-none placeholder:normal-case" />
          <button className="inline-flex items-center gap-2 rounded-full bg-frost-600 px-6 py-3 font-semibold text-white hover:bg-frost-700"><Search className="size-4" /> Track</button>
        </div>
        {error && <p className="mt-2 text-sm text-ember-600">{error}</p>}
      </form>
      <p className="mt-4 text-sm text-muted">
        Just browsing? <button onClick={() => router.push("/order/FRL-28413")} className="font-semibold text-frost-600 underline dark:text-frost-300">See a live demo order</button>
      </p>

      {hydrated && orders.length > 0 && (
        <div className="mt-12 text-left">
          <h2 className="font-semibold">Your recent orders</h2>
          <ul className="mt-3 divide-y divide-line rounded-3xl border border-line bg-surface">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id}>
                <Link href={`/order/${o.id}`} className="flex items-center justify-between p-4 hover:bg-surface-2">
                  <span><span className="font-semibold">{o.id}</span><span className="block text-xs text-muted">{new Date(o.createdAt).toLocaleString("en-GB")}</span></span>
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
