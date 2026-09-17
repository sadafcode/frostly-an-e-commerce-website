"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Banknote, Check, CreditCard, Loader2, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { computeTotals, resolveLines, useHydrated, useShop, type OrderAddress } from "@/lib/store";
import { cn, formatPrice, img } from "@/lib/format";
import { CITIES } from "@/components/home/DeliveryChecker";
import { PromoInput, Totals } from "@/components/OrderSummary";
import { Steps } from "../cart/CartView";

const WINDOWS = ["10am – 1pm", "1pm – 4pm", "4pm – 7pm", "7pm – 10pm"];

const PAYMENTS = [
  { key: "cod", label: "Cash on Delivery", body: "Pay the rider in cash or by card", icon: Banknote },
  { key: "card", label: "Credit / Debit Card", body: "Visa, Mastercard, UnionPay", icon: CreditCard },
  { key: "jazzcash", label: "JazzCash", body: "Pay from your mobile wallet", icon: Smartphone },
  { key: "easypaisa", label: "Easypaisa", body: "Pay from your mobile wallet", icon: Smartphone },
] as const;

type Errors = Partial<Record<string, string>>;

const newOrderId = () => `FRL-${Math.floor(10000 + Math.random() * 89999)}`;

const luhn = (num: string) => {
  let sum = 0;
  [...num].reverse().forEach((d, i) => {
    let n = Number(d);
    if (i % 2) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  });
  return num.length >= 13 && sum % 10 === 0;
};

const cardBrand = (num: string) => (/^4/.test(num) ? "VISA" : /^(5[1-5]|2[2-7])/.test(num) ? "Mastercard" : /^62/.test(num) ? "UnionPay" : "");

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { cart, promo, user, placeOrder, clearCart } = useShop();
  const lines = resolveLines(cart);
  const totals = computeTotals(lines, promo);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [placing, setPlacing] = useState(false);
  const [addr, setAddr] = useState<OrderAddress>({ name: user?.name ?? "", phone: "", email: user?.email ?? "", city: "", area: "", address: "", notes: "" });
  const [slot, setSlot] = useState<{ date: string; window: string } | null>(null);
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number]["key"]>("cod");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [wallet, setWallet] = useState("");

  const days = useMemo(() => {
    const city = CITIES[addr.city];
    const offset = city?.sameDay ? 0 : city?.eta === "next day" ? 1 : 2;
    const now = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() + offset + i);
      const iso = d.toISOString().slice(0, 10);
      const isToday = offset + i === 0;
      return {
        iso,
        label: isToday ? "Today" : offset + i === 1 ? "Tomorrow" : d.toLocaleDateString("en-GB", { weekday: "short" }),
        date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        windows: WINDOWS.map((w, wi) => ({
          w,
          // Past windows today are unavailable; a couple of slots are "full" to look realistic.
          full: (isToday && (wi + 1) * 3 + 10 <= now.getHours() + 1) || (d.getDate() + wi) % 5 === 0,
        })),
      };
    });
  }, [addr.city]);

  if (!hydrated) return <div className="container-x py-24"><div className="skeleton mx-auto h-96 max-w-4xl rounded-3xl" /></div>;

  if (lines.length === 0 && !placing) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">Nothing to check out yet</h1>
        <p className="mt-2 text-muted">Your cart is empty.</p>
        <Link href="/shop" className="mt-8 inline-block rounded-full bg-frost-600 px-7 py-4 font-semibold text-white">Start shopping</Link>
      </div>
    );
  }

  const validateDetails = () => {
    const e: Errors = {};
    if (addr.name.trim().length < 3) e.name = "Please enter your full name";
    if (!/^03\d{2}-?\d{7}$/.test(addr.phone.trim())) e.phone = "Enter a valid mobile number, e.g. 0300-1234567";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(addr.email.trim())) e.email = "Enter a valid email address";
    if (!CITIES[addr.city]) e.city = "Select a city we deliver to";
    if (addr.area.trim().length < 2) e.area = "Enter your area / society";
    if (addr.address.trim().length < 8) e.address = "Enter house number and street";
    return e;
  };

  const validatePayment = () => {
    const e: Errors = {};
    if (payment === "card") {
      const num = card.number.replace(/\s/g, "");
      if (!luhn(num)) e.cardNumber = "Card number looks invalid (try 4242 4242 4242 4242)";
      if (card.name.trim().length < 3) e.cardName = "Name as shown on card";
      const [mm, yy] = card.expiry.split("/").map(Number);
      const exp = new Date(2000 + (yy || 0), mm || 0, 1);
      if (!mm || mm > 12 || exp <= new Date()) e.expiry = "Invalid or expired";
      if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = "3–4 digits";
    }
    if ((payment === "jazzcash" || payment === "easypaisa") && !/^03\d{2}-?\d{7}$/.test(wallet.trim())) e.wallet = "Enter your registered wallet number";
    return e;
  };

  const next = (target: number) => {
    const e = step === 1 ? validateDetails() : step === 2 && !slot ? { slot: "Please choose a delivery slot" } : {};
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submit = async () => {
    const e = validatePayment();
    setErrors(e);
    if (Object.keys(e).length || !slot) return;
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1600));
    const id = newOrderId();
    placeOrder({
      id,
      createdAt: new Date().toISOString(),
      items: lines.map((l) => ({ productId: l.product.id, name: l.product.name, variant: l.variant.label, price: l.variant.price, qty: l.item.qty, image: l.product.image })),
      address: addr,
      slot,
      payment: PAYMENTS.find((p) => p.key === payment)!.label,
      subtotal: totals.subtotal,
      discount: totals.discount,
      delivery: totals.delivery,
      total: totals.total,
      promo: totals.promo?.code,
    });
    router.push(`/order/${id}?new=1`);
    clearCart();
  };

  return (
    <div className="container-x py-10">
      <Steps current={step} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          {/* STEP 1 */}
          <Section n={1} title="Contact & address" step={step} onEdit={() => setStep(1)}
            summary={`${addr.name} · ${addr.phone} · ${addr.address}, ${addr.area}, ${addr.city}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}><input className={input(errors.name)} value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} autoComplete="name" /></Field>
              <Field label="Mobile number" error={errors.phone}><input className={input(errors.phone)} value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} placeholder="0300-1234567" inputMode="tel" autoComplete="tel" /></Field>
              <Field label="Email" error={errors.email} full><input className={input(errors.email)} value={addr.email} onChange={(e) => setAddr({ ...addr, email: e.target.value })} type="email" autoComplete="email" /></Field>
              <Field label="City" error={errors.city}>
                <select className={input(errors.city)} value={addr.city} onChange={(e) => { setAddr({ ...addr, city: e.target.value }); setSlot(null); }}>
                  <option value="">Select city</option>
                  {Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Area / Society" error={errors.area}><input className={input(errors.area)} value={addr.area} onChange={(e) => setAddr({ ...addr, area: e.target.value })} placeholder="e.g. DHA Phase 5" /></Field>
              <Field label="Street address" error={errors.address} full><input className={input(errors.address)} value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} placeholder="House #, Street #" autoComplete="street-address" /></Field>
              <Field label="Delivery notes (optional)" full><textarea className={input()} rows={2} value={addr.notes} onChange={(e) => setAddr({ ...addr, notes: e.target.value })} placeholder="Gate code, landmark, call on arrival…" /></Field>
            </div>
            {addr.city && CITIES[addr.city] && (
              <p className="mt-4 rounded-2xl bg-frost-50 p-3 text-sm text-frost-800 dark:bg-frost-900/40 dark:text-frost-100">
                ❄️ {addr.city}: {CITIES[addr.city].sameDay ? "same-day cold-chain delivery available" : `delivery ${CITIES[addr.city].eta} in insulated boxes`}.
              </p>
            )}
            <button onClick={() => next(2)} className="mt-6 w-full rounded-full bg-frost-600 py-4 font-semibold text-white hover:bg-frost-700 sm:w-auto sm:px-10">Continue to delivery</button>
          </Section>

          {/* STEP 2 */}
          <Section n={2} title="Delivery slot" step={step} onEdit={() => setStep(2)}
            summary={slot ? `${days.find((d) => d.iso === slot.date)?.label ?? slot.date}, ${slot.window}` : ""}>
            <div className="space-y-4">
              {days.map((d) => (
                <div key={d.iso} className="grid gap-2 sm:grid-cols-[110px_1fr] sm:items-center">
                  <p className="font-semibold">{d.label} <span className="block text-xs font-normal text-muted">{d.date}</span></p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {d.windows.map(({ w, full }) => {
                      const selected = slot?.date === d.iso && slot.window === w;
                      return (
                        <button key={w} disabled={full} onClick={() => { setSlot({ date: d.iso, window: w }); setErrors({}); }} aria-pressed={selected}
                          className={cn("rounded-xl border-2 px-2 py-2.5 text-xs font-semibold transition",
                            selected ? "border-frost-600 bg-frost-600 text-white" : "border-line hover:border-frost-400",
                            full && "cursor-not-allowed border-dashed opacity-40 hover:border-line")}>
                          {w}{full && <span className="block text-[10px] font-normal">Full</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {errors.slot && <p className="mt-3 text-sm text-ember-600">{errors.slot}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-1 rounded-full border border-line px-6 py-4 font-semibold"><ArrowLeft className="size-4" /> Back</button>
              <button onClick={() => next(3)} className="flex-1 rounded-full bg-frost-600 py-4 font-semibold text-white hover:bg-frost-700 sm:flex-none sm:px-10">Continue to payment</button>
            </div>
          </Section>

          {/* STEP 3 */}
          <Section n={3} title="Payment" step={step} onEdit={() => setStep(3)} summary="">
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENTS.map(({ key, label, body, icon: Icon }) => (
                <button key={key} onClick={() => { setPayment(key); setErrors({}); }} aria-pressed={payment === key}
                  className={cn("flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition", payment === key ? "border-frost-600 bg-frost-50 dark:bg-frost-900/30" : "border-line hover:border-muted")}>
                  <Icon className="size-6 shrink-0 text-frost-600 dark:text-frost-300" />
                  <span className="flex-1"><span className="block font-semibold">{label}</span><span className="block text-xs text-muted">{body}</span></span>
                  <span className={cn("grid size-5 place-items-center rounded-full border-2", payment === key ? "border-frost-600 bg-frost-600 text-white" : "border-line")}>{payment === key && <Check className="size-3" />}</span>
                </button>
              ))}
            </div>

            {payment === "card" && (
              <div className="mt-5 grid animate-fade-up gap-4 rounded-2xl bg-surface-2 p-5 sm:grid-cols-2">
                <Field label="Card number" error={errors.cardNumber} full>
                  <div className="relative">
                    <input className={input(errors.cardNumber)} inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() })} />
                    {cardBrand(card.number) && <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-fg px-2 py-0.5 text-[10px] font-bold text-bg">{cardBrand(card.number)}</span>}
                  </div>
                </Field>
                <Field label="Name on card" error={errors.cardName} full><input className={input(errors.cardName)} autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></Field>
                <Field label="Expiry (MM/YY)" error={errors.expiry}>
                  <input className={input(errors.expiry)} inputMode="numeric" autoComplete="cc-exp" placeholder="08/29" value={card.expiry}
                    onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setCard({ ...card, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }} />
                </Field>
                <Field label="CVC" error={errors.cvc}><input className={input(errors.cvc)} inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} /></Field>
                <p className="flex items-center gap-2 text-xs text-muted sm:col-span-2"><ShieldCheck className="size-4 text-emerald-500" /> 256-bit SSL encrypted · 3-D Secure verified · we never store card details</p>
              </div>
            )}
            {(payment === "jazzcash" || payment === "easypaisa") && (
              <div className="mt-5 animate-fade-up rounded-2xl bg-surface-2 p-5">
                <Field label={`${payment === "jazzcash" ? "JazzCash" : "Easypaisa"} account number`} error={errors.wallet}>
                  <input className={input(errors.wallet)} inputMode="tel" placeholder="0300-1234567" value={wallet} onChange={(e) => setWallet(e.target.value)} />
                </Field>
                <p className="mt-3 text-xs text-muted">You’ll receive a prompt on your phone to approve {formatPrice(totals.total)}.</p>
              </div>
            )}
            {payment === "cod" && <p className="mt-4 text-sm text-muted">Please keep {formatPrice(totals.total)} ready. Riders also carry card machines.</p>}

            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(2)} className="inline-flex items-center gap-1 rounded-full border border-line px-6 py-4 font-semibold"><ArrowLeft className="size-4" /> Back</button>
              <button onClick={submit} disabled={placing} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ember-500 py-4 font-semibold text-white shadow-xl shadow-ember-500/25 hover:bg-ember-600 disabled:opacity-70">
                {placing ? <><Loader2 className="size-5 animate-spin" /> Processing securely…</> : <><Lock className="size-4" /> Place order · {formatPrice(totals.total)}</>}
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">By placing your order you agree to our Terms & Refund Policy.</p>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="space-y-5 rounded-3xl border border-line bg-surface p-6">
            <h2 className="font-display text-2xl font-semibold">Your order</h2>
            <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {lines.map(({ item, product, variant, lineTotal }) => (
                <li key={item.key} className="flex items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    <Image src={img(product.image, 150)} alt="" fill sizes="56px" className="object-cover" />
                    <span className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-fg text-[10px] font-bold text-bg">{item.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.name}</p><p className="text-xs text-muted">{variant.label}</p></div>
                  <p className="text-sm font-semibold">{formatPrice(lineTotal)}</p>
                </li>
              ))}
            </ul>
            <PromoInput />
            <Totals lines={lines} />
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted">
            <span className="flex items-center gap-1"><Lock className="size-3.5" /> Secure checkout</span>
            <span className="flex items-center gap-1"><ShieldCheck className="size-3.5" /> Buyer protection</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

const input = (error?: string) =>
  cn("w-full rounded-xl border bg-bg px-4 py-3 text-sm outline-none transition focus:ring-4",
    error ? "border-ember-500 focus:ring-ember-500/15" : "border-line focus:border-frost-400 focus:ring-frost-400/15");

function Field({ label, error, full, children }: { label: string; error?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={cn("block", full && "sm:col-span-2")}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-ember-600" role="alert">{error}</span>}
    </label>
  );
}

function Section({ n, title, step, summary, onEdit, children }: { n: number; title: string; step: number; summary: string; onEdit: () => void; children: React.ReactNode }) {
  const done = step > n;
  const active = step === n;
  return (
    <section className={cn("rounded-3xl border bg-surface p-6 transition", active ? "border-frost-400 shadow-lg shadow-frost-900/5" : "border-line")}>
      <div className="flex items-center gap-3">
        <span className={cn("grid size-8 place-items-center rounded-full text-sm font-bold", done ? "bg-emerald-500 text-white" : active ? "bg-frost-600 text-white" : "bg-surface-2 text-muted")}>
          {done ? <Check className="size-4" /> : n}
        </span>
        <h2 className={cn("font-display text-xl font-semibold", !active && !done && "text-muted")}>{title}</h2>
        {done && <button onClick={onEdit} className="ml-auto text-sm font-semibold text-frost-600 hover:underline dark:text-frost-300">Edit</button>}
      </div>
      {done && summary && <p className="ml-11 mt-2 truncate text-sm text-muted">{summary}</p>}
      {active && <div className="mt-6 animate-fade-up">{children}</div>}
    </section>
  );
}
