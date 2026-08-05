"use client";

import { useCurrency } from "@/components/currency-provider";

export function CurrencySwitcher() {
  const { code, setCode, rates } = useCurrency();

  return (
    <select
      value={code}
      onChange={(e) => setCode(e.target.value)}
      aria-label="Select currency"
      className="h-9 rounded-full border border-border bg-surface px-3 text-base font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:text-xs"
    >
      {rates.map((r) => (
        <option key={r.code} value={r.code}>
          {r.code}
        </option>
      ))}
    </select>
  );
}
