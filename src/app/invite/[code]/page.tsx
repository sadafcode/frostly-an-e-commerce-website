import type { Metadata } from "next";
import { InviteLanding } from "./InviteLanding";
import { REFERRAL } from "@/lib/referrals";

export async function generateMetadata(props: PageProps<"/invite/[code]">): Promise<Metadata> {
  const { code } = await props.params;
  const clean = decodeURIComponent(code).toUpperCase();
  return {
    title: `${clean} — Rs. ${REFERRAL.friendDiscount} off your first order`,
    description: `Your friend sent you Rs. ${REFERRAL.friendDiscount} off your first Frostly order over Rs. ${REFERRAL.friendMinSpend}. Cold-chain delivery across Pakistan.`,
    robots: { index: false },
    openGraph: {
      title: `You've got Rs. ${REFERRAL.friendDiscount} off Frostly`,
      description: "Halal frozen foods and kitchen essentials, delivered at -18°C.",
    },
  };
}

export default async function InvitePage(props: PageProps<"/invite/[code]">) {
  const { code } = await props.params;
  const { s } = await props.searchParams;
  return (
    <InviteLanding
      code={decodeURIComponent(code).toUpperCase()}
      source={typeof s === "string" ? s : undefined}
    />
  );
}
