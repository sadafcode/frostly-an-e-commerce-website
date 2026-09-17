import { ProductCardSkeleton } from "@/components/ProductCard";

export default function Loading() {
  return (
    <div className="container-x py-8">
      <div className="skeleton h-4 w-40 rounded" />
      <div className="skeleton mt-6 h-12 w-72 rounded-xl" />
      <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
