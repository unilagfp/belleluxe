import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStoragePublicUrl } from "@/lib/supabase/storage";
import { ProductDetail } from "./ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      `id, slug, name, description,
       product_variants ( id, name, price_ngn, stock_quantity, is_default, sort_order ),
       product_images ( id, storage_path, variant_id, is_primary, sort_order )`
    )
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const variants = [...product.product_variants].sort((a, b) => a.sort_order - b.sort_order);
  const images = [...product.product_images]
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.sort_order - b.sort_order;
    })
    .map((img) => ({
      id: img.id,
      variantId: img.variant_id,
      url: getStoragePublicUrl("product-images", img.storage_path),
    }));

  return (
    <ProductDetail
      product={{
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        variants,
        images,
      }}
    />
  );
}
