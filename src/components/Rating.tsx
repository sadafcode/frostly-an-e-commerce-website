import { Star } from "lucide-react";

export function Rating({ value, count, size = "sm" }: { value: number; count?: number; size?: "sm" | "md" }) {
  const px = size === "sm" ? "size-3.5" : "size-4.5";
  return (
    <div className="flex items-center gap-1.5" aria-label={`Rated ${value} out of 5`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, value - (i - 1)));
          return (
            <span key={i} className="relative">
              <Star className={`${px} text-line`} fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={`${px} text-amber-400`} fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
        })}
      </div>
      <span className="text-xs font-semibold">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-muted">({count.toLocaleString()})</span>}
    </div>
  );
}
