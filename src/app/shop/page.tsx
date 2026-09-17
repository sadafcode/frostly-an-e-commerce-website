import type { Metadata } from "next";
import { ShopView } from "./ShopView";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export async function generateMetadata(props: PageProps<"/shop">): Promise<Metadata> {
  const { store, q } = await props.searchParams;
  const s = first(store);
  const title = first(q) ? `Search: ${first(q)}` : s === "kitchen" ? "Kitchen Essentials" : s === "frozen" ? "Frozen Foods" : "Shop All";
  return { title, description: "Browse halal frozen foods and premium kitchen essentials with cold-chain delivery." };
}

export default async function ShopPage(props: PageProps<"/shop">) {
  const sp = await props.searchParams;
  return (
    <ShopView
      initial={{
        store: first(sp.store),
        category: first(sp.category),
        tag: first(sp.tag),
        q: first(sp.q),
        sort: first(sp.sort) || "featured",
      }}
    />
  );
}
