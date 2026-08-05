"use client";

import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "@/components/currency-provider";

export type ProductCardData = {
  slug: string;
  name: string;
  imageUrl: string | null;
  fromPriceNgn: number;
  hasMultiplePrices: boolean;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { format } = useCurrency();

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-sm font-medium sm:text-base">{product.name}</p>
        <p className="mt-1 text-sm font-semibold text-primary">
          {product.hasMultiplePrices ? "From " : ""}
          {format(product.fromPriceNgn)}
        </p>
      </div>
    </Link>
  );
}
