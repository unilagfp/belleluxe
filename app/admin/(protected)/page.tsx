import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [products, pendingOrders, totalOrders, unreadMessages] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  const stats = [
    { label: "Products", value: products.count ?? 0 },
    { label: "Pending orders", value: pendingOrders.count ?? 0 },
    { label: "Total orders", value: totalOrders.count ?? 0 },
    { label: "Unread messages", value: unreadMessages.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
