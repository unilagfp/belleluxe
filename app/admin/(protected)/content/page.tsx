"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";

type Block = {
  id: string;
  key: string;
  label: string | null;
  is_visible: boolean;
  content: Record<string, string>;
};

export default function AdminContentPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_content_blocks")
      .select("id, key, label, is_visible, content")
      .order("sort_order");
    setBlocks((data as unknown as Block[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleVisible(id: string, current: boolean) {
    setBlocks((list) => list.map((b) => (b.id === id ? { ...b, is_visible: !current } : b)));
    const supabase = createClient();
    await supabase
      .from("site_content_blocks")
      .update({ is_visible: !current, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  async function saveHeadline(id: string, headline: string) {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("site_content_blocks")
      .update({ content: { headline }, updated_at: new Date().toISOString() })
      .eq("id", id);
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Homepage content</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Show or hide sections on the homepage without a code deploy.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{block.label ?? block.key}</p>
                  <p className="text-xs text-muted-foreground">key: {block.key}</p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={block.is_visible}
                    onChange={() => toggleVisible(block.id, block.is_visible)}
                  />
                  Visible
                </label>
              </div>

              {block.key === "promo_banner" && (
                <div className="mt-3">
                  <Input
                    defaultValue={block.content?.headline ?? ""}
                    placeholder="Banner text shown at the top of the homepage"
                    onBlur={(e) => saveHeadline(block.id, e.target.value)}
                  />
                  {saving && <p className="mt-1 text-xs text-muted-foreground">Saving…</p>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
