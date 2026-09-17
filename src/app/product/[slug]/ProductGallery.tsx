"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { cn, img } from "@/lib/format";

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[2rem] bg-surface-2"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          key={active}
          src={img(product.gallery[active], 1200)}
          alt={product.name}
          fill
          priority
          sizes="(min-width: 1024px) 600px, 100vw"
          className="animate-fade-up object-cover transition-transform duration-200"
          style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
      </div>
      <div className="mt-4 flex gap-3">
        {product.gallery.map((g, i) => (
          <button
            key={g + i}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={i === active}
            className={cn("relative size-20 overflow-hidden rounded-2xl border-2 transition", i === active ? "border-frost-500" : "border-transparent opacity-70 hover:opacity-100")}
          >
            <Image src={img(g, 200)} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
