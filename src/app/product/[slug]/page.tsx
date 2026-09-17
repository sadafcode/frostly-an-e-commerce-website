import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { categories, crossSell, getProduct, products, related, reviewsFor } from "@/lib/products";
import { img } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { ProductGallery } from "./ProductGallery";
import { PurchasePanel } from "./PurchasePanel";
import { ProductTabs } from "./ProductTabs";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProduct(slug);
  if (!p) return { title: "Product not found" };
  return {
    title: p.name,
    description: `${p.short} ${p.description.slice(0, 120)}`,
    openGraph: { title: p.name, description: p.short, images: [img(p.image, 1200)] },
  };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = categories.find((c) => c.slug === product.category);
  const reviews = reviewsFor(product);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery.map((g) => img(g, 1200)),
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: "Frostly" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "PKR",
      lowPrice: Math.min(...product.variants.map((v) => v.price)),
      highPrice: Math.max(...product.variants.map((v) => v.price)),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-x py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-fg">Home</Link><ChevronRight className="size-3.5" />
        <Link href={`/shop?store=${product.store}`} className="hover:text-fg">{product.store === "frozen" ? "Frozen Foods" : "Kitchen Essentials"}</Link><ChevronRight className="size-3.5" />
        {category && <><Link href={`/shop?store=${product.store}&category=${category.slug}`} className="hover:text-fg">{category.name}</Link><ChevronRight className="size-3.5" /></>}
        <span className="truncate text-fg">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery product={product} />
        <PurchasePanel product={product} categoryName={category?.name ?? ""} bundleWith={crossSell(product)} />
      </div>

      <ProductTabs product={product} reviews={reviews} />

      <section className="mt-20">
        <h2 className="font-display text-3xl font-semibold">You may also like</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {related(product).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <div className="-mx-4 md:-mx-8"><RecentlyViewed exclude={product.id} /></div>
    </div>
  );
}
