import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  return <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">{children}</div>;
}
