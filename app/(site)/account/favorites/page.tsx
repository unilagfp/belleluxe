import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStoragePublicUrl } from "@/lib/supabase/storage";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("favorites")
    .select(
      `product_id,
       products (
         id, slug, name, is_visible,
         product_variants ( price_ngn ),
         product_images ( storage_path, is_primary, sort_order )
       )`
    )
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const products: ProductCardData[] = (data ?? [])
    .map((row) => row.products)
    .filter((p): p is NonNullable<typeof p> => !!p && p.is_visible)
    .map((p) => {
      const prices = p.product_variants.map((v) => v.price_ngn);
      const primaryImage =
        [...p.product_images].sort((a, b) => {
          if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
          return a.sort_order - b.sort_order;
        })[0] ?? null;

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        imageUrl: primaryImage
          ? getStoragePublicUrl("product-images", primaryImage.storage_path)
          : null,
        fromPriceNgn: prices.length ? Math.min(...prices) : 0,
        hasMultiplePrices: new Set(prices).size > 1,
      };
    });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">My favorites</h1>
        <Link href="/account" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to account
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          You haven&apos;t favorited anything yet.{" "}
          <Link href="/shop" className="font-medium text-primary">
            Browse the shop
          </Link>
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} initialFavorited />
          ))}
        </div>
      )}
    </div>
  );
}
