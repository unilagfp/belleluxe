"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { ImageUploader, type ProductImageRow } from "@/components/admin/ImageUploader";

type Variant = {
  id: string;
  name: string;
  price_ngn: number;
  stock_quantity: number;
  is_default: boolean;
  sort_order: number;
};

type ProductForm = {
  name: string;
  description: string;
  category_id: string;
  is_visible: boolean;
};

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const router = useRouter();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState<ProductForm | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ProductImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const [{ data: product }, { data: cats }] = await Promise.all([
      supabase
        .from("products")
        .select(
          "name, description, category_id, is_visible, product_variants(*), product_images(*)"
        )
        .eq("id", id)
        .single(),
      supabase.from("categories").select("id, name").order("sort_order"),
    ]);

    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? "",
        category_id: product.category_id ?? "",
        is_visible: product.is_visible,
      });
      setVariants(
        [...product.product_variants].sort((a, b) => a.sort_order - b.sort_order)
      );
      setImages(product.product_images);
    }
    setCategories(cats ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({
        name: form.name,
        description: form.description || null,
        category_id: form.category_id || null,
        is_visible: form.is_visible,
      })
      .eq("id", id);

    if (error) setError(error.message);
    setSaving(false);
  }

  async function handleDeleteProduct() {
    if (!confirm("Delete this product permanently? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    router.push("/admin/products");
  }

  async function handleAddVariant() {
    const supabase = createClient();
    const { data } = await supabase
      .from("product_variants")
      .insert({
        product_id: id,
        name: "New option",
        price_ngn: 0,
        stock_quantity: 0,
        is_default: variants.length === 0,
        sort_order: variants.length,
      })
      .select("*")
      .single();
    if (data) setVariants((v) => [...v, data]);
  }

  async function handleUpdateVariant(variantId: string, patch: Partial<Variant>) {
    setVariants((v) => v.map((item) => (item.id === variantId ? { ...item, ...patch } : item)));
    const supabase = createClient();
    await supabase.from("product_variants").update(patch).eq("id", variantId);
  }

  async function handleDeleteVariant(variantId: string) {
    if (!confirm("Delete this option?")) return;
    const supabase = createClient();
    await supabase.from("product_variants").delete().eq("id", variantId);
    setVariants((v) => v.filter((item) => item.id !== variantId));
  }

  if (loading || !form) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Edit product</h1>
        <button
          onClick={handleDeleteProduct}
          className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
        >
          <Trash2 size={14} /> Delete product
        </button>
      </div>

      <form onSubmit={handleSaveProduct} className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => f && { ...f, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => f && { ...f, description: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={form.category_id}
            onChange={(e) => setForm((f) => f && { ...f, category_id: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_visible}
            onChange={(e) => setForm((f) => f && { ...f, is_visible: e.target.checked })}
          />
          Visible on storefront
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={saving} className="self-start">
          Save changes
        </Button>
      </form>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Options & pricing</h2>
          <button
            onClick={handleAddVariant}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
          >
            <Plus size={14} /> Add option
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-3"
            >
              <Input
                value={variant.name}
                onChange={(e) => handleUpdateVariant(variant.id, { name: e.target.value })}
                className="w-40"
                placeholder="Option name"
              />
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">₦</span>
                <Input
                  type="number"
                  min={0}
                  value={variant.price_ngn}
                  onChange={(e) =>
                    handleUpdateVariant(variant.id, { price_ngn: Number(e.target.value) })
                  }
                  className="w-28"
                />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Stock</span>
                <Input
                  type="number"
                  min={0}
                  value={variant.stock_quantity}
                  onChange={(e) =>
                    handleUpdateVariant(variant.id, { stock_quantity: Number(e.target.value) })
                  }
                  className="w-20"
                />
              </div>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={variant.is_default}
                  onChange={(e) => handleUpdateVariant(variant.id, { is_default: e.target.checked })}
                />
                Default
              </label>
              <button
                onClick={() => handleDeleteVariant(variant.id)}
                className="ml-auto rounded-full p-2 text-muted-foreground hover:bg-surface-muted hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {variants.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No options yet — add at least one so this product can be sold.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-bold">Images</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload one or more images. The first (or starred) image is used as the product thumbnail.
        </p>
        <div className="mt-3">
          <ImageUploader productId={id} images={images} onChange={load} />
        </div>
      </div>
    </div>
  );
}
