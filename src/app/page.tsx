import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Box, ChevronDown, Clock, Leaf, RotateCcw, ShieldCheck, Snowflake, Star, Thermometer, Truck,
} from "lucide-react";
import { categories, products } from "@/lib/products";
import { discountPercent, img } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { Countdown } from "@/components/home/Countdown";
import { BestsellerTabs } from "@/components/home/BestsellerTabs";
import { BundleBuilder } from "@/components/home/BundleBuilder";
import { DeliveryChecker } from "@/components/home/DeliveryChecker";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { Newsletter } from "@/components/Newsletter";

const deals = [...products]
  .sort((a, b) => discountPercent(b.variants[0].price, b.variants[0].compareAt) - discountPercent(a.variants[0].price, a.variants[0].compareAt))
  .slice(0, 4);

const trust = [
  { icon: ShieldCheck, title: "HFA Halal Certified", body: "Every meat product, every batch" },
  { icon: Thermometer, title: "Unbroken -18°C Cold Chain", body: "Temperature-logged to your door" },
  { icon: Clock, title: "Pick Your Delivery Slot", body: "Same-day in 4 major cities" },
  { icon: RotateCcw, title: "Freshness Guarantee", body: "Not perfect? Full refund, no questions" },
];

const steps = [
  { icon: Snowflake, title: "Blast frozen at -35°C", body: "Food is frozen within 2 hours of cooking to lock in taste, texture and nutrients." },
  { icon: Box, title: "Packed in insulated boxes", body: "EPS-lined boxes with dry-ice gel packs hold temperature for up to 18 hours." },
  { icon: Truck, title: "Refrigerated riders", body: "Our own freezer-van fleet with live temperature telemetry — no third-party couriers." },
  { icon: BadgeCheck, title: "Checked at your door", body: "Riders scan box temperature on delivery. Above -12°C? We replace it free." },
];

const testimonials = [
  { name: "Ayesha Khan", city: "DHA Lahore", body: "The seekh kebabs taste exactly like my nani’s. Delivery arrived in the slot I picked and everything was rock-solid frozen.", rating: 5 },
  { name: "Omar Siddiqui", city: "Clifton, Karachi", body: "Ordered the Dutch oven with a frozen haul — both came in one box, beautifully packed. The live tracking is genuinely useful.", rating: 5 },
  { name: "Hira Malik", city: "F-7 Islamabad", body: "As a working mom, the ready meals and samosas have saved my evenings. Checkout takes 30 seconds and JazzCash just works.", rating: 5 },
];

const faqs = [
  { q: "How does frozen food stay frozen during delivery?", a: "Orders are packed in EPS-insulated boxes with gel ice packs and delivered in our own refrigerated vans. Each box holds below -12°C for 18+ hours, and riders check the temperature at your door." },
  { q: "Which cities do you deliver to?", a: "Same-day delivery in Lahore, Karachi, Islamabad and Rawalpindi. Next-day delivery to Faisalabad, Multan, Peshawar, Sialkot and Gujranwala, with more cities added monthly." },
  { q: "Are all products halal?", a: "Yes. All meat and poultry products are HFA Halal certified, and certificates are available on request for every batch." },
  { q: "Can I order kitchen products and frozen food together?", a: "Absolutely. Everything ships in a single delivery — kitchen items are packed separately from the cold box." },
  { q: "What payment methods do you accept?", a: "Cash on delivery, Visa/Mastercard debit & credit cards, JazzCash and Easypaisa wallets." },
  { q: "What if something arrives damaged or thawed?", a: "Snap a photo within 24 hours and we’ll send a free replacement or a full refund — your choice." },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[36rem] rounded-full bg-frost-300/30 blur-3xl dark:bg-frost-700/20" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 size-[28rem] rounded-full bg-ember-400/15 blur-3xl" />
        <div className="container-x relative grid items-center gap-12 py-12 md:py-20 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold">
              <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex size-2 rounded-full bg-emerald-500" /></span>
              Now delivering same-day in Lahore, Karachi & Islamabad
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl xl:text-7xl">
              Restaurant-quality food, <span className="bg-gradient-to-r from-frost-500 to-frost-700 bg-clip-text italic text-transparent dark:from-frost-300 dark:to-frost-500">frozen fresh</span> for your family.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Halal nuggets, charcoal-grilled kebabs, ready meals and premium kitchen essentials — delivered at -18°C in a slot that suits you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop?store=frozen" className="group inline-flex items-center gap-2 rounded-full bg-frost-600 px-7 py-4 font-semibold text-white shadow-xl shadow-frost-600/25 transition hover:bg-frost-700">
                Shop Frozen Foods <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
              <Link href="/shop?store=kitchen" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-7 py-4 font-semibold transition hover:bg-surface-2">
                Kitchen Essentials
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6">
              {[["50k+", "Happy families"], ["4.8★", "12,400 reviews"], ["99.2%", "On-time delivery"]].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-semibold">{n}</dt>
                  <dd className="text-sm text-muted">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4" style={{ aspectRatio: "1 / 1" }}>
              <div className="relative col-span-3 row-span-4 overflow-hidden rounded-[2rem]">
                <Image src={img("1603360946369-dc9bb6258143", 900)} alt="Charcoal grilled seekh kebabs" fill priority sizes="(min-width: 1024px) 380px, 60vw" className="object-cover" />
              </div>
              <div className="relative col-span-2 row-span-3 overflow-hidden rounded-[2rem]">
                <Image src={img("1562967914-608f82629710", 600)} alt="Crispy chicken nuggets" fill priority sizes="(min-width: 1024px) 250px, 40vw" className="object-cover" />
              </div>
              <div className="relative col-span-2 row-span-3 overflow-hidden rounded-[2rem]">
                <Image src={img("1590794056226-79ef3a8147e1", 600)} alt="Enamel cast iron dutch oven" fill sizes="(min-width: 1024px) 250px, 40vw" className="object-cover" />
              </div>
              <div className="relative col-span-3 row-span-2 overflow-hidden rounded-[2rem]">
                <Image src={img("1601050690597-df0568f70950", 800)} alt="Aloo samosas" fill sizes="(min-width: 1024px) 380px, 60vw" className="object-cover" />
              </div>
            </div>
            <div className="absolute -left-4 top-8 flex animate-float items-center gap-3 rounded-2xl border border-line bg-surface/95 p-3 pr-5 shadow-2xl backdrop-blur sm:-left-8">
              <div className="grid size-10 place-items-center rounded-xl bg-frost-100 text-frost-700 dark:bg-frost-900 dark:text-frost-200"><Thermometer className="size-5" /></div>
              <div>
                <p className="text-[11px] text-muted">Live box temperature</p>
                <p className="font-bold tabular-nums">-18.4°C</p>
              </div>
            </div>
            <div className="absolute -right-2 bottom-16 flex animate-float items-center gap-3 rounded-2xl border border-line bg-surface/95 p-3 pr-5 shadow-2xl backdrop-blur [animation-delay:1.5s] sm:-right-6">
              <div className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"><Truck className="size-5" /></div>
              <div>
                <p className="text-[11px] text-muted">Order #FRL-28413</p>
                <p className="text-sm font-bold">Arriving in 24 min</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-line bg-surface">
        <div className="container-x grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-frost-50 text-frost-600 dark:bg-frost-900/40 dark:text-frost-300"><Icon className="size-5" /></div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TWO STORES */}
      <section className="container-x mt-20 grid gap-5 md:grid-cols-2">
        {[
          { href: "/shop?store=frozen", title: "Frozen Foods", body: "22 chef-crafted, halal favourites — from nuggets to salmon.", image: "1555939594-58d7cb561ad1", cta: "Shop frozen" },
          { href: "/shop?store=kitchen", title: "Kitchen Essentials", body: "Cookware, appliances & tools picked by our test kitchen.", image: "1556909114-f6e7ad7d3136", cta: "Shop kitchen" },
        ].map((s) => (
          <Link key={s.href} href={s.href} className="group relative flex min-h-80 overflow-hidden rounded-[2rem] p-8 text-white">
            <Image src={img(s.image, 1200)} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-frost-900/90 via-frost-900/40 to-transparent" />
            <div className="relative mt-auto">
              <h2 className="font-display text-4xl font-semibold">{s.title}</h2>
              <p className="mt-2 max-w-sm text-white/85">{s.body}</p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-frost-900">
                {s.cta} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* CATEGORIES */}
      <section className="container-x mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-frost-600 dark:text-frost-300">Browse</p>
            <h2 className="mt-1 font-display text-4xl font-semibold">Shop by category</h2>
          </div>
          <Link href="/shop" className="hidden items-center gap-1 text-sm font-semibold hover:underline sm:inline-flex">View all <ArrowRight className="size-4" /></Link>
        </div>
        <div className="-mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-4 md:px-0 lg:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.slug} href={`/shop?store=${c.store}&category=${c.slug}`} className="group w-36 shrink-0 snap-start md:w-auto">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface-2">
                <Image src={img(c.image, 400)} alt="" fill sizes="(min-width: 1024px) 200px, 150px" className="object-cover transition duration-500 group-hover:scale-110" />
              </div>
              <p className="mt-3 text-sm font-semibold group-hover:text-frost-600 dark:group-hover:text-frost-300">{c.name}</p>
              <p className="text-xs text-muted">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FLASH DEALS */}
      <section className="container-x mt-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-frost-700 via-frost-800 to-frost-900 p-6 text-white md:p-10">
          <Snowflake className="pointer-events-none absolute -right-10 -top-10 size-64 text-white/5" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-ember-500 px-3 py-1 text-xs font-bold uppercase tracking-wider">⚡ Flash deals</p>
              <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Today only. Up to 20% off.</h2>
              <p className="mt-2 text-white/75">Prices reset at midnight — stock up while they last.</p>
            </div>
            <Countdown />
          </div>
          <div className="relative mt-8 grid grid-cols-2 gap-3 text-fg sm:gap-5 lg:grid-cols-4">
            {deals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="container-x mt-20">
        <p className="text-sm font-semibold uppercase tracking-wider text-frost-600 dark:text-frost-300">Loved by 50,000+ homes</p>
        <h2 className="mb-6 mt-1 font-display text-4xl font-semibold">Bestsellers this week</h2>
        <BestsellerTabs />
      </section>

      {/* BUNDLE */}
      <section className="container-x mt-20"><BundleBuilder /></section>

      {/* COLD CHAIN */}
      <section id="cold-chain" className="container-x mt-20 scroll-mt-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-frost-600 dark:text-frost-300">The Frostly promise</p>
            <h2 className="mt-1 font-display text-4xl font-semibold md:text-5xl">From our kitchen to your freezer — never above -12°C.</h2>
            <p className="mt-4 text-muted">Most “frozen” deliveries thaw and refreeze on the way. Ours don’t. Every box is tracked by temperature sensors from blast freezer to doorstep.</p>
            <ol className="mt-8 space-y-5">
              {steps.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="flex gap-4">
                  <div className="relative">
                    <div className="grid size-12 place-items-center rounded-2xl bg-frost-600 text-white"><Icon className="size-5" /></div>
                    {i < steps.length - 1 && <div className="absolute left-1/2 top-12 h-5 w-px -translate-x-1/2 bg-line" />}
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-frost-900 p-6 text-white md:p-10">
            <Image src={img("1556911220-bff31c812dba", 1000)} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-25" />
            <div className="relative">
              <h3 className="font-display text-3xl font-semibold">Delivering near you?</h3>
              <p className="mt-2 text-white/75">12 cities and growing. Same-day slots in Lahore, Karachi, Islamabad & Rawalpindi.</p>
              <div className="mt-6"><DeliveryChecker /></div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[["-18°C", "Avg. at door"], ["18 hrs", "Box hold time"], ["0.4%", "Replacement rate"]].map(([n, l]) => (
                  <div key={l} className="rounded-2xl bg-white/10 p-3">
                    <p className="font-display text-2xl font-semibold">{n}</p>
                    <p className="text-[11px] text-white/70">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-x mt-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-1 text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-5" fill="currentColor" />)}</div>
          <h2 className="mt-2 font-display text-4xl font-semibold">4.8 out of 5 from 12,400+ reviews</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-3xl border border-line bg-surface p-7">
              <div className="flex text-amber-400">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="size-4" fill="currentColor" />)}</div>
              <blockquote className="mt-4 flex-1 leading-relaxed">“{t.body}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-frost-400 to-frost-700 font-semibold text-white">{t.name[0]}</span>
                <span>
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="flex items-center gap-1 text-xs text-muted"><BadgeCheck className="size-3.5 text-emerald-500" /> Verified buyer · {t.city}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-semibold text-muted">
          <span className="inline-flex items-center gap-2"><ShieldCheck className="size-5" /> HFA Halal</span>
          <span className="inline-flex items-center gap-2"><BadgeCheck className="size-5" /> PFA Licensed</span>
          <span className="inline-flex items-center gap-2"><Leaf className="size-5" /> No added preservatives</span>
          <span className="inline-flex items-center gap-2"><Snowflake className="size-5" /> ISO 22000 cold storage</span>
        </div>
      </section>

      <RecentlyViewed />

      {/* FAQ */}
      <section id="faq" className="container-x mt-20 grid scroll-mt-28 gap-10 lg:grid-cols-[1fr_1.5fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-frost-600 dark:text-frost-300">FAQ</p>
          <h2 className="mt-1 font-display text-4xl font-semibold">Questions, answered.</h2>
          <p className="mt-3 text-muted">Can’t find what you need? WhatsApp our support team — average reply time is under 4 minutes.</p>
        </div>
        <div className="divide-y divide-line rounded-3xl border border-line bg-surface">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
                {f.q}
                <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container-x mt-20">
        <div className="grid items-center gap-8 rounded-[2rem] border border-line bg-surface p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="font-display text-4xl font-semibold">Get 10% off your first order</h2>
            <p className="mt-2 text-muted">Join 30,000 subscribers for weekly flash deals, new drops and 15-minute recipes.</p>
          </div>
          <Newsletter />
        </div>
      </section>
    </>
  );
}
