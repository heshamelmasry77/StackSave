// Savings entries and the maths on them, shared by the client and the server.
import type { CurrencyCode } from "./currencies";

export type SavingEntry = {
  /** Client-generated UUID, so saves made offline or before sign-in can be synced without duplicates. */
  id: string;
  amount: number;
  currency: CurrencyCode;
  /** ISO 8601 timestamp. */
  savedAt: string;
  /** Where the money is or what it's for, e.g. "In my safe". Null when there's none. */
  note?: string | null;
};

export const MAX_AMOUNT = 1_000_000_000;
export const MAX_NOTE_LENGTH = 200;

/** Collapses whitespace and trims; an empty note becomes null. */
export function cleanNote(note: string | null | undefined): string | null {
  const cleaned = (note ?? "").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned : null;
}

/**
 * Up to `limit` quick picks from the person's own recent notes. No presets: suggesting answers
 * ("Cash", "Bank") would steer what people write; their own notes just save retyping.
 */
export function noteSuggestions(entries: SavingEntry[], limit = 3): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const note of sortNewestFirst(entries).map((e) => cleanNote(e.note))) {
    if (!note || seen.has(note.toLowerCase())) continue;
    seen.add(note.toLowerCase());
    out.push(note);
    if (out.length === limit) break;
  }
  return out;
}

/** Accepts a partially typed money amount: digits with up to two decimals. */
export const isMoneyDraft = (value: string) => /^\d*(\.\d{0,2})?$/.test(value);

/** A typed amount as a number, or null when it can't be saved (empty, zero, too large). */
export function parseAmount(draft: string): number | null {
  if (!isMoneyDraft(draft)) return null;
  const n = Number(draft);
  return Number.isFinite(n) && n > 0 && n <= MAX_AMOUNT ? n : null;
}

// Sum in ten-thousandths so 0.1 + 0.2 is 0.3, not 0.30000000000000004.
const sum = (amounts: number[]) => amounts.reduce((acc, a) => acc + Math.round(a * 10_000), 0) / 10_000;

/** Total per currency, never converted between currencies. */
export function totalsByCurrency(entries: SavingEntry[]): Partial<Record<CurrencyCode, number>> {
  const groups: Partial<Record<CurrencyCode, number[]>> = {};
  for (const e of entries) (groups[e.currency] ??= []).push(e.amount);
  return Object.fromEntries(Object.entries(groups).map(([code, amounts]) => [code, sum(amounts!)]));
}

/** Total saved in one currency during the calendar month of `now` (local time). */
export function monthTotal(entries: SavingEntry[], currency: CurrencyCode, now = new Date()) {
  return sum(
    entries
      .filter((e) => {
        const d = new Date(e.savedAt);
        return e.currency === currency && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .map((e) => e.amount),
  );
}

/** Currencies the person has used, most recent first. */
export function usedCurrencies(entries: SavingEntry[]): CurrencyCode[] {
  const sorted = [...entries].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  return [...new Set(sorted.map((e) => e.currency))];
}

/** Newest first. */
export const sortNewestFirst = (entries: SavingEntry[]) => [...entries].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
