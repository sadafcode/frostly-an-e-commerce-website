import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

const base = "https://frostly.pk";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/shop?store=frozen`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/shop?store=kitchen`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/track`, changeFrequency: "monthly", priority: 0.4 },
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
