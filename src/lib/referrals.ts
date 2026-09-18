/**
 * Frostly referral engine.
 *
 * Pure domain logic — no React, no store, no I/O. Everything the UI shows is
 * *derived* from two persisted lists (referrals + credit spends) and the
 * current timestamp, the same way `orders.ts` derives a delivery stage from
 * `createdAt`. Nothing is written on a timer, so state can never drift out of
 * sync with the clock and reloading the page always recomputes the truth.
 */

export const REFERRAL = {
  /** Instant discount the invited friend gets on their first qualifying order. */
  friendDiscount: 500,
  friendMinSpend: 2000,
  /** Reward paid to the referrer, before rank multiplier and volume bonus. */
  baseReward: 700,
  volumeBonusFrom: 3000,
  volumeBonusRate: 0.05,
  volumeBonusCap: 500,
  /**
   * Holding period between the friend's order and the credit becoming
   * spendable — covers the returns/refund window so a cancelled order can't be
   * cashed out. Demo-accelerated to 3 minutes; production would be 3 days.
   */
  holdMs: 3 * 60_000,
  /** An invite that never converts stops counting after 30 days. */
  inviteExpiryMs: 30 * 86_400_000,
  /** Unlocked credit is use-it-or-lose-it after 90 days. */
  creditExpiryMs: 90 * 86_400_000,
  /** Anti-abuse: rewards paid per referrer per rolling 30 days. */
  monthlyCap: 20,
  /** Credit may cover at most half of an order's subtotal. */
  maxCreditShare: 0.5,
} as const;

export const RANKS = [
  { key: "starter", name: "Starter", at: 0, multiplier: 1, perk: "Rs. 700 per friend" },
  { key: "insider", name: "Insider", at: 3, multiplier: 1.15, perk: "+15% rewards · free delivery for a month" },
  { key: "ambassador", name: "Ambassador", at: 8, multiplier: 1.35, perk: "+35% rewards · early access to drops" },
  { key: "legend", name: "Legend", at: 15, multiplier: 1.6, perk: "+60% rewards · permanent free delivery" },
] as const;

export type Rank = (typeof RANKS)[number];

export const MILESTONES = [
  { at: 3, reward: 1000, label: "Trio bonus" },
  { at: 5, reward: 2000, label: "High five" },
  { at: 10, reward: 5000, label: "Double digits" },
  { at: 25, reward: 15000, label: "Frostly Legend" },
] as const;

export const SOURCES = ["link", "whatsapp", "copy", "email", "qr"] as const;
export type ReferralSource = (typeof SOURCES)[number];

export const SOURCE_LABEL: Record<ReferralSource, string> = {
  link: "Shared link",
  whatsapp: "WhatsApp",
  copy: "Copied link",
  email: "Email",
  qr: "QR code",
};

/** Why an invite was rejected. Each maps to a user-facing message in the UI. */
export type RejectReason =
  | "unknown-code"
  | "self-referral"
  | "already-referred"
  | "existing-customer"
  | "monthly-cap";

export const REJECT_MESSAGE: Record<RejectReason, string> = {
  "unknown-code": "That invite code doesn’t exist — check the link your friend sent.",
  "self-referral": "You can’t invite yourself. Share your link with a friend instead!",
  "already-referred": "You’ve already used an invite code — one per customer.",
  "existing-customer": "Invite codes are for new customers only. Your first order was already placed.",
  "monthly-cap": "Your friend has hit their monthly reward cap. The invite still works, but no reward is paid.",
};

export interface Referral {
  id: string;
  name: string;
  email: string;
  /** When the friend accepted the invite. */
  joinedAt: string;
  source: ReferralSource;
  /** Set once the friend places a qualifying order. */
  order?: { id: string; total: number; placedAt: string };
  /** Set by a fraud check — a flagged referral never pays out. */
  flagged?: string;
}

export interface CreditSpend {
  id: string;
  orderId: string;
  amount: number;
  at: string;
}

export type ReferralStatus = "invited" | "expired" | "holding" | "unlocked" | "blocked";

export const STATUS_META: Record<ReferralStatus, { label: string; tone: string; hint: string }> = {
  invited: { label: "Invited", tone: "bg-surface-2 text-muted", hint: "Signed up — reward pays on their first order" },
  holding: { label: "Clearing", tone: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200", hint: "Order placed — credit unlocks after the returns window" },
  unlocked: { label: "Paid out", tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200", hint: "Credit is in your wallet" },
  expired: { label: "Expired", tone: "bg-surface-2 text-muted", hint: "No order within 30 days of joining" },
  blocked: { label: "Under review", tone: "bg-ember-500/15 text-ember-600", hint: "Flagged by our fraud checks" },
};

/* ------------------------------------------------------------------ codes */

/** FNV-1a — small, stable, and dependency-free. */
function hash(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Codes are derived, not stored: the same account always produces the same
 * code, so a link keeps working even if local state is cleared.
 */
export function codeFor(name: string, email: string) {
  const stem = (name.split(" ")[0] || email.split("@")[0] || "frosty").replace(/[^a-zA-Z]/g, "").slice(0, 7).toUpperCase() || "FROSTY";
  return `${stem}${hash(email.trim().toLowerCase()).toString(36).toUpperCase().slice(-3).padStart(3, "0")}`;
}

export const isValidCode = (code: string) => /^[A-Z]{3,10}[A-Z0-9]{3}$/.test(code.trim().toUpperCase());

export interface InviteContext {
  /** The visitor's own code, if signed in. */
  ownCode: string | null;
  /** A code already bound to this account. */
  referredBy: string | null;
  /** A code captured from a link but not yet bound to an account. */
  pendingCode: string | null;
  hasOrders: boolean;
}

/**
 * The single source of truth for invite eligibility — pure, so the landing
 * page can render the outcome directly and the store can reuse it to decide
 * whether to write. Returns null when the invite is (or already was) valid.
 */
export function evaluateInvite(code: string, ctx: InviteContext): RejectReason | null {
  const clean = code.trim().toUpperCase();
  // Re-visiting a link you already used is a success, not a rejection.
  if (ctx.referredBy === clean || ctx.pendingCode === clean) return null;
  if (!isValidCode(clean)) return "unknown-code";
  if (ctx.ownCode === clean) return "self-referral";
  if (ctx.referredBy) return "already-referred";
  if (ctx.hasOrders) return "existing-customer";
  return null;
}

export const inviteUrl = (code: string, origin = "https://frostly.pk") => `${origin}/invite/${code}`;

/* --------------------------------------------------------------- rewards */

export interface RewardBreakdown {
  base: number;
  rankBonus: number;
  volumeBonus: number;
  total: number;
}

const round10 = (n: number) => Math.round(n / 10) * 10;

/** Itemised so the dashboard can explain exactly where every rupee came from. */
export function rewardFor(orderTotal: number, rank: Rank): RewardBreakdown {
  const base = REFERRAL.baseReward;
  const rankBonus = round10(base * (rank.multiplier - 1));
  const volumeBonus = Math.min(
    REFERRAL.volumeBonusCap,
    round10(Math.max(0, orderTotal - REFERRAL.volumeBonusFrom) * REFERRAL.volumeBonusRate),
  );
  return { base, rankBonus, volumeBonus, total: base + rankBonus + volumeBonus };
}

export const rankFor = (unlockedCount: number) =>
  [...RANKS].reverse().find((r) => unlockedCount >= r.at) ?? RANKS[0];

export const nextRank = (rank: Rank): Rank | null => {
  const i = RANKS.findIndex((r) => r.key === rank.key);
  return i >= 0 && i < RANKS.length - 1 ? RANKS[i + 1] : null;
};

/* -------------------------------------------------------------- summary */

export interface EnrichedReferral extends Referral {
  status: ReferralStatus;
  /** Rank that was active when this referral converted — rewards never re-price. */
  rankAtConversion: Rank;
  reward: RewardBreakdown | null;
  /** Timestamp the credit becomes spendable (holding + unlocked only). */
  unlocksAt: number | null;
  /** Invite deadline (invited only). */
  expiresAt: number | null;
  /** Suppressed by the rolling monthly cap — converted, but unpaid. */
  cappedOut: boolean;
}

export interface MilestoneAward {
  at: number;
  label: string;
  reward: number;
  /** Null until the referral count reaches the threshold. */
  reachedAt: string | null;
}

export interface ReferralSummary {
  records: EnrichedReferral[];
  rank: Rank;
  next: Rank | null;
  /** Referrals whose credit has cleared — the number that drives rank. */
  unlockedCount: number;
  holdingCount: number;
  invitedCount: number;
  /** Paid out so far. */
  earned: number;
  /** Cleared but still held. */
  pending: number;
  /** Best-case value of everyone who hasn't ordered yet. */
  potential: number;
  conversionRate: number;
  milestones: MilestoneAward[];
  /** Rewards paid in the last rolling 30 days, against `REFERRAL.monthlyCap`. */
  monthlyUsed: number;
  bySource: { source: ReferralSource; count: number; converted: number }[];
}

export function referralStatus(r: Referral, now: number): ReferralStatus {
  if (r.flagged) return "blocked";
  if (!r.order) return now - +new Date(r.joinedAt) > REFERRAL.inviteExpiryMs ? "expired" : "invited";
  return +new Date(r.order.placedAt) + REFERRAL.holdMs > now ? "holding" : "unlocked";
}

/**
 * Walks every referral in conversion order so each reward is priced at the
 * rank the referrer held *at that moment* — a Legend doesn't retroactively
 * re-price the referrals they earned as a Starter. This ordering also decides
 * which conversions fall inside the rolling monthly cap.
 */
export function summarize(referrals: Referral[], now: number): ReferralSummary {
  const converted = referrals
    .filter((r) => r.order && !r.flagged)
    .sort((a, b) => +new Date(a.order!.placedAt) - +new Date(b.order!.placedAt));

  const priced = new Map<string, { reward: RewardBreakdown; rank: Rank; capped: boolean }>();
  let cleared = 0;
  let monthlyUsed = 0;

  for (const r of converted) {
    const placedAt = +new Date(r.order!.placedAt);
    const rank = rankFor(cleared);
    // Rolling 30-day window ending at this conversion.
    const inWindow = converted.filter((o) => {
      const t = +new Date(o.order!.placedAt);
      return t <= placedAt && t > placedAt - 30 * 86_400_000;
    }).length;
    const capped = inWindow > REFERRAL.monthlyCap;
    priced.set(r.id, { reward: rewardFor(r.order!.total, rank), rank, capped });
    if (referralStatus(r, now) === "unlocked" && !capped) cleared++;
    if (!capped && placedAt > now - 30 * 86_400_000) monthlyUsed++;
  }

  const records: EnrichedReferral[] = [...referrals]
    .sort((a, b) => +new Date(b.joinedAt) - +new Date(a.joinedAt))
    .map((r) => {
      const status = referralStatus(r, now);
      const p = priced.get(r.id);
      return {
        ...r,
        status,
        rankAtConversion: p?.rank ?? rankFor(cleared),
        reward: p && !p.capped ? p.reward : null,
        unlocksAt: r.order ? +new Date(r.order.placedAt) + REFERRAL.holdMs : null,
        expiresAt: r.order ? null : +new Date(r.joinedAt) + REFERRAL.inviteExpiryMs,
        cappedOut: !!p?.capped,
      };
    });

  const sum = (list: EnrichedReferral[]) => list.reduce((s, r) => s + (r.reward?.total ?? 0), 0);
  const unlocked = records.filter((r) => r.status === "unlocked");
  const holding = records.filter((r) => r.status === "holding");
  const invited = records.filter((r) => r.status === "invited");
  const rank = rankFor(unlocked.filter((r) => !r.cappedOut).length);

  const milestones: MilestoneAward[] = MILESTONES.map((m) => {
    // Nth conversion to clear is what triggers the milestone.
    const nth = [...unlocked].sort((a, b) => +new Date(a.order!.placedAt) - +new Date(b.order!.placedAt))[m.at - 1];
    return { ...m, reachedAt: nth ? new Date(+new Date(nth.order!.placedAt) + REFERRAL.holdMs).toISOString() : null };
  });

  const bySource = SOURCES.map((source) => {
    const list = records.filter((r) => r.source === source);
    return { source, count: list.length, converted: list.filter((r) => r.order).length };
  }).filter((s) => s.count > 0);

  return {
    records,
    rank,
    next: nextRank(rank),
    unlockedCount: unlocked.length,
    holdingCount: holding.length,
    invitedCount: invited.length,
    earned: sum(unlocked),
    pending: sum(holding),
    potential: invited.length * rewardFor(0, rank).total,
    conversionRate: records.length ? (records.filter((r) => r.order).length / records.length) * 100 : 0,
    milestones,
    monthlyUsed,
    bySource,
  };
}

/* --------------------------------------------------------------- wallet */

export interface LedgerEntry {
  id: string;
  kind: "referral" | "milestone" | "spend" | "expired";
  label: string;
  sub?: string;
  /** Positive credits, negative debits. */
  amount: number;
  at: string;
  expiresAt?: string;
}

export interface Wallet {
  entries: LedgerEntry[];
  /** Spendable right now. */
  balance: number;
  /** Cleared but still inside the holding window. */
  pending: number;
  lifetime: number;
  spent: number;
  expired: number;
  /** Credit that lapses within 14 days, to nudge the user at checkout. */
  expiringSoon: number;
}

/**
 * The ledger is rebuilt from scratch on every read: earn rows come from the
 * referral records, debits from the persisted spends. Only the debits are
 * actually stored, which makes double-crediting structurally impossible.
 */
export function buildWallet(summary: ReferralSummary, spends: CreditSpend[], now: number): Wallet {
  const entries: LedgerEntry[] = [];

  for (const r of summary.records) {
    if (r.status !== "unlocked" || !r.reward) continue;
    const at = new Date(r.unlocksAt!).toISOString();
    entries.push({
      id: `earn-${r.id}`,
      kind: "referral",
      label: `${r.name} completed their first order`,
      sub: `Rs. ${r.reward.base} base${r.reward.rankBonus ? ` · +Rs. ${r.reward.rankBonus} ${r.rankAtConversion.name}` : ""}${r.reward.volumeBonus ? ` · +Rs. ${r.reward.volumeBonus} basket bonus` : ""}`,
      amount: r.reward.total,
      at,
      expiresAt: new Date(r.unlocksAt! + REFERRAL.creditExpiryMs).toISOString(),
    });
  }

  for (const m of summary.milestones) {
    if (!m.reachedAt) continue;
    entries.push({
      id: `milestone-${m.at}`,
      kind: "milestone",
      label: `${m.label} unlocked`,
      sub: `${m.at} friends referred`,
      amount: m.reward,
      at: m.reachedAt,
      expiresAt: new Date(+new Date(m.reachedAt) + REFERRAL.creditExpiryMs).toISOString(),
    });
  }

  for (const s of spends) {
    entries.push({ id: s.id, kind: "spend", label: `Applied to order ${s.orderId}`, amount: -s.amount, at: s.at });
  }

  entries.sort((a, b) => +new Date(b.at) - +new Date(a.at));

  const credits = entries.filter((e) => e.amount > 0);
  const live = credits.filter((e) => !e.expiresAt || +new Date(e.expiresAt) > now);
  const lifetime = credits.reduce((s, e) => s + e.amount, 0);
  const expired = credits.reduce((s, e) => s + e.amount, 0) - live.reduce((s, e) => s + e.amount, 0);
  const spent = spends.reduce((s, e) => s + e.amount, 0);

  return {
    entries,
    balance: Math.max(0, live.reduce((s, e) => s + e.amount, 0) - spent),
    pending: summary.pending,
    lifetime,
    spent,
    expired,
    expiringSoon: live
      .filter((e) => e.expiresAt && +new Date(e.expiresAt) - now < 14 * 86_400_000)
      .reduce((s, e) => s + e.amount, 0),
  };
}

/** Credit can never cover more than half a basket, and never pays for delivery. */
export const maxCreditFor = (subtotal: number, balance: number) =>
  Math.max(0, Math.min(balance, Math.floor((subtotal * REFERRAL.maxCreditShare) / 10) * 10));

/* ---------------------------------------------------------- demo cohort */

const DEMO_NAMES = [
  "Hira Malik", "Usman Tariq", "Fatima Zahra", "Bilal Ahmed", "Mahnoor Shah",
  "Daniyal Haider", "Sana Mirza", "Omar Siddiqui", "Zainab Ali", "Hamza Raza",
];

/**
 * Seeds a believable referral history for a fresh demo account — deterministic
 * from the email, so signing in twice never reshuffles the dashboard.
 */
export function seedReferrals(email: string, now: number): Referral[] {
  let seed = (hash(email) % 2147483646) + 1;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // Mix of states: paid out, clearing, still just invited, one expired, one flagged.
  const plan: { daysAgo: number; ordered: boolean; hoursAfter?: number; flagged?: string }[] = [
    { daysAgo: 34, ordered: true, hoursAfter: 20 },
    { daysAgo: 26, ordered: true, hoursAfter: 50 },
    { daysAgo: 19, ordered: true, hoursAfter: 8 },
    { daysAgo: 12, ordered: true, hoursAfter: 30 },
    { daysAgo: 38, ordered: false },
    { daysAgo: 6, ordered: false },
    { daysAgo: 2, ordered: false },
    { daysAgo: 9, ordered: true, hoursAfter: 12, flagged: "Same device fingerprint as the referrer" },
  ];

  // Drawn without replacement so the demo list never shows the same friend twice.
  const pool = [...DEMO_NAMES];

  return plan.map((p, i) => {
    const joinedAt = now - p.daysAgo * 86_400_000 - Math.floor(rand() * 6) * 3_600_000;
    const name = pool.splice(Math.floor(rand() * pool.length), 1)[0] ?? DEMO_NAMES[i % DEMO_NAMES.length];
    return {
      id: `ref-${hash(email + i).toString(36)}`,
      name,
      email: `${name.split(" ")[0].toLowerCase()}${i}@mail.pk`,
      joinedAt: new Date(joinedAt).toISOString(),
      source: SOURCES[Math.floor(rand() * SOURCES.length)],
      flagged: p.flagged,
      order: p.ordered
        ? {
            id: `FRL-${20000 + Math.floor(rand() * 9000)}`,
            total: 2200 + Math.floor(rand() * 60) * 100,
            placedAt: new Date(joinedAt + (p.hoursAfter ?? 12) * 3_600_000).toISOString(),
          }
        : undefined,
    };
  });
}

/* ------------------------------------------------- program-wide analytics */

export interface ProgramStats {
  referrers: number;
  invites: number;
  converted: number;
  blocked: number;
  conversionRate: number;
  /** Credit owed to referrers. */
  rewardCost: number;
  /** First-order discounts given to invited friends. */
  discountCost: number;
  attributedRevenue: number;
  /** Net revenue per rupee of programme spend. */
  roi: number;
  /** Blended cost of acquiring one referred customer. */
  cac: number;
  /** Viral coefficient: invites per referrer × conversion rate. >1 is self-sustaining. */
  kFactor: number;
  fraudRate: number;
  byChannel: { source: ReferralSource; invites: number; converted: number; revenue: number }[];
  daily: { label: string; invites: number; conversions: number }[];
}

/**
 * Programme-level roll-up for the admin dashboard. Rewards are priced through
 * the same `summarize` walk each referrer's own dashboard uses, so the finance
 * view and the customer view can never disagree.
 */
export function programStats(now: number): ProgramStats {
  let seed = 20260918;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const cohorts: Referral[][] = [];
  const referrers = 180;

  for (let r = 0; r < referrers; r++) {
    // Most people refer nobody; a long tail carries the programme.
    const n = rand() < 0.45 ? 0 : rand() < 0.8 ? 1 + Math.floor(rand() * 3) : 4 + Math.floor(rand() * 12);
    const list: Referral[] = [];
    for (let i = 0; i < n; i++) {
      const joinedAt = now - Math.floor(rand() * 90) * 86_400_000 - Math.floor(rand() * 24) * 3_600_000;
      const convertsAt = rand();
      list.push({
        id: `p${r}-${i}`,
        name: DEMO_NAMES[Math.floor(rand() * DEMO_NAMES.length)],
        email: `p${r}i${i}@mail.pk`,
        joinedAt: new Date(joinedAt).toISOString(),
        source: SOURCES[Math.floor(rand() * SOURCES.length)],
        flagged: rand() < 0.03 ? "Flagged by device fingerprint" : undefined,
        order: convertsAt < 0.58
          ? { id: `FRL-${10000 + Math.floor(rand() * 89999)}`, total: 2000 + Math.floor(rand() * 80) * 100, placedAt: new Date(joinedAt + Math.floor(rand() * 96) * 3_600_000).toISOString() }
          : undefined,
      });
    }
    if (list.length) cohorts.push(list);
  }

  const all = cohorts.flat();
  const summaries = cohorts.map((c) => summarize(c, now));
  const rewardCost = summaries.reduce(
    (s, sum) =>
      s +
      sum.records.reduce((t, r) => t + (r.status === "unlocked" ? r.reward?.total ?? 0 : 0), 0) +
      sum.milestones.filter((m) => m.reachedAt).reduce((t, m) => t + m.reward, 0),
    0,
  );

  const convertedList = all.filter((r) => r.order && !r.flagged);
  const attributedRevenue = convertedList.reduce((s, r) => s + r.order!.total, 0);
  const discountCost = convertedList.filter((r) => r.order!.total >= REFERRAL.friendMinSpend).length * REFERRAL.friendDiscount;
  const spend = rewardCost + discountCost;
  const conversionRate = all.length ? (convertedList.length / all.length) * 100 : 0;

  const daily = Array.from({ length: 14 }, (_, i) => {
    const start = new Date(now - (13 - i) * 86_400_000);
    start.setHours(0, 0, 0, 0);
    const end = +start + 86_400_000;
    const within = (t: string) => +new Date(t) >= +start && +new Date(t) < end;
    return {
      label: start.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      invites: all.filter((r) => within(r.joinedAt)).length,
      conversions: all.filter((r) => r.order && within(r.order.placedAt)).length,
    };
  });

  return {
    referrers: cohorts.length,
    invites: all.length,
    converted: convertedList.length,
    blocked: all.filter((r) => r.flagged).length,
    conversionRate,
    rewardCost,
    discountCost,
    attributedRevenue,
    roi: spend ? (attributedRevenue - spend) / spend : 0,
    cac: convertedList.length ? spend / convertedList.length : 0,
    kFactor: cohorts.length ? (all.length / cohorts.length) * (conversionRate / 100) : 0,
    fraudRate: all.length ? (all.filter((r) => r.flagged).length / all.length) * 100 : 0,
    byChannel: SOURCES.map((source) => {
      const list = all.filter((r) => r.source === source);
      return {
        source,
        invites: list.length,
        converted: list.filter((r) => r.order && !r.flagged).length,
        revenue: list.reduce((s, r) => s + (r.order && !r.flagged ? r.order.total : 0), 0),
      };
    }).sort((a, b) => b.revenue - a.revenue),
    daily,
  };
}

/** Deterministic leaderboard cohort the signed-in user is ranked against. */
export function leaderboard(myCount: number, myName: string) {
  const rows = [
    { name: "Ayesha K.", count: 31 },
    { name: "Mahnoor S.", count: 24 },
    { name: "Bilal A.", count: 18 },
    { name: "Hamza R.", count: 14 },
    { name: "Sana M.", count: 11 },
    { name: "Omar S.", count: 9 },
    { name: "Zainab A.", count: 6 },
    { name: "Daniyal H.", count: 4 },
    { name: "Hira M.", count: 2 },
  ].map((r) => ({ ...r, you: false }));

  return [...rows, { name: myName, count: myCount, you: true }]
    .sort((a, b) => b.count - a.count || (a.you ? 1 : -1))
    .map((r, i) => ({ ...r, position: i + 1 }));
}
