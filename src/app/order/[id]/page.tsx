import type { Metadata } from "next";
import { OrderTracking } from "./OrderTracking";

export const metadata: Metadata = { title: "Order Tracking", robots: { index: false } };

export default async function OrderPage(props: PageProps<"/order/[id]">) {
  const { id } = await props.params;
  const { new: isNew } = await props.searchParams;
  return <OrderTracking id={decodeURIComponent(id).toUpperCase()} isNew={isNew === "1"} />;
}
