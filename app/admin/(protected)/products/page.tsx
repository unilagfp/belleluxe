"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getStoragePublicUrl } from "@/lib/supabase/storage";
import { formatCurrency } from "@/lib/currency/convert";

type Row = {
  id: string;
  name: string;
  slug: string;
  is_visible: boolean;
  categories: { name: string } | null;
  product_variants: { price_ngn: number }[];
  product_images: { storage_path: string; is_primary: boolean }[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select(
        "id, name, slug, is_visible, categories(name), product_variants(price_ngn), product_images(storage_path, is_primary)"
      )
      .order("created_at", { ascending: false });
    setProducts((data as unknown as Row[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleVisibility(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("products").update({ is_visible: !current }).eq("id", id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus size={15} /> New product
        </Link>
      </div>

      <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : products.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No products yet.</p>
        ) : (
          products.map((p) => {
            const primary = p.product_images.find((i) => i.is_primary) ?? p.product_images[0];
            const prices = p.product_variants.map((v) => v.price_ngn);
            return (
              <div key={p.id} className="flex items-center gap-4 p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                  {primary && (
                    <Image
                      src={getStoragePublicUrl("product-images", primary.storage_path)}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-primary">
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {p.categories?.name ?? "Uncategorized"} ·{" "}
                    {prices.length ? formatCurrency(Math.min(...prices), "NGN") : "No price set"}
                  </p>
                </div>
                <button
                  onClick={() => toggleVisibility(p.id, p.is_visible)}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-muted"
                >
                  {p.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  {p.is_visible ? "Visible" : "Hidden"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
