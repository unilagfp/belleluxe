import type { CartItem } from "@/lib/cart/cart-store";

const WHATSAPP_NUMBER = "2348141620382";

export function buildWhatsAppOrderLink(orderNumber: string, items: CartItem[], subtotalNgn: number) {
  const lines = [
    `Hi BELLÉLUXE! I just placed order ${orderNumber}:`,
    ...items.map(
      (item) => `- ${item.productName} (${item.variantName}) x${item.quantity}`
    ),
    `Subtotal: ₦${subtotalNgn.toLocaleString("en-NG")}`,
    "Please confirm payment details.",
  ];

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}
