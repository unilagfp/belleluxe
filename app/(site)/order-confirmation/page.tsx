"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppOrderLink } from "@/lib/utils/whatsapp";
import { useCart } from "@/components/cart-provider";
import type { CartItem } from "@/lib/cart/cart-store";

type StoredOrder = {
  order: { order_number: string; subtotal_ngn: number };
  items: CartItem[];
};

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { clear } = useCart();
  const [data, setData] = useState<StoredOrder | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("belleluxe_last_order");
    if (!raw) {
      router.replace("/");
      return;
    }
    setData(JSON.parse(raw));
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!data) return null;

  const whatsappLink = buildWhatsAppOrderLink(
    data.order.order_number,
    data.items,
    data.order.subtotal_ngn
  );

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6">
      <CheckCircle2 size={48} className="text-primary" />
      <h1 className="mt-4 font-display text-3xl font-bold">Order placed!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Order <strong>{data.order.order_number}</strong> has been received. To
        finish up, confirm your order and payment details with us on WhatsApp.
      </p>

      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-8 w-full">
        <Button className="w-full">Continue on WhatsApp</Button>
      </a>
      <Link href="/shop" className="mt-4 text-sm text-muted-foreground hover:text-primary">
        Continue shopping
      </Link>
    </div>
  );
}
