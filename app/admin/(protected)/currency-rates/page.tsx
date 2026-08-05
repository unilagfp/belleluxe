"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

type Rate = {
  code: string;
  rate_to_ngn: number;
  is_active: boolean;
  updated_at: string;
};

export default function AdminCurrencyRatesPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState("");
  const [newRate, setNewRate] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("currency_rates").select("*").order("code");
    setRates(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateRate(code: string, patch: Partial<Rate>) {
    setRates((list) => list.map((r) => (r.code === code ? { ...r, ...patch } : r)));
    const supabase = createClient();
    await supabase
      .from("currency_rates")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("code", code);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newCode || !newRate) return;
    const supabase = createClient();
    const { error } = await supabase.from("currency_rates").insert({
      code: newCode.toUpperCase(),
      rate_to_ngn: Number(newRate),
    });
    if (error) {
      setError(error.message);
      return;
    }
    setNewCode("");
    setNewRate("");
    load();
  }

  async function handleDelete(code: string) {
    if (code === "NGN") return;
    if (!confirm(`Remove ${code}?`)) return;
    const supabase = createClient();
    await supabase.from("currency_rates").delete().eq("code", code);
    load();
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-bold">Currency rates</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        All prices are stored in NGN. Set how many NGN equal 1 unit of each currency —
        the storefront converts on display using these rates.
      </p>

      <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : (
          rates.map((rate) => (
            <div key={rate.code} className="flex items-center gap-3 p-4">
              <span className="w-14 font-semibold">{rate.code}</span>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">1 {rate.code} =</span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={rate.code === "NGN"}
                  value={rate.rate_to_ngn}
                  onChange={(e) => updateRate(rate.code, { rate_to_ngn: Number(e.target.value) })}
                  className="w-28"
                />
                <span className="text-muted-foreground">NGN</span>
              </div>
              <label className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rate.is_active}
                  disabled={rate.code === "NGN"}
                  onChange={(e) => updateRate(rate.code, { is_active: e.target.checked })}
                />
                Active
              </label>
              {rate.code !== "NGN" && (
                <button
                  onClick={() => handleDelete(rate.code)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-surface-muted hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAdd} className="mt-6 flex items-end gap-3">
        <div>
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            maxLength={3}
            placeholder="EUR"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="w-20 uppercase"
          />
        </div>
        <div>
          <Label htmlFor="rate">Rate to NGN</Label>
          <Input
            id="rate"
            type="number"
            min={0}
            step="0.01"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            className="w-32"
          />
        </div>
        <Button type="submit" className="flex items-center gap-1.5">
          <Plus size={14} /> Add currency
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
