"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Star, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

export type ProductImageRow = {
  id: string;
  storage_path: string;
  is_primary: boolean;
  sort_order: number;
  variant_id: string | null;
};

type PendingPreview = { id: string; file: File; previewUrl: string };

export function ImageUploader({
  productId,
  images,
  onChange,
}: {
  productId: string;
  images: ProductImageRow[];
  onChange: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPending(
      files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }))
    );
  }

  async function handleUpload() {
    if (pending.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    try {
      for (let i = 0; i < pending.length; i++) {
        const { file } = pending[i];
        const storagePath = `${productId}/${crypto.randomUUID()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(storagePath, file, { contentType: file.type });
        if (upErr) throw upErr;

        const { error: insErr } = await supabase.from("product_images").insert({
          product_id: productId,
          storage_path: storagePath,
          sort_order: images.length + i,
          is_primary: images.length === 0 && i === 0,
        });
        if (insErr) throw insErr;
      }
      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPending([]);
      if (inputRef.current) inputRef.current.value = "";
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSetPrimary(imageId: string) {
    const supabase = createClient();
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
    await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
    onChange();
  }

  async function handleDelete(image: ProductImageRow) {
    if (!confirm("Delete this image?")) return;
    const supabase = createClient();
    await supabase.storage.from("product-images").remove([image.storage_path]);
    await supabase.from("product_images").delete().eq("id", image.id);
    onChange();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
            <Image
              src={getStoragePublicUrl("product-images", img.storage_path)}
              alt=""
              fill
              className="object-cover"
            />
            {img.is_primary && (
              <span className="absolute left-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                Primary
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-black/50 p-1">
              {!img.is_primary && (
                <button
                  onClick={() => handleSetPrimary(img.id)}
                  title="Set as primary"
                  className="rounded p-1 text-white hover:bg-white/20"
                >
                  <Star size={12} />
                </button>
              )}
              <button
                onClick={() => handleDelete(img)}
                title="Delete"
                className="rounded p-1 text-white hover:bg-white/20"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {pending.map((p) => (
          <div key={p.id} className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-dashed border-primary/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.previewUrl} alt="" className="h-full w-full object-cover opacity-70" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-[10px] font-medium text-white">
              Pending
            </span>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-surface-muted"
        >
          <Upload size={18} />
          <span className="text-[10px]">Add images</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleSelect}
        />
      </div>

      {pending.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {uploading ? "Uploading…" : `Upload ${pending.length} image(s)`}
        </button>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
