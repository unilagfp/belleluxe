import Link from "next/link";
import { getShopProducts, getCategories, getFavoriteProductIds } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [products, categories, favoriteIds] = await Promise.all([
    getShopProducts(category),
    getCategories(),
    getFavoriteProductIds(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Shop the collection</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Premium bundles and braided ponytails, ready to wear.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            !category
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface hover:bg-surface-muted"
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              category === c.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface hover:bg-surface-muted"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          No products found in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              initialFavorited={favoriteIds.has(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
