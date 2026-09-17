import { Truck } from "lucide-react";
import { FREE_SHIPPING_AT } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100);
  return (
    <div className="rounded-2xl bg-frost-50 p-3 dark:bg-frost-900/30">
      <p className="flex items-center gap-2 text-sm">
        <Truck className="size-4 text-frost-600 dark:text-frost-300" />
        {remaining > 0 ? (
          <span>Add <b>{formatPrice(remaining)}</b> more for <b>free cold-chain delivery</b></span>
        ) : (
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">You’ve unlocked free delivery! 🎉</span>
        )}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-frost-100 dark:bg-frost-900">
        <div className="h-full rounded-full bg-gradient-to-r from-frost-400 to-frost-600 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
