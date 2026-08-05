import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CurrencyProvider } from "@/components/currency-provider";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: rates } = await supabase
    .from("currency_rates")
    .select("code, rate_to_ngn")
    .eq("is_active", true);

  const cookieStore = await cookies();
  const savedCurrency = cookieStore.get("belleluxe_currency")?.value;
  const initialCode = rates?.some((r) => r.code === savedCurrency) ? savedCurrency! : "NGN";

  return (
    <CurrencyProvider rates={rates ?? []} initialCode={initialCode}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CurrencyProvider>
  );
}
