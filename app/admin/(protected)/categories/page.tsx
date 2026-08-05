"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, description, sort_order")
      .order("sort_order", { ascending: true });
    setCategories(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("categories").insert({
      name,
      slug: slugify(name),
      sort_order: categories.length,
    });
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setName("");
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Products in it will become uncategorized.")) return;
    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Categories</h1>

      <form onSubmit={handleCreate} className="mt-6 flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="name">New category</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wigs"
          />
        </div>
        <Button type="submit" loading={saving}>
          Add
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">/{c.slug}</p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                aria-label="Delete category"
                className="rounded-full p-2 text-muted-foreground hover:bg-surface-muted hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
