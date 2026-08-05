import { createClient } from "@/lib/supabase/server";
import { getStoragePublicUrl } from "@/lib/supabase/storage";
import type { ProductCardData } from "@/components/site/ProductCard";

const LISTING_SELECT = `
  id, slug, name,
  product_variants ( id, price_ngn ),
  product_images ( storage_path, is_primary, sort_order )
`;

type ListingRow = {
  id: string;
  slug: string;
  name: string;
  product_variants: { id: string; price_ngn: number }[];
  product_images: { storage_path: string; is_primary: boolean; sort_order: number }[];
};

function toCardData(row: ListingRow): ProductCardData {
  const prices = row.product_variants.map((v) => v.price_ngn);
  const primaryImage =
    [...row.product_images].sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.sort_order - b.sort_order;
    })[0] ?? null;

  return {
    slug: row.slug,
    name: row.name,
    imageUrl: primaryImage
      ? getStoragePublicUrl("product-images", primaryImage.storage_path)
      : null,
    fromPriceNgn: prices.length ? Math.min(...prices) : 0,
    hasMultiplePrices: new Set(prices).size > 1,
  };
}

export async function getFeaturedProducts(limit = 4): Promise<ProductCardData[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(LISTING_SELECT)
    .order("created_at", { ascending: true })
    .limit(limit);

  return ((data as ListingRow[] | null) ?? []).map(toCardData);
}

export async function getShopProducts(categorySlug?: string): Promise<ProductCardData[]> {
  const supabase = await createClient();
  let query = supabase.from("products").select(
    categorySlug ? `${LISTING_SELECT}, categories!inner(slug)` : LISTING_SELECT
  );

  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug);
  }

  const { data } = await query.order("created_at", { ascending: true });
  return ((data as ListingRow[] | null) ?? []).map(toCardData);
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("name, slug")
    .order("sort_order", { ascending: true });
  return data ?? [];
}
