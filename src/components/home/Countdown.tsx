"use client";

import { useEffect, useState } from "react";

const endOfDay = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

export function Countdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setLeft(Math.max(0, endOfDay() - Date.now()));
    const id = setInterval(update, 1000);
    const first = setTimeout(update, 0);
    return () => { clearInterval(id); clearTimeout(first); };
  }, []);

  const parts = left === null
    ? ["--", "--", "--"]
    : [left / 3.6e6, (left / 6e4) % 60, (left / 1e3) % 60].map((n) => String(Math.floor(n)).padStart(2, "0"));

  return (
    <div className="flex items-center gap-2" role="timer" aria-label="Deal ends in">
      {parts.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="grid min-w-14 place-items-center rounded-2xl bg-white/10 px-3 py-2 backdrop-blur">
            <span className="font-display text-3xl font-semibold tabular-nums">{p}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-70">{["hrs", "min", "sec"][i]}</span>
          </div>
          {i < 2 && <span className="text-2xl font-bold opacity-60">:</span>}
        </div>
      ))}
    </div>
  );
}
