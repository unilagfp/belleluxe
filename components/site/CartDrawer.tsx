"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useCurrency } from "@/components/currency-provider";
import { Button } from "@/components/ui/Button";

export function CartDrawer() {
  const { items, isOpen, close, updateQuantity, removeItem, subtotalNgn } = useCart();
  const { format } = useCurrency();

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col bg-surface shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-bold">Your bag ({items.length})</h2>
          <button onClick={close} aria-label="Close cart" className="rounded-full p-1.5 hover:bg-surface-muted">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              Your bag is empty.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="rounded-full border border-border p-1 hover:bg-surface-muted"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="rounded-full border border-border p-1 hover:bg-surface-muted disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {format(item.priceNgn * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    aria-label="Remove item"
                    className="h-fit rounded-full p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center justify-between text-sm font-semibold">
              <span>Subtotal</span>
              <span>{format(subtotalNgn)}</span>
            </div>
            <Link href="/checkout" onClick={close}>
              <Button className="w-full">Checkout</Button>
            </Link>
            <Link
              href="/cart"
              onClick={close}
              className="mt-2 block text-center text-xs text-muted-foreground hover:text-primary"
            >
              View full bag
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
