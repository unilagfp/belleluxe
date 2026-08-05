import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminSignOutButton } from "./AdminSignOutButton";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/currency-rates", label: "Currency" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/messages", label: "Messages" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin/login?error=not_admin");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-border bg-surface p-4 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <Link href="/admin" className="font-display text-lg font-bold text-primary">
          BELLÉLUXE Admin
        </Link>
        <nav className="mt-6 flex flex-row flex-wrap gap-1 md:flex-col">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-surface-muted hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <AdminSignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
