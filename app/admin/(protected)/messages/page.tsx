"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRead(id: string, current: boolean) {
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, is_read: !current } : m)));
    const supabase = createClient();
    await supabase.from("contact_messages").update({ is_read: !current }).eq("id", id);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    const supabase = createClient();
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages((list) => list.filter((m) => m.id !== id));
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Contact messages</h1>

      <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`p-4 ${!m.is_read ? "bg-primary/5" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {m.name} <span className="font-normal text-muted-foreground">— {m.email}</span>
                  </p>
                  {m.phone && <p className="text-xs text-muted-foreground">{m.phone}</p>}
                  <p className="mt-2 text-sm">{m.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => toggleRead(m.id, m.is_read)}
                    title={m.is_read ? "Mark unread" : "Mark read"}
                    className="rounded-full p-2 text-muted-foreground hover:bg-surface-muted"
                  >
                    {m.is_read ? <MailOpen size={15} /> : <Mail size={15} />}
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-surface-muted hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
