"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { displayPrice, type CurrencyRate } from "@/lib/currency/convert";

const CURRENCY_COOKIE = "belleluxe_currency";

type CurrencyContextValue = {
  code: string;
  setCode: (code: string) => void;
  rates: CurrencyRate[];
  format: (ngnAmount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  children,
  rates,
  initialCode,
}: {
  children: ReactNode;
  rates: CurrencyRate[];
  initialCode: string;
}) {
  const [code, setCodeState] = useState(initialCode);

  useEffect(() => {
    const saved = localStorage.getItem(CURRENCY_COOKIE);
    if (saved && rates.some((r) => r.code === saved)) {
      setCodeState(saved);
    }
  }, [rates]);

  function setCode(next: string) {
    setCodeState(next);
    localStorage.setItem(CURRENCY_COOKIE, next);
    document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000`;
  }

  function format(ngnAmount: number) {
    return displayPrice(ngnAmount, code, rates);
  }

  return (
    <CurrencyContext.Provider value={{ code, setCode, rates, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}

export { CURRENCY_COOKIE };
