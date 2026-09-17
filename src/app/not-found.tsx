import Link from "next/link";
import { Snowflake } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-x grid place-items-center py-24 text-center">
      <Snowflake className="size-16 animate-float text-frost-400" />
      <p className="mt-6 font-display text-8xl font-semibold text-frost-600 dark:text-frost-300">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">This page got lost in the freezer</h1>
      <p className="mt-2 max-w-md text-muted">The page you’re looking for doesn’t exist or has been moved. Let’s get you back to something delicious.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-full bg-frost-600 px-6 py-3 font-semibold text-white hover:bg-frost-700">Go home</Link>
        <Link href="/shop" className="rounded-full border border-line px-6 py-3 font-semibold hover:bg-surface-2">Browse shop</Link>
      </div>
    </div>
  );
}
