"use client";

import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "@/components/currency-provider";
import { FavoriteButton } from "./FavoriteButton";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  fromPriceNgn: number;
  hasMultiplePrices: boolean;
};

export function ProductCard({
  product,
  initialFavorited = false,
}: {
  product: ProductCardData;
  initialFavorited?: boolean;
}) {
  const { format } = useCurrency();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-lg">
      <FavoriteButton
        productId={product.id}
        initialFavorited={initialFavorited}
        className="absolute right-2 top-2 z-10"
      />
      <Link href={`/product/${product.slug}`}>
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
    </div>
  );
}
