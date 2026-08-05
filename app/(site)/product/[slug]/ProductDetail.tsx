"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/Button";

type Variant = {
  id: string;
  name: string;
  price_ngn: number;
  stock_quantity: number;
  is_default: boolean;
  sort_order: number;
};

type ProductImage = { id: string; variantId: string | null; url: string };

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  variants: Variant[];
  images: ProductImage[];
};

export function ProductDetail({ product }: { product: Product }) {
  const { format } = useCurrency();
  const { addItem } = useCart();

  const defaultVariant =
    product.variants.find((v) => v.is_default) ?? product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? defaultVariant;

  const galleryImages = useMemo(() => {
    const variantSpecific = product.images.filter(
      (img) => img.variantId === selectedVariantId
    );
    const shared = product.images.filter((img) => img.variantId === null);
    const combined = [...variantSpecific, ...shared];
    return combined.length ? combined : product.images;
  }, [product.images, selectedVariantId]);

  const [activeImage, setActiveImage] = useState(galleryImages[0]?.url);
  const mainImage = activeImage ?? galleryImages[0]?.url;

  const outOfStock = !selectedVariant || selectedVariant.stock_quantity === 0;

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        variantName: selectedVariant.name,
        priceNgn: selectedVariant.price_ngn,
        imageUrl: mainImage ?? null,
        maxStock: selectedVariant.stock_quantity,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>{" "}
        / <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-muted">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          {galleryImages.length > 1 && (
            <div className="mt-3 flex gap-2">
              {galleryImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    mainImage === img.url ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {format(selectedVariant?.price_ngn ?? 0)}
          </p>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {product.variants.length > 1 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Options</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setQuantity(1);
                    }}
                    disabled={variant.stock_quantity === 0}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      selectedVariantId === variant.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface hover:bg-surface-muted"
                    }`}
                  >
                    {variant.name}
                    {variant.stock_quantity === 0 && " (Sold out)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 hover:bg-surface-muted"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(q + 1, selectedVariant?.stock_quantity ?? 1))
                }
                className="p-2.5 hover:bg-surface-muted"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <Button onClick={handleAddToCart} disabled={outOfStock} className="flex-1">
              {outOfStock ? (
                "Sold out"
              ) : added ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : (
                "Add to bag"
              )}
            </Button>
          </div>

          {selectedVariant && selectedVariant.stock_quantity > 0 && selectedVariant.stock_quantity <= 5 && (
            <p className="mt-3 text-xs text-amber-600">
              Only {selectedVariant.stock_quantity} left in stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
