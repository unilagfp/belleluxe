"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useCurrency } from "@/components/currency-provider";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalNgn } = useCart();
  const { format } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold">Your bag is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-bold">Your bag</h1>

      <ul className="mt-8 flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">{item.variantName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  className="rounded-full border border-border p-1 hover:bg-surface-muted"
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  disabled={item.quantity >= item.maxStock}
                  className="rounded-full border border-border p-1 hover:bg-surface-muted disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <span className="font-semibold">{format(item.priceNgn * item.quantity)}</span>
              <button
                onClick={() => removeItem(item.variantId)}
                aria-label="Remove item"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-surface p-4">
        <span className="font-semibold">Subtotal</span>
        <span className="text-lg font-bold">{format(subtotalNgn)}</span>
      </div>

      <Link href="/checkout">
        <Button className="mt-6 w-full">Proceed to checkout</Button>
      </Link>
    </div>
  );
}
