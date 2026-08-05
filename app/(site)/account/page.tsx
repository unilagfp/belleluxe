import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">My account</h1>
      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="font-medium">{profile?.full_name || user?.email}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {profile?.role === "admin" && (
        <Link
          href="/admin"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Go to admin dashboard
        </Link>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/account/orders"
          className="rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold hover:bg-surface-muted"
        >
          View my orders
        </Link>
        <Link
          href="/account/favorites"
          className="rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold hover:bg-surface-muted"
        >
          My favorites
        </Link>
        <SignOutButton />
      </div>
    </div>
  );
}
