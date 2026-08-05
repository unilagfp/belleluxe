import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { customer_name, customer_phone, customer_email, delivery_address, delivery_city, delivery_state, notes, currency_display, fx_rate_snapshot, items } = body ?? {};

  if (!customer_name || !customer_phone || !delivery_address || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Missing required order details." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_order", {
    payload: {
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      delivery_city,
      delivery_state,
      notes,
      currency_display,
      fx_rate_snapshot,
      items: items.map((item: { variantId: string; quantity: number }) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
