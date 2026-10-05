import { useState } from "react";
import { guessCurrency, isCurrencyCode, type CurrencyCode } from "@shared/currencies";
import { readJson, writeJson } from "../../lib/storage";

const KEY = "stacksave.currency";

/** The currency the person last picked, remembered on this device. First visit: guessed from the browser. */
export function usePreferredCurrency() {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const stored = readJson(KEY);
    return isCurrencyCode(stored) ? stored : guessCurrency(navigator.language);
  });

  const choose = (code: CurrencyCode) => {
    setCurrency(code);
    writeJson(KEY, code);
  };

  return [currency, choose] as const;
}
