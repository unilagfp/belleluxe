"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

type SocialLinks = {
  instagram: string;
  tiktok: string;
  whatsapp_number: string;
  contact_email: string;
};

export default function AdminSettingsPage() {
  const [links, setLinks] = useState<SocialLinks>({
    instagram: "",
    tiktok: "",
    whatsapp_number: "",
    contact_email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    createClient()
      .from("site_settings")
      .select("value")
      .eq("key", "social_links")
      .single()
      .then(({ data }) => {
        if (data) setLinks((prev) => ({ ...prev, ...(data.value as SocialLinks) }));
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    await supabase
      .from("site_settings")
      .update({ value: links, updated_at: new Date().toISOString() })
      .eq("key", "social_links");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-bold">Site settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Social links and contact info shown across the site — no redeploy needed.
      </p>

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="contact_email">Contact email</Label>
          <Input
            id="contact_email"
            type="email"
            value={links.contact_email}
            onChange={(e) => setLinks((l) => ({ ...l, contact_email: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="whatsapp_number">WhatsApp number (with country code, no +)</Label>
          <Input
            id="whatsapp_number"
            value={links.whatsapp_number}
            onChange={(e) => setLinks((l) => ({ ...l, whatsapp_number: e.target.value }))}
            placeholder="2348141620382"
          />
        </div>
        <div>
          <Label htmlFor="instagram">Instagram handle</Label>
          <Input
            id="instagram"
            value={links.instagram}
            onChange={(e) => setLinks((l) => ({ ...l, instagram: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="tiktok">TikTok handle</Label>
          <Input
            id="tiktok"
            value={links.tiktok}
            onChange={(e) => setLinks((l) => ({ ...l, tiktok: e.target.value }))}
          />
        </div>

        <Button type="submit" loading={saving} className="mt-2 self-start">
          {saved ? "Saved!" : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
