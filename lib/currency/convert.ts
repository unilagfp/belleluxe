export type CurrencyRate = {
  code: string;
  rate_to_ngn: number;
};

const CURRENCY_LOCALES: Record<string, string> = {
  NGN: "en-NG",
  USD: "en-US",
  GBP: "en-GB",
};

/** Converts an NGN amount (the single stored source of truth) to a display currency. */
export function toDisplayAmount(
  ngnAmount: number,
  code: string,
  rates: CurrencyRate[]
): number {
  const rate = rates.find((r) => r.code === code)?.rate_to_ngn ?? 1;
  return ngnAmount / rate;
}

export function formatCurrency(amount: number, code: string): string {
  return new Intl.NumberFormat(CURRENCY_LOCALES[code] ?? "en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "NGN" ? 0 : 2,
  }).format(amount);
}

/** Convenience: convert an NGN amount straight to a formatted string in one call. */
export function displayPrice(
  ngnAmount: number,
  code: string,
  rates: CurrencyRate[]
): string {
  return formatCurrency(toDisplayAmount(ngnAmount, code, rates), code);
}
