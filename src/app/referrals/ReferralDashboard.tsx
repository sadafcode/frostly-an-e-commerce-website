"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Crown, Gift, Link2, Share2, ShieldAlert, Sparkles, TrendingUp, Trophy, Users, Wallet } from "lucide-react";
import { myCode, useHydrated, useNow, useShop, useUI } from "@/lib/store";
import {
  buildWallet, leaderboard, MILESTONES, RANKS, REFERRAL, SOURCE_LABEL, STATUS_META, summarize,
  type EnrichedReferral, type ReferralSource,
} from "@/lib/referrals";
import { cn, formatPrice } from "@/lib/format";
import { ShareTools } from "./ShareTools";

const TABS = ["overview", "friends", "wallet", "leaderboard"] as const;
type Tab = (typeof TABS)[number];

export function ReferralDashboard() {
  const hydrated = useHydrated();
  const now = useNow(1000);
  const { user, referrals, creditSpends, referredBy } = useShop();
  const [tab, setTab] = useState<Tab>("overview");

  const code = myCode(user);

  const data = useMemo(() => {
    if (now === null) return null;
    const summary = summarize(referrals, now);
    return { summary, wallet: buildWallet(summary, creditSpends, now) };
  }, [referrals, creditSpends, now]);

  if (!hydrated || !data || now === null) {
    return <div className="container-x space-y-4 py-10">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-40 rounded-3xl" />)}</div>;
  }

  if (!user || !code) return <SignedOut />;

  const { summary, wallet } = data;
  const { rank, next } = summary;
  const progress = next ? Math.min(100, (summary.unlockedCount / next.at) * 100) : 100;

  return (
    <div className="container-x py-10">
      <Hero code={code} rank={rank.name} earned={wallet.lifetime} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Wallet} label="Credit available" value={formatPrice(wallet.balance)} hint={wallet.pending > 0 ? `${formatPrice(wallet.pending)} still clearing` : "Spend it at checkout"} accent />
        <Stat icon={Users} label="Friends referred" value={summary.unlockedCount} hint={`${summary.invitedCount} invited · ${summary.holdingCount} clearing`} />
        <Stat icon={TrendingUp} label="Conversion rate" value={`${summary.conversionRate.toFixed(0)}%`} hint={`${summary.records.length} invites sent`} />
        <Stat icon={Gift} label="Lifetime earned" value={formatPrice(wallet.lifetime)} hint={`${formatPrice(wallet.spent)} redeemed`} />
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto rounded-full bg-surface-2 p-1 no-scrollbar">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}
            className={cn("shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition", tab === t ? "bg-surface shadow text-fg" : "text-muted hover:text-fg")}>
            {t === "friends" ? `Friends (${summary.records.length})` : t}
          </button>
        ))}
      </div>

      <div className="mt-6 animate-fade-up">
        {tab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <ShareTools code={code} />
              <HowItWorks />
            </div>
            <div className="space-y-6">
              <RankCard rank={rank.name} perk={rank.perk} next={next} progress={progress} count={summary.unlockedCount} />
              <Milestones summary={summary} />
              {referredBy && (
                <p className="rounded-3xl border border-dashed border-line bg-surface p-5 text-sm text-muted">
                  You joined through invite code <strong className="text-fg">{referredBy}</strong> — thanks for spreading the cold.
                </p>
              )}
              <CapNotice used={summary.monthlyUsed} />
            </div>
          </div>
        )}

        {tab === "friends" && <FriendsTable records={summary.records} now={now} />}
        {tab === "wallet" && <WalletView wallet={wallet} />}
        {tab === "leaderboard" && <Leaderboard count={summary.unlockedCount} name={user.name} />}
      </div>

      <DemoControls records={summary.records} />
    </div>
  );
}

/* --------------------------------------------------------------- pieces */

function Hero({ code, rank, earned }: { code: string; rank: string; earned: number }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-frost-700 via-frost-600 to-frost-900 p-8 text-white md:p-12">
      <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
          <Crown className="size-3.5" /> {rank} · {code}
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">Give Rs. {REFERRAL.friendDiscount}, get Rs. {REFERRAL.baseReward}</h1>
        <p className="mt-3 text-frost-100/90">
          Your friend saves {formatPrice(REFERRAL.friendDiscount)} on their first order over {formatPrice(REFERRAL.friendMinSpend)}.
          You earn {formatPrice(REFERRAL.baseReward)} in Frostly credit once it clears — more as your rank climbs.
        </p>
        {earned > 0 && <p className="mt-4 text-sm font-semibold text-frost-100">You’ve earned {formatPrice(earned)} so far. ❄️</p>}
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, hint, accent }: { icon: typeof Wallet; label: string; value: string | number; hint: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-3xl border p-5", accent ? "border-frost-400 bg-frost-50 dark:border-frost-700 dark:bg-frost-900/30" : "border-line bg-surface")}>
      <Icon className="size-5 text-frost-600 dark:text-frost-300" />
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

function RankCard({ rank, perk, next, progress, count }: { rank: string; perk: string; next: { name: string; at: number } | null; progress: number; count: number }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Trophy className="size-5 text-amber-500" /> Ambassador rank</h2>
      <p className="mt-4 font-display text-3xl font-semibold text-frost-600 dark:text-frost-300">{rank}</p>
      <p className="text-sm text-muted">{perk}</p>
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-gradient-to-r from-frost-400 to-frost-700 transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {next ? <>{next.at - count} more {next.at - count === 1 ? "friend" : "friends"} to reach <strong className="text-fg">{next.name}</strong></> : "Top rank unlocked — you’re a Frostly Legend."}
      </p>
      <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
        {RANKS.map((r) => (
          <li key={r.key} className={cn("flex items-center justify-between gap-3", count >= r.at ? "font-semibold" : "text-muted")}>
            <span className="flex items-center gap-2">
              {count >= r.at ? <Check className="size-4 text-emerald-500" /> : <span className="size-4 rounded-full border border-line" />}
              {r.name}
            </span>
            <span className="text-xs">{r.at}+ friends · ×{r.multiplier}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Milestones({ summary }: { summary: ReturnType<typeof summarize> }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Sparkles className="size-5 text-frost-600 dark:text-frost-300" /> Milestone bonuses</h2>
      <ul className="mt-4 space-y-3">
        {summary.milestones.map((m) => {
          const done = !!m.reachedAt;
          return (
            <li key={m.at} className={cn("flex items-center gap-3 rounded-2xl border p-3", done ? "border-emerald-500/40 bg-emerald-500/10" : "border-line")}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-full font-display text-sm font-bold", done ? "bg-emerald-500 text-white" : "bg-surface-2 text-muted")}>{m.at}</span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{m.label}</span>
                <span className="block text-xs text-muted">{done ? `Unlocked ${new Date(m.reachedAt!).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : `${m.at - summary.unlockedCount} to go`}</span>
              </span>
              <span className={cn("text-sm font-bold", done ? "text-emerald-600 dark:text-emerald-400" : "text-muted")}>+{formatPrice(m.reward)}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-muted">Bonuses stack on top of the {formatPrice(REFERRAL.baseReward)} you earn per friend.</p>
    </section>
  );
}

function CapNotice({ used }: { used: number }) {
  const pct = Math.min(100, (used / REFERRAL.monthlyCap) * 100);
  return (
    <section className="rounded-3xl border border-line bg-surface p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><ShieldAlert className="size-4 text-muted" /> Monthly reward cap</h3>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className={cn("h-full rounded-full", pct > 80 ? "bg-ember-500" : "bg-frost-500")} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">{used} of {REFERRAL.monthlyCap} rewards paid in the last 30 days. Invites past the cap still give your friend their discount.</p>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Share2, title: "Share your link", body: "WhatsApp, email, QR — every channel is tracked separately so you can see what works." },
    { icon: Gift, title: "They save on order one", body: `${formatPrice(REFERRAL.friendDiscount)} off any first order over ${formatPrice(REFERRAL.friendMinSpend)}.` },
    { icon: Wallet, title: "Your credit clears", body: "Paid after the returns window closes, so cancelled orders never pay out." },
  ];
  return (
    <section className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="font-display text-xl font-semibold">How it works</h2>
      <ol className="mt-5 grid gap-5 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <li key={title}>
            <span className="grid size-10 place-items-center rounded-2xl bg-frost-50 text-frost-600 dark:bg-frost-900/40 dark:text-frost-300"><Icon className="size-5" /></span>
            <p className="mt-3 text-sm font-semibold">{i + 1}. {title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* --------------------------------------------------------------- tables */

const countdown = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  if (d > 0) return `${d}d ${Math.floor((s % 86400) / 3600)}h`;
  const h = Math.floor(s / 3600);
  if (h > 0) return `${h}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
};

function FriendsTable({ records, now }: { records: EnrichedReferral[]; now: number }) {
  const [filter, setFilter] = useState("all");
  const shown = records.filter((r) => filter === "all" || r.status === filter);

  if (records.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-surface py-20 text-center">
        <Users className="mx-auto size-10 text-muted" />
        <p className="mt-3 font-semibold">No invites yet</p>
        <p className="mt-1 text-sm text-muted">Share your link and your first reward shows up here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-4">
        {["all", "invited", "holding", "unlocked", "expired", "blocked"].map((f) => {
          const n = f === "all" ? records.length : records.filter((r) => r.status === f).length;
          if (n === 0 && f !== "all") return null;
          return (
            <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
              className={cn("rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition", filter === f ? "bg-fg text-bg" : "bg-surface-2 text-muted hover:text-fg")}>
              {f === "holding" ? "clearing" : f} · {n}
            </button>
          );
        })}
      </div>
      <ul className="divide-y divide-line">
        {shown.map((r) => {
          const meta = STATUS_META[r.status];
          return (
            <li key={r.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-frost-300 to-frost-600 font-display font-semibold text-white">
                {r.name[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.name}</p>
                <p className="truncate text-xs text-muted">
                  {SOURCE_LABEL[r.source]} · joined {new Date(r.joinedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  {r.order && ` · order ${r.order.id} · ${formatPrice(r.order.total)}`}
                </p>
                {r.flagged && <p className="mt-1 text-xs text-ember-600">⚠ {r.flagged}</p>}
                {r.status === "holding" && <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">Clears in {countdown(r.unlocksAt! - now)}</p>}
                {r.status === "invited" && <p className="mt-1 text-xs text-muted">Invite expires in {countdown(r.expiresAt! - now)}</p>}
                {r.cappedOut && <p className="mt-1 text-xs text-ember-600">Beyond the monthly cap — no reward paid</p>}
              </div>
              <div className="ml-auto text-right">
                <p className={cn("font-display text-lg font-semibold", r.reward && r.status === "unlocked" ? "text-emerald-600 dark:text-emerald-400" : "text-muted")}>
                  {r.reward ? `+${formatPrice(r.reward.total)}` : "—"}
                </p>
                {r.reward && r.reward.total > r.reward.base && (
                  <p className="text-[11px] text-muted">{formatPrice(r.reward.base)} base{r.reward.rankBonus ? ` +${r.reward.rankBonus} rank` : ""}{r.reward.volumeBonus ? ` +${r.reward.volumeBonus} basket` : ""}</p>
                )}
              </div>
              <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-semibold", meta.tone)} title={meta.hint}>{meta.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WalletView({ wallet }: { wallet: ReturnType<typeof buildWallet> }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
      <section className="h-fit rounded-3xl bg-gradient-to-br from-frost-600 to-frost-900 p-6 text-white">
        <p className="text-sm opacity-80">Frostly credit</p>
        <p className="mt-1 font-display text-5xl font-semibold">{formatPrice(wallet.balance)}</p>
        <dl className="mt-6 space-y-2 border-t border-white/20 pt-4 text-sm">
          {[["Clearing", wallet.pending], ["Lifetime earned", wallet.lifetime], ["Redeemed", wallet.spent], ["Expired", wallet.expired]].map(([label, v]) => (
            <div key={label as string} className="flex justify-between opacity-90"><dt>{label}</dt><dd className="font-semibold">{formatPrice(v as number)}</dd></div>
          ))}
        </dl>
        {wallet.expiringSoon > 0 && <p className="mt-4 rounded-xl bg-white/15 p-3 text-xs">⏳ {formatPrice(wallet.expiringSoon)} expires within 14 days.</p>}
        <Link href="/shop" className="mt-6 block rounded-full bg-white py-3 text-center font-semibold text-frost-800">Spend credit</Link>
        <p className="mt-3 text-center text-xs opacity-70">Covers up to {REFERRAL.maxCreditShare * 100}% of any basket.</p>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-6">
        <h2 className="font-display text-xl font-semibold">Credit ledger</h2>
        <p className="text-sm text-muted">Every movement, oldest at the bottom.</p>
        {wallet.entries.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">No credit activity yet.</p>
        ) : (
          <ul className="mt-5 divide-y divide-line">
            {wallet.entries.map((e) => (
              <li key={e.id} className="flex items-center gap-4 py-3.5">
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", e.amount > 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-surface-2 text-muted")}>
                  {e.kind === "milestone" ? <Sparkles className="size-4" /> : e.amount > 0 ? <Gift className="size-4" /> : <Wallet className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.label}</p>
                  <p className="truncate text-xs text-muted">
                    {new Date(e.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {e.sub && ` · ${e.sub}`}
                  </p>
                </div>
                <p className={cn("shrink-0 font-semibold", e.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-fg")}>
                  {e.amount > 0 ? "+" : "−"}{formatPrice(Math.abs(e.amount))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Leaderboard({ count, name }: { count: number; name: string }) {
  const rows = leaderboard(count, name);
  const you = rows.find((r) => r.you)!;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-3xl border border-line bg-surface p-6">
        <h2 className="font-display text-xl font-semibold">Top ambassadors this month</h2>
        <ul className="mt-5 space-y-1.5">
          {rows.map((r) => (
            <li key={`${r.name}-${r.position}`} className={cn("flex items-center gap-4 rounded-2xl px-4 py-3", r.you ? "bg-frost-50 ring-2 ring-frost-400 dark:bg-frost-900/40" : "hover:bg-surface-2")}>
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-full font-display text-sm font-bold",
                r.position === 1 ? "bg-amber-400 text-amber-950" : r.position === 2 ? "bg-slate-300 text-slate-800" : r.position === 3 ? "bg-orange-400/80 text-orange-950" : "bg-surface-2 text-muted")}>
                {r.position}
              </span>
              <span className="flex-1 truncate font-semibold">{r.name}{r.you && <span className="ml-2 rounded-full bg-frost-600 px-2 py-0.5 text-[10px] text-white">YOU</span>}</span>
              <span className="text-sm text-muted">{r.count} friends</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="h-fit rounded-3xl border border-line bg-surface p-6 text-center">
        <Trophy className="mx-auto size-8 text-amber-500" />
        <p className="mt-3 font-display text-5xl font-semibold">#{you.position}</p>
        <p className="text-sm text-muted">your position</p>
        <p className="mt-5 text-sm">
          {you.position === 1 ? "You’re leading the board — the Rs. 25,000 monthly prize is yours to lose." : `Refer ${rows[you.position - 2].count - count + 1} more to overtake ${rows[you.position - 2].name}.`}
        </p>
        <p className="mt-4 rounded-2xl bg-surface-2 p-3 text-xs text-muted">Top 3 each month split a Rs. 50,000 credit pool.</p>
      </section>
    </div>
  );
}

/* --------------------------------------------------------------- extras */

const DEMO_FRIENDS = ["Nida Aslam", "Rehan Butt", "Areeba Sheikh", "Taha Qureshi", "Maryam Iqbal"];

/** Portfolio affordance: drives the state machine without waiting on real users. */
function DemoControls({ records }: { records: EnrichedReferral[] }) {
  const { simulateInvite, simulateConversion } = useShop();
  const toast = useUI((s) => s.toast);
  const pending = records.filter((r) => r.status === "invited");

  return (
    <section className="mt-10 rounded-3xl border border-dashed border-line bg-surface-2/50 p-6">
      <h2 className="font-display text-lg font-semibold">Demo controls</h2>
      <p className="mt-1 text-sm text-muted">
        This build has no backend, so use these to walk the reward state machine: invited → clearing ({REFERRAL.holdMs / 60000} min holding window) → paid out.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => {
            const name = DEMO_FRIENDS[Math.floor(Math.random() * DEMO_FRIENDS.length)];
            const source = (["whatsapp", "link", "email", "qr"] as ReferralSource[])[Math.floor(Math.random() * 4)];
            simulateInvite(name, source);
            toast({ title: `${name} accepted your invite`, body: "They’ll appear as ‘Invited’ until their first order." });
          }}
          className="rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-bg"
        >
          + Simulate a friend joining
        </button>
        <button
          disabled={pending.length === 0}
          onClick={() => {
            const target = pending[0];
            simulateConversion(target.id);
            toast({ title: `${target.name} placed their first order`, body: "Your reward is now clearing." });
          }}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
        >
          Convert oldest invite {pending.length > 0 && `(${pending[0].name})`}
        </button>
      </div>
    </section>
  );
}

function SignedOut() {
  return (
    <div className="container-x py-20 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-frost-50 text-frost-600 dark:bg-frost-900/40 dark:text-frost-300"><Gift className="size-7" /></span>
      <h1 className="mt-6 font-display text-4xl font-semibold">Refer friends, earn credit</h1>
      <p className="mx-auto mt-3 max-w-lg text-muted">
        Sign in to get your invite link. Your friend saves {formatPrice(REFERRAL.friendDiscount)} on their first order and you earn {formatPrice(REFERRAL.baseReward)} in Frostly credit.
      </p>
      <Link href="/account" className="mt-8 inline-block rounded-full bg-frost-600 px-8 py-4 font-semibold text-white hover:bg-frost-700">Sign in to get your link</Link>
      <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-3">
        {[
          { icon: Link2, t: "One link, every channel", b: "WhatsApp, email and QR are tracked separately." },
          { icon: Trophy, t: "Rank up as you refer", b: "Rewards grow up to ×1.6 at Legend rank." },
          { icon: Wallet, t: "Credit, not points", b: "Spend it straight off your next basket." },
        ].map(({ icon: Icon, t, b }) => (
          <div key={t} className="rounded-3xl border border-line bg-surface p-6 text-left">
            <Icon className="size-5 text-frost-600 dark:text-frost-300" />
            <p className="mt-3 font-semibold">{t}</p>
            <p className="mt-1 text-sm text-muted">{b}</p>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-md rounded-3xl border border-line bg-surface p-6">
        <p className="text-sm font-semibold">Milestone bonuses on top</p>
        <div className="mt-4 flex justify-between text-sm">
          {MILESTONES.map((m) => (
            <div key={m.at}>
              <p className="font-display text-2xl font-semibold text-frost-600 dark:text-frost-300">{m.at}</p>
              <p className="text-xs text-muted">+{formatPrice(m.reward)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
