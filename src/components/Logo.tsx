import Link from "next/link";
import { Snowflake } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 ${className}`} aria-label="Frostly home">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-frost-400 to-frost-700 text-white shadow-lg shadow-frost-500/30 transition-transform duration-500 group-hover:rotate-90">
        <Snowflake className="size-5" strokeWidth={2.5} />
      </span>
      <span className="font-display text-2xl font-semibold tracking-tight">
        Frost<span className="text-frost-500">ly</span>
      </span>
    </Link>
  );
}
