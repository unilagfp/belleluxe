import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency/convert";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  fulfilled: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, subtotal_ngn, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">My orders</h1>
        <Link href="/account" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to account
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/shop" className="font-medium text-primary">
            Start shopping
          </Link>
        </p>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{order.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">
                  {formatCurrency(order.subtotal_ngn, "NGN")}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status] ?? ""}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
