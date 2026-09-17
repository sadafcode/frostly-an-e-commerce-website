"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/format";

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setState(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "done" : "error");
  };

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
        <Check className="size-4" /> You’re in! Check your inbox for a 10% code.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className={cn("flex overflow-hidden rounded-full border bg-white/5", state === "error" ? "border-ember-500" : compact ? "border-white/20" : "border-line bg-surface")}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
          placeholder="you@email.com"
          aria-label="Email address"
          aria-invalid={state === "error"}
          className={cn("min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none", compact ? "placeholder:text-frost-200/50" : "placeholder:text-muted")}
        />
        <button className="m-1 inline-flex items-center gap-1 rounded-full bg-ember-500 px-4 text-sm font-semibold text-white hover:bg-ember-600" aria-label="Subscribe">
          {compact ? <ArrowRight className="size-4" /> : <>Subscribe <ArrowRight className="size-4" /></>}
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-xs text-ember-400">Please enter a valid email address.</p>}
    </form>
  );
}
