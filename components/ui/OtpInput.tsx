"use client";

import { useRef } from "react";

export function OtpInput({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(index: number, digit: string) {
    const chars = value.split("");
    chars[index] = digit;
    onChange(chars.join("").slice(0, length));
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-lg border border-border bg-surface text-center text-lg font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:h-14 sm:w-12"
        />
      ))}
    </div>
  );
}
