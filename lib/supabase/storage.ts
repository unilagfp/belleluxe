import { createClient } from "@/lib/supabase/client";

/** Pure, no client needed — safe to call from server components too. */
export function getStoragePublicUrl(
  bucket: "product-images" | "site-media",
  storagePath: string
) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;
}

export function getPublicUrl(bucket: "product-images" | "site-media", storagePath: string) {
  const supabase = createClient();
  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

export async function uploadProductImage(productId: string, file: File) {
  const supabase = createClient();
  const storagePath = `${productId}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(storagePath, file, { contentType: file.type });
  if (error) throw error;
  return storagePath;
}

export async function deleteProductImage(storagePath: string) {
  const supabase = createClient();
  const { error } = await supabase.storage.from("product-images").remove([storagePath]);
  if (error) throw error;
}

export async function uploadSiteMedia(category: string, file: File) {
  const supabase = createClient();
  const storagePath = `${category}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage
    .from("site-media")
    .upload(storagePath, file, { contentType: file.type });
  if (error) throw error;
  return storagePath;
}
