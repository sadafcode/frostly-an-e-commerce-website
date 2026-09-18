"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, BadgeCheck, Gift, PartyPopper, Snowflake, ThermometerSnowflake, Truck } from "lucide-react";
import { myCode, useHydrated, useShop } from "@/lib/store";
import { evaluateInvite, REFERRAL, REJECT_MESSAGE, SOURCES, type ReferralSource } from "@/lib/referrals";
import { formatPrice } from "@/lib/format";

export function InviteLanding({ code, source }: { code: string; source?: string }) {
  const hydrated = useHydrated();
  const acceptInvite = useShop((s) => s.acceptInvite);
  const referredBy = useShop((s) => s.referredBy);
  const pendingInvite = useShop((s) => s.pendingInvite);
  const orders = useShop((s) => s.orders);
  const user = useShop((s) => s.user);

  // The outcome is a pure function of store state, so it is derived rather
  // than mirrored — the effect only performs the write, and re-running it
  // (StrictMode, remount) is a no-op once the invite is bound.
  const reason = evaluateInvite(code, {
    ownCode: myCode(user),
    referredBy,
    pendingCode: pendingInvite?.code ?? null,
    hasOrders: orders.length > 0,
  });

  useEffect(() => {
    // Attribution happens on arrival, exactly like a real referral link.
    const channel = SOURCES.includes(source as ReferralSource) ? (source as ReferralSource) : "link";
    acceptInvite(code, channel);
  }, [code, source, acceptInvite]);

  if (!hydrated) return <div className="container-x py-24"><div className="skeleton mx-auto h-96 max-w-2xl rounded-3xl" /></div>;

  const accepted = !reason;

  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-2xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-frost-600 via-frost-700 to-frost-900 p-8 text-center text-white md:p-12">
          <div className="absolute -left-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/15">
              {accepted ? <PartyPopper className="size-8" /> : <Gift className="size-8" />}
            </span>
            {accepted ? (
              <>
                <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-frost-100">Invite from {code}</p>
                <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">You’ve got {formatPrice(REFERRAL.friendDiscount)} off ❄️</h1>
                <p className="mx-auto mt-4 max-w-md text-frost-100/90">
                  Applied automatically to your first order over {formatPrice(REFERRAL.friendMinSpend)}. Your friend earns credit once it’s delivered — you both win.
                </p>
                <Link href="/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-frost-800 transition hover:bg-frost-50">
                  Start shopping <ArrowRight className="size-4" />
                </Link>
                {!user && <p className="mt-4 text-xs text-frost-100/80">Your invite is saved — create an account at checkout and it still applies.</p>}
              </>
            ) : (
              <>
                <h1 className="mt-6 font-display text-3xl font-semibold md:text-4xl">
                  {reason === "self-referral" ? "That’s your own link!" : "This invite can’t be used"}
                </h1>
                <p className="mx-auto mt-4 max-w-md text-frost-100/90">{reason ? REJECT_MESSAGE[reason] : "Something went wrong reading that invite."}</p>
                <Link
                  href={reason === "self-referral" || reason === "existing-customer" || reason === "already-referred" ? "/referrals" : "/shop"}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-frost-800 transition hover:bg-frost-50"
                >
                  {reason === "self-referral" ? "Share your link instead" : reason === "unknown-code" ? "Browse the shop" : "Go to Refer & Earn"} <ArrowRight className="size-4" />
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { icon: ThermometerSnowflake, t: "Frozen at -18°C", b: "Blast-frozen, never thawed in transit." },
            { icon: Truck, t: "Same-day delivery", b: "In Lahore, Karachi & Islamabad." },
            { icon: BadgeCheck, t: "100% halal", b: "Certified suppliers, traceable batches." },
          ].map(({ icon: Icon, t, b }) => (
            <div key={t} className="rounded-3xl border border-line bg-surface p-5">
              <Icon className="size-5 text-frost-600 dark:text-frost-300" />
              <p className="mt-3 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted">{b}</p>
            </div>
          ))}
        </div>

        {accepted && (
          <section className="mt-6 rounded-3xl border border-line bg-surface p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Snowflake className="size-5 text-frost-600 dark:text-frost-300" /> How your discount works</h2>
            <ol className="mt-4 space-y-3 text-sm">
              {[
                `Fill your basket past ${formatPrice(REFERRAL.friendMinSpend)} — the ${formatPrice(REFERRAL.friendDiscount)} comes off at checkout.`,
                "Pick a delivery slot and pay however you like — card, wallet or cash.",
                "Once delivered, your friend’s reward clears and you get your own invite link.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-frost-50 text-xs font-bold text-frost-700 dark:bg-frost-900/50 dark:text-frost-200">{i + 1}</span>
                  <span className="text-muted">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
              One invite per customer, new customers only. Rewards clear after the returns window and expire 90 days later.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
