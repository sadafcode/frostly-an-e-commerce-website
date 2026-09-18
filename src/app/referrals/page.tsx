import type { Metadata } from "next";
import { ReferralDashboard } from "./ReferralDashboard";

export const metadata: Metadata = {
  title: "Refer & Earn",
  description: "Invite friends to Frostly — they save Rs. 500 on their first order and you earn Rs. 700 in credit.",
};

export default function ReferralsPage() {
  return <ReferralDashboard />;
}
