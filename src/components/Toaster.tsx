"use client";

import Image from "next/image";
import { CheckCircle2, X } from "lucide-react";
import { useUI } from "@/lib/store";
import { img } from "@/lib/format";

export function Toaster() {
  const { toasts, dismiss, setCartOpen } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:items-end" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-2xl">
          {t.image ? (
            <Image src={img(t.image, 120)} alt="" width={44} height={44} className="size-11 rounded-xl object-cover" />
          ) : (
            <CheckCircle2 className="size-6 text-emerald-500" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t.title}</p>
            {t.body && <p className="truncate text-xs text-muted">{t.body}</p>}
          </div>
          {t.title === "Added to cart" && (
            <button onClick={() => { setCartOpen(true); dismiss(t.id); }} className="rounded-lg bg-frost-600 px-3 py-1.5 text-xs font-semibold text-white">
              View
            </button>
          )}
          <button onClick={() => dismiss(t.id)} className="rounded-md p-1 text-muted hover:text-fg" aria-label="Dismiss"><X className="size-4" /></button>
        </div>
      ))}
    </div>
  );
}
