import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/checkout", "/cart", "/account", "/admin", "/order/"] },
    sitemap: "https://frostly.pk/sitemap.xml",
  };
}
