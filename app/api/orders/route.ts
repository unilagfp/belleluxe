import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/email/brevo";

type OrderResult = {
  order: { order_number: string; subtotal_ngn: number };
  items: { product_name_snapshot: string; variant_name_snapshot: string | null; quantity: number }[];
};

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

  if (customer_email) {
    const result = data as OrderResult;
    const itemsHtml = `<table role="presentation" width="100%" style="border-collapse:collapse;">${result.items
      .map(
        (item) =>
          `<tr><td style="padding:4px 0;">${item.product_name_snapshot}${
            item.variant_name_snapshot ? ` (${item.variant_name_snapshot})` : ""
          }</td><td style="padding:4px 0;text-align:right;color:#6b6470;">× ${item.quantity}</td></tr>`
      )
      .join("")}</table>`;

    sendOrderConfirmationEmail({
      to: customer_email,
      orderNumber: result.order.order_number,
      customerName: customer_name,
      itemsHtml,
      subtotalNgn: result.order.subtotal_ngn,
    }).catch((err) => console.error("Order confirmation email failed:", err));
  }

  return NextResponse.json(data);
}
