# Frostly — Frozen Foods & Kitchen Essentials

A portfolio-grade e-commerce storefront for an online frozen-food business with a second store for kitchen products. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4** and **Zustand**.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (lint + type-check clean)
```

## Demo walkthrough (for client presentations)

1. **Home** → hero, trust strip, two-store split, categories, live flash-deal countdown, bestseller tabs, bundle builder, delivery-city checker, reviews, FAQ.
2. **Shop** → filter by store/category/price/diet/rating/stock, sort, URL-synced filters, mobile filter sheet.
3. **Product** → zoom gallery, pack-size variants, nutrition facts, cooking guide, specs, reviews with rating breakdown, “cook it better with” cross-sell from the other store.
4. **Cart → Checkout** → free-delivery progress bar, promo codes (`WELCOME10`, `FROSTY500`, `FREESHIP`), 3-step checkout with validation, city-aware delivery slots, COD / card (Luhn check, brand detection — use `4242 4242 4242 4242`) / JazzCash / Easypaisa.
5. **Order tracking** → animated route map, live box temperature, status timeline (accelerated to ~5 min for demos). Try `/order/FRL-28413`.
6. **Account** → demo login, order history, Frost Points loyalty tier, referral standing.
7. **Refer & Earn** (`/referrals`) → invite link + per-channel share tools, rank progression, friends table with live reward states, credit ledger, leaderboard. Use the **Demo controls** at the bottom to walk a referral through the full state machine.
8. **Invite landing** (`/invite/GUEST072`) → what an invited friend sees. Visiting your own link demonstrates the self-referral guard.
9. **Admin** (`/admin`) → KPIs vs previous week, 14-day revenue chart, category revenue, referral programme analytics (K-factor, ROI, CAC, channel attribution), top sellers, inventory alerts, searchable order table, CSV export. Orders you place appear here.

## Feature list

| Area | Features |
|---|---|
| Conversion | Flash-deal countdown, bundle builder with auto promo, cross-store cross-sell, low-stock & live-viewer urgency, free-shipping progress bar, “Buy it now”, save-for-later |
| Trust | Halal/cold-chain badges, verified reviews, rating distribution, freshness guarantee, secure-checkout cues, WhatsApp support |
| Frozen-food specific | -18°C cold-chain story, delivery-city checker, same-day vs next-day slots, nutrition & cooking guides, live box temperature on tracking |
| UX | Instant search with keyboard navigation (`/` to focus), cart drawer, toasts, wishlist, recently viewed, dark mode, skeleton loaders, custom 404 |
| SEO & a11y | Per-page metadata, Open Graph, Product JSON-LD, sitemap.xml, robots.txt, static generation of product pages, skip link, ARIA labels, reduced-motion support |
| Referrals | Two-sided rewards, derived invite codes, per-channel attribution, reward state machine with holding period, rank multipliers, milestone bonuses, credit wallet + ledger, redemption at checkout, anti-abuse guards, leaderboard, programme analytics |
| Operations | Admin dashboard, inventory alerts, order status pipeline, CSV export |

## Project structure

```
src/
  app/               routes (home, shop, product/[slug], cart, checkout, order/[id], track, wishlist, account, admin)
  components/        shared UI (header, footer, cart drawer, product card, search, toasts…)
  lib/products.ts    catalog: 35 products, 12 categories
  lib/store.ts       cart / wishlist / orders / promo state (persisted to localStorage)
  lib/orders.ts      order status pipeline + deterministic demo orders
  lib/referrals.ts   referral engine: rewards, ranks, wallet, fraud guards, analytics
```

## Referral system

The most involved subsystem in the project. `lib/referrals.ts` is pure domain logic — no React, no store, no I/O — so every rule is testable in isolation and the UI only renders what it returns.

**Derived, not stored.** Only two things are persisted: the list of referrals and the list of credit debits. Reward status, wallet balance, rank, milestones and the ledger are all recomputed from those plus the current timestamp, exactly like the delivery pipeline in `lib/orders.ts`. Nothing is written on a timer, so state cannot drift out of sync with the clock and a reload always recomputes the truth. Because credits are derived rather than stored, double-crediting is structurally impossible.

**Reward lifecycle.** `invited → clearing → paid out`, plus `expired` (no order within 30 days) and `under review` (caught by a fraud check). Credit clears only after a holding period covering the returns window, so a cancelled order never pays out. The window is accelerated to 3 minutes for demos.

**Rewards are priced at conversion time.** `summarize()` walks conversions in chronological order and prices each one at the rank the referrer held *at that moment* — reaching Legend does not retroactively re-price the referrals earned as a Starter. The same walk decides which conversions fall inside the rolling 30-day payout cap. Each reward is itemised (base + rank bonus + basket bonus) so the dashboard can explain every rupee.

| Rank | At | Multiplier |
|---|---|---|
| Starter | 0 | ×1 |
| Insider | 3 | ×1.15 |
| Ambassador | 8 | ×1.35 |
| Legend | 15 | ×1.6 |

**Anti-abuse.** `evaluateInvite()` is the single source of truth for eligibility — self-referral, one-invite-per-customer, new-customers-only, malformed codes, and the monthly payout cap. It is pure, so the landing page renders the outcome directly and the store reuses it to decide whether to write, which keeps arriving on a link idempotent.

**Both sides of the deal.** The invited friend gets Rs. 500 off their first order over Rs. 2,000; the referrer earns credit that is redeemable at checkout for up to 50% of a basket, never against the delivery fee, expiring 90 days after it clears.

**Programme view.** `/admin` rolls the same pricing walk up across a synthetic 180-referrer cohort to report K-factor, ROI, cost per acquired customer, fraud rate and revenue by share channel — so the finance view and the customer view can never disagree.

> Demo data only: there is no backend or real payment processing. State is kept in the browser's localStorage. Product photos are from Unsplash.
