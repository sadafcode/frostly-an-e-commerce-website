"use client";

import { useState } from "react";
import { Check, Copy, Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { inviteUrl, REFERRAL, type ReferralSource } from "@/lib/referrals";
import { useHydrated, useUI } from "@/lib/store";
import { cn, formatPrice } from "@/lib/format";

/**
 * Every channel gets its own `?s=` tag so the dashboard can attribute a signup
 * back to the exact place the link was shared.
 */
const tagged = (base: string, source: ReferralSource) => `${base}?s=${source}`;

export function ShareTools({ code }: { code: string }) {
  const toast = useUI((s) => s.toast);
  const hydrated = useHydrated();
  const [copied, setCopied] = useState(false);

  // The real origin and the share sheet are only knowable in the browser; the
  // pre-hydration render falls back to the production domain.
  const origin = hydrated ? window.location.origin : "https://frostly.pk";
  const canShare = hydrated && typeof navigator.share === "function";

  const link = inviteUrl(code, origin);
  const message = `I've been ordering frozen food from Frostly — use my link and get ${formatPrice(REFERRAL.friendDiscount)} off your first order over ${formatPrice(REFERRAL.friendMinSpend)}: `;

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: `${label} copied`, body: "Paste it anywhere you like." });
    } catch {
      toast({ title: "Couldn’t copy", body: "Select the link and copy it manually." });
    }
  };

  const channels = [
    { key: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(message + tagged(link, "whatsapp"))}` },
    { key: "email" as const, label: "Email", icon: Mail, href: `mailto:?subject=${encodeURIComponent("Rs. 500 off your first Frostly order")}&body=${encodeURIComponent(message + tagged(link, "email"))}` },
    { key: "link" as const, label: "Anywhere", icon: Send, href: null },
  ];

  return (
    <section className="rounded-3xl border border-line bg-surface p-6">
      <h2 className="font-display text-xl font-semibold">Your invite link</h2>
      <p className="mt-1 text-sm text-muted">Anyone who orders through this link is credited to you automatically.</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-line bg-bg px-4 py-3">
          <span className="truncate text-sm text-muted">{link}</span>
        </div>
        <button onClick={() => copy(link, "Link")}
          className={cn("inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white transition", copied ? "bg-emerald-500" : "bg-frost-600 hover:bg-frost-700")}>
          {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy link</>}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3">
        <span className="text-sm text-muted">Or share the code</span>
        <button onClick={() => copy(code, "Code")} className="ml-auto rounded-xl border-2 border-dashed border-frost-400 bg-bg px-4 py-1.5 font-display text-lg font-bold tracking-widest text-frost-700 dark:text-frost-300">
          {code}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {channels.map(({ key, label, icon: Icon, href }) =>
          href ? (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 rounded-2xl border border-line p-4 text-xs font-semibold transition hover:border-frost-400 hover:bg-surface-2">
              <Icon className="size-5 text-frost-600 dark:text-frost-300" /> {label}
            </a>
          ) : (
            <button key={key} onClick={() => copy(tagged(link, "copy"), "Link")}
              className="flex flex-col items-center gap-2 rounded-2xl border border-line p-4 text-xs font-semibold transition hover:border-frost-400 hover:bg-surface-2">
              <Icon className="size-5 text-frost-600 dark:text-frost-300" /> {label}
            </button>
          ),
        )}
        <button
          disabled={!canShare}
          onClick={() => navigator.share({ title: "Frostly", text: message, url: tagged(link, "link") }).catch(() => {})}
          className="flex flex-col items-center gap-2 rounded-2xl border border-line p-4 text-xs font-semibold transition hover:border-frost-400 hover:bg-surface-2 disabled:opacity-40"
          title={canShare ? "Use your device share sheet" : "Your browser doesn’t support the share sheet"}
        >
          <Share2 className="size-5 text-frost-600 dark:text-frost-300" /> Share sheet
        </button>
      </div>
    </section>
  );
}
