"use client";

import Link from "next/link";
import { useState } from "react";
import { Gift, Heart, LogOut, MapPin, Package, Snowflake } from "lucide-react";
import { useHydrated, useShop } from "@/lib/store";
import { cn, formatPrice } from "@/lib/format";

export function AccountView() {
  const hydrated = useHydrated();
  const { user, orders, wishlist, login, logout } = useShop();

  if (!hydrated) return <div className="container-x py-24"><div className="skeleton mx-auto h-96 max-w-md rounded-3xl" /></div>;
  if (!user) return <AuthForm onLogin={login} />;

  const spent = orders.reduce((s, o) => s + o.total, 0);
  const points = Math.floor(spent / 100);
  const tier = points >= 500 ? "Glacier" : points >= 150 ? "Frost" : "Snowflake";
  const nextTier = tier === "Snowflake" ? 150 : tier === "Frost" ? 500 : 500;
  const lastAddress = orders[0]?.address;

  return (
    <div className="container-x py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-frost-400 to-frost-700 font-display text-2xl font-semibold text-white">{user.name[0]?.toUpperCase()}</span>
          <div>
            <h1 className="font-display text-3xl font-semibold md:text-4xl">Salaam, {user.name.split(" ")[0]} 👋</h1>
            <p className="text-muted">{user.email}</p>
          </div>
        </div>
        <button onClick={logout} className="inline-flex items-center gap-2 self-start rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-surface-2 sm:self-auto"><LogOut className="size-4" /> Sign out</button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Package, label: "Orders placed", value: orders.length },
          { icon: Gift, label: "Total spent", value: formatPrice(spent) },
          { icon: Heart, label: "Wishlist", value: wishlist.length },
          { icon: Snowflake, label: "Frost Points", value: points.toLocaleString() },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-3xl border border-line bg-surface p-5">
            <Icon className="size-5 text-frost-600 dark:text-frost-300" />
            <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-line bg-surface p-6">
          <h2 className="font-display text-2xl font-semibold">Order history</h2>
          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto size-10 text-muted" />
              <p className="mt-3 text-muted">No orders yet — your first one earns double Frost Points.</p>
              <Link href="/shop" className="mt-5 inline-block rounded-full bg-frost-600 px-6 py-3 font-semibold text-white">Start shopping</Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/order/${o.id}`} className="flex items-center justify-between gap-4 py-4 hover:opacity-80">
                    <div>
                      <p className="font-semibold">{o.id}</p>
                      <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {o.items.length} product{o.items.length === 1 ? "" : "s"} · {o.payment}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(o.total)}</p>
                      <p className="text-xs font-semibold text-frost-600 dark:text-frost-300">Track →</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-frost-600 to-frost-900 p-6 text-white">
            <p className="text-sm opacity-80">Loyalty tier</p>
            <p className="mt-1 flex items-center gap-2 font-display text-3xl font-semibold"><Snowflake className="size-6" /> {tier}</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, (points / nextTier) * 100)}%` }} />
            </div>
            <p className="mt-2 text-sm opacity-80">
              {tier === "Glacier" ? "Top tier unlocked — free delivery forever." : `${nextTier - points} points to ${tier === "Snowflake" ? "Frost" : "Glacier"} tier`}
            </p>
          </section>
          <section className="rounded-3xl border border-line bg-surface p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><MapPin className="size-5" /> Saved address</h2>
            {lastAddress ? (
              <p className="mt-3 text-sm text-muted">{lastAddress.name}<br />{lastAddress.address}, {lastAddress.area}<br />{lastAddress.city} · {lastAddress.phone}</p>
            ) : (
              <p className="mt-3 text-sm text-muted">Addresses from your checkout are saved here automatically.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function AuthForm({ onLogin }: { onLogin: (name: string, email: string) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && name.trim().length < 3) return setError("Please enter your full name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setError("Please enter a valid email");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    const fallback = email.split("@")[0].replace(/[._\d]+/g, " ").trim() || "Friend";
    onLogin(mode === "signup" ? name.trim() : fallback.replace(/\b\w/g, (c) => c.toUpperCase()), email);
  };

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-md rounded-[2rem] border border-line bg-surface p-8 shadow-xl shadow-frost-900/5">
        <div className="grid grid-cols-2 rounded-full bg-surface-2 p-1">
          {(["login", "signup"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} className={cn("rounded-full py-2.5 text-sm font-semibold transition", mode === m ? "bg-surface shadow" : "text-muted")}>
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
        <h1 className="mt-8 font-display text-3xl font-semibold">{mode === "login" ? "Welcome back" : "Join Frostly"}</h1>
        <p className="mt-1 text-sm text-muted">{mode === "login" ? "Track orders, reorder favourites and earn Frost Points." : "Get 10% off your first order + 50 bonus Frost Points."}</p>
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {mode === "signup" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" className="w-full rounded-xl border border-line bg-bg px-4 py-3 outline-none focus:border-frost-400" />}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address" autoComplete="email" className="w-full rounded-xl border border-line bg-bg px-4 py-3 outline-none focus:border-frost-400" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} className="w-full rounded-xl border border-line bg-bg px-4 py-3 outline-none focus:border-frost-400" />
          {error && <p className="text-sm text-ember-600" role="alert">{error}</p>}
          <button className="w-full rounded-full bg-frost-600 py-3.5 font-semibold text-white hover:bg-frost-700">{mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" /></div>
        <button onClick={() => onLogin("Guest Demo", "demo@frostly.pk")} className="w-full rounded-full border border-line py-3 font-semibold hover:bg-surface-2">Continue with demo account</button>
        <p className="mt-4 text-center text-xs text-muted">Portfolio demo — no real credentials are sent anywhere.</p>
      </div>
    </div>
  );
}
