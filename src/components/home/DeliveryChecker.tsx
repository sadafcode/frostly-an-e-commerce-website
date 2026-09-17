"use client";

import { useState } from "react";
import { CheckCircle2, Clock, MapPin, XCircle } from "lucide-react";

export const CITIES: Record<string, { eta: string; sameDay: boolean }> = {
  Lahore: { eta: "within 3 hours", sameDay: true },
  Karachi: { eta: "within 3 hours", sameDay: true },
  Islamabad: { eta: "within 4 hours", sameDay: true },
  Rawalpindi: { eta: "within 4 hours", sameDay: true },
  Faisalabad: { eta: "next day", sameDay: false },
  Multan: { eta: "next day", sameDay: false },
  Peshawar: { eta: "next day", sameDay: false },
  Sialkot: { eta: "next day", sameDay: false },
  Gujranwala: { eta: "next day", sameDay: false },
  Hyderabad: { eta: "in 2 days", sameDay: false },
  Quetta: { eta: "in 2 days", sameDay: false },
  Bahawalpur: { eta: "in 2 days", sameDay: false },
};

export function DeliveryChecker() {
  const [city, setCity] = useState("");
  const [checked, setChecked] = useState<string | null>(null);
  const match = checked ? Object.keys(CITIES).find((c) => c.toLowerCase() === checked.trim().toLowerCase()) : undefined;

  return (
    <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
      <p className="flex items-center gap-2 font-semibold"><MapPin className="size-4" /> Check delivery in your city</p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => { e.preventDefault(); if (city.trim()) setChecked(city); }}
      >
        <input
          list="frostly-cities"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Lahore"
          aria-label="City"
          className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/60"
        />
        <datalist id="frostly-cities">{Object.keys(CITIES).map((c) => <option key={c} value={c} />)}</datalist>
        <button className="rounded-full bg-white px-5 text-sm font-semibold text-frost-900 hover:bg-frost-50">Check</button>
      </form>
      {checked && (
        <div className="mt-4 animate-fade-up rounded-2xl bg-white/10 p-4 text-sm">
          {match ? (
            <>
              <p className="flex items-center gap-2 font-semibold text-emerald-300"><CheckCircle2 className="size-4" /> Great news — we deliver to {match}!</p>
              <p className="mt-1 flex items-center gap-2 text-white/80"><Clock className="size-4" /> Order now, arrives {CITIES[match].eta}{CITIES[match].sameDay ? " (same-day slots available)" : ""}.</p>
            </>
          ) : (
            <p className="flex items-center gap-2 text-amber-200"><XCircle className="size-4" /> We’re not in “{checked}” yet — we’re expanding soon. Join the newsletter to be notified.</p>
          )}
        </div>
      )}
    </div>
  );
}
