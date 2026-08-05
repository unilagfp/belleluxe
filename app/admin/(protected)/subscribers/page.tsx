"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

type Subscriber = { id: string; email: string; subscribed_at: string; is_active: boolean };

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    createClient()
      .from("newsletter_subscribers")
      .select("id, email, subscribed_at, is_active")
      .eq("is_active", true)
      .order("subscribed_at", { ascending: false })
      .then(({ data }) => {
        setSubscribers(data ?? []);
        setLoading(false);
      });
  }, []);

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setBroadcastStatus(null);
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    const data = await res.json();
    setBroadcastStatus(res.ok ? "Broadcast sent!" : data.error ?? "Failed to send.");
    setSending(false);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Newsletter subscribers</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {loading ? "…" : `${subscribers.length} active subscriber(s)`}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="max-h-96 divide-y divide-border overflow-y-auto rounded-xl border border-border bg-surface">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading…</p>
          ) : subscribers.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No subscribers yet.</p>
          ) : (
            subscribers.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 text-sm">
                <span>{s.email}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(s.subscribed_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleBroadcast} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Send a broadcast</h2>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          {broadcastStatus && <p className="text-sm text-muted-foreground">{broadcastStatus}</p>}
          <Button type="submit" loading={sending} className="self-start">
            Send to all subscribers
          </Button>
        </form>
      </div>
    </div>
  );
}
