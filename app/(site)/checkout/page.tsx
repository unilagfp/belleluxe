"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useCurrency } from "@/components/currency-provider";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalNgn } = useCart();
  const { code, format } = useCurrency();
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_address: "",
    delivery_city: "",
    delivery_state: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items.length, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        currency_display: code,
        items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    sessionStorage.setItem(
      "belleluxe_last_order",
      JSON.stringify({ order: data.order, items: items })
    );
    router.push("/order-confirmation");
  }

  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;ll confirm your order and payment over WhatsApp.
      </p>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-surface p-4 text-sm">
        <span>{items.length} item(s)</span>
        <span className="font-semibold">{format(subtotalNgn)}</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="customer_name">Full name</Label>
          <Input
            id="customer_name"
            required
            value={form.customer_name}
            onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="customer_phone">Phone number</Label>
            <Input
              id="customer_phone"
              required
              value={form.customer_phone}
              onChange={(e) => setForm((f) => ({ ...f, customer_phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="customer_email">Email (optional)</Label>
            <Input
              id="customer_email"
              type="email"
              value={form.customer_email}
              onChange={(e) => setForm((f) => ({ ...f, customer_email: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="delivery_address">Delivery address</Label>
          <Input
            id="delivery_address"
            required
            value={form.delivery_address}
            onChange={(e) => setForm((f) => ({ ...f, delivery_address: e.target.value }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="delivery_city">City</Label>
            <Input
              id="delivery_city"
              value={form.delivery_city}
              onChange={(e) => setForm((f) => ({ ...f, delivery_city: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="delivery_state">State</Label>
            <Input
              id="delivery_state"
              value={form.delivery_state}
              onChange={(e) => setForm((f) => ({ ...f, delivery_state: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" loading={loading} className="mt-2 w-full">
          Place order
        </Button>
      </form>
    </div>
  );
}
