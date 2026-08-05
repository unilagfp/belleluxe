"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Package, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

export function AccountMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (email === undefined) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  if (email === null) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-muted"
      >
        <User size={17} />
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-muted"
      >
        <User size={17} />
      </button>

      <div
        className={cn(
          "absolute right-0 top-11 w-56 origin-top-right rounded-xl border border-border bg-surface py-2 shadow-lg transition-all",
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        )}
      >
        <p className="truncate border-b border-border px-4 pb-2 text-xs text-muted-foreground">
          {email}
        </p>
        <Link
          href="/account"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface-muted"
        >
          <User size={15} /> My account
        </Link>
        <Link
          href="/account/orders"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface-muted"
        >
          <Package size={15} /> My orders
        </Link>
        <Link
          href="/account/favorites"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface-muted"
        >
          <Heart size={15} /> Favorites
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-surface-muted"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}
