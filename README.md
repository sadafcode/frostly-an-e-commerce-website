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
6. **Account** → demo login, order history, Frost Points loyalty tier.
7. **Admin** (`/admin`) → KPIs vs previous week, 14-day revenue chart, category revenue, top sellers, inventory alerts, searchable order table, CSV export. Orders you place appear here.

## Feature list

| Area | Features |
|---|---|
| Conversion | Flash-deal countdown, bundle builder with auto promo, cross-store cross-sell, low-stock & live-viewer urgency, free-shipping progress bar, “Buy it now”, save-for-later |
| Trust | Halal/cold-chain badges, verified reviews, rating distribution, freshness guarantee, secure-checkout cues, WhatsApp support |
| Frozen-food specific | -18°C cold-chain story, delivery-city checker, same-day vs next-day slots, nutrition & cooking guides, live box temperature on tracking |
| UX | Instant search with keyboard navigation (`/` to focus), cart drawer, toasts, wishlist, recently viewed, dark mode, skeleton loaders, custom 404 |
| SEO & a11y | Per-page metadata, Open Graph, Product JSON-LD, sitemap.xml, robots.txt, static generation of product pages, skip link, ARIA labels, reduced-motion support |
| Operations | Admin dashboard, inventory alerts, order status pipeline, CSV export |

## Project structure

```
src/
  app/               routes (home, shop, product/[slug], cart, checkout, order/[id], track, wishlist, account, admin)
  components/        shared UI (header, footer, cart drawer, product card, search, toasts…)
  lib/products.ts    catalog: 35 products, 12 categories
  lib/store.ts       cart / wishlist / orders / promo state (persisted to localStorage)
  lib/orders.ts      order status pipeline + deterministic demo orders
```

> Demo data only: there is no backend or real payment processing. State is kept in the browser's localStorage. Product photos are from Unsplash.
