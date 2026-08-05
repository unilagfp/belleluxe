"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/currency/convert";

type OrderItem = {
  id: string;
  product_name_snapshot: string;
  variant_name_snapshot: string | null;
  quantity: number;
  line_total_ngn: number;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  status: string;
  payment_status: string;
  subtotal_ngn: number;
  created_at: string;
  order_items: OrderItem[];
};

const STATUSES = ["pending", "confirmed", "fulfilled", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_phone, delivery_address, status, payment_status, subtotal_ngn, created_at, order_items(*)"
      )
      .order("created_at", { ascending: false });
    setOrders((data as unknown as Order[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateField(orderId: string, patch: { status?: string; payment_status?: string }) {
    setOrders((list) => list.map((o) => (o.id === orderId ? { ...o, ...patch } : o)));
    const supabase = createClient();
    await supabase.from("orders").update(patch).eq("id", orderId);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Orders</h1>

      <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id}>
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="flex w-full flex-wrap items-center gap-4 p-4 text-left hover:bg-surface-muted"
              >
                <div className="min-w-[140px]">
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(order.subtotal_ngn, "NGN")}
                </span>
                <select
                  value={order.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateField(order.id, { status: e.target.value })}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium capitalize"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  value={order.payment_status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateField(order.id, { payment_status: e.target.value })}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium capitalize"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expanded === order.id && (
                <div className="border-t border-border bg-surface-muted p-4 text-sm">
                  <p className="mb-2 text-muted-foreground">
                    Deliver to: {order.delivery_address}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.product_name_snapshot}
                          {item.variant_name_snapshot ? ` (${item.variant_name_snapshot})` : ""} ×
                          {item.quantity}
                        </span>
                        <span>{formatCurrency(item.line_total_ngn, "NGN")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
