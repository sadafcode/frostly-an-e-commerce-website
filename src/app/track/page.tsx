import type { Metadata } from "next";
import { TrackForm } from "./TrackForm";

export const metadata: Metadata = { title: "Track Your Order", description: "Live cold-chain tracking for your Frostly order." };

export default function TrackPage() {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-frost-600 dark:text-frost-300">Live tracking</p>
        <h1 className="mt-2 font-display text-5xl font-semibold">Where’s my order?</h1>
        <p className="mt-3 text-muted">Enter the order number from your confirmation SMS or email to see live location and box temperature.</p>
        <TrackForm />
      </div>
    </div>
  );
}
