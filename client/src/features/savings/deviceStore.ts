// Saves made while signed out live on this device until the person creates an account.
import { isCurrencyCode } from "@shared/currencies";
import { MAX_AMOUNT, type SavingEntry } from "@shared/savings";
import { readJson, removeKey, writeJson } from "../../lib/storage";

const KEY = "stacksave.savings.v1";

const isEntry = (v: unknown): v is SavingEntry => {
  const e = v as Partial<SavingEntry> | null;
  return (
    typeof e?.id === "string" &&
    typeof e.amount === "number" &&
    e.amount > 0 &&
    e.amount <= MAX_AMOUNT &&
    isCurrencyCode(e.currency) &&
    typeof e.savedAt === "string" &&
    !Number.isNaN(Date.parse(e.savedAt))
  );
};

export function loadDeviceSavings(): SavingEntry[] {
  const data = readJson(KEY);
  return Array.isArray(data) ? data.filter(isEntry) : [];
}

export const saveDeviceSavings = (entries: SavingEntry[]) => writeJson(KEY, entries);
export const clearDeviceSavings = () => removeKey(KEY);
