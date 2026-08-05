"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

type MediaAsset = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  category: string | null;
  created_at: string;
};

export default function AdminMediaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("general");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });
    setAssets(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    try {
      for (const file of files) {
        const storagePath = `${category}/${crypto.randomUUID()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("site-media")
          .upload(storagePath, file, { contentType: file.type });
        if (upErr) throw upErr;

        const { error: insErr } = await supabase.from("media_assets").insert({
          storage_path: storagePath,
          category,
          alt_text: file.name,
        });
        if (insErr) throw insErr;
      }
      if (inputRef.current) inputRef.current.value = "";
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(asset: MediaAsset) {
    if (!confirm("Delete this file?")) return;
    const supabase = createClient();
    await supabase.storage.from("site-media").remove([asset.storage_path]);
    await supabase.from("media_assets").delete().eq("id", asset.id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Media library</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Site-wide images — hero banners, promo graphics, and anything else that isn&apos;t a product photo.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="general">General</option>
          <option value="hero">Hero</option>
          <option value="banner">Banner</option>
        </select>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Upload size={14} /> {uploading ? "Uploading…" : "Upload files"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
        ) : (
          assets.map((asset) => (
            <div key={asset.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
              <Image
                src={getStoragePublicUrl("site-media", asset.storage_path)}
                alt={asset.alt_text ?? ""}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-[10px] font-medium text-white">{asset.category}</span>
                <button
                  onClick={() => handleDelete(asset)}
                  className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
