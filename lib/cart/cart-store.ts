export type CartItem = {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  priceNgn: number;
  quantity: number;
  imageUrl: string | null;
  maxStock: number;
};

const CART_STORAGE_KEY = "belleluxe_cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function cartSubtotalNgn(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceNgn * item.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
