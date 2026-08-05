"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";

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

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <aside className="border-b border-border bg-surface md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between p-4 md:block">
        <Link
          href="/admin"
          onClick={() => setOpen(false)}
          className="font-display text-lg font-bold text-primary"
        >
          BELLÉLUXE Admin
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground md:hidden"
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-200 md:grid-rows-[1fr] md:overflow-visible",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden px-4 pb-4 md:overflow-visible md:px-4 md:pb-4 md:pt-0">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-surface-muted hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-border pt-4">
            <AdminSignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
