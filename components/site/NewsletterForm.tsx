"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <p className="flex items-center gap-1.5 text-sm text-white/80">
        <Check size={15} /> You&apos;re subscribed!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xs gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="w-full rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        aria-label="Subscribe"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-60"
      >
        <ArrowRight size={15} />
      </button>
    </form>
  );
}
