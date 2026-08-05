"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  type CartItem,
  readCart,
  writeCart,
  cartSubtotalNgn,
  cartCount,
} from "@/lib/cart/cart-store";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
  subtotalNgn: number;
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeCart(items);
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, existing.maxStock);
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: nextQty } : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxStock) }];
    });
    setIsOpen(true);
  }

  function updateQuantity(variantId: string, quantity: number) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.maxStock) }
              : i
          )
    );
  }

  function removeItem(variantId: string) {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }

  function clear() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clear,
        subtotalNgn: cartSubtotalNgn(items),
        count: cartCount(items),
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
