import { describe, expect, it } from "vitest";
import { cleanNote, isMoneyDraft, monthTotal, noteSuggestions, parseAmount, sortNewestFirst, totalsByCurrency, usedCurrencies, type SavingEntry } from "./savings";

const e = (amount: number, currency: SavingEntry["currency"], savedAt: string, id = `${currency}-${savedAt}`): SavingEntry => ({ id, amount, currency, savedAt });

describe("isMoneyDraft", () => {
  it.each(["", "0", "5000", "12.", "12.3", "12.34"])("accepts %j", (v) => expect(isMoneyDraft(v)).toBe(true));
  it.each(["abc", "1.234", "-1", "1,000", "1e5"])("rejects %j", (v) => expect(isMoneyDraft(v)).toBe(false));
});

describe("parseAmount", () => {
  it("parses valid amounts", () => {
    expect(parseAmount("50")).toBe(50);
    expect(parseAmount("12.5")).toBe(12.5);
  });
  it.each(["", "0", "0.00", ".", "abc", "2000000000"])("rejects %j", (v) => expect(parseAmount(v)).toBeNull());
});

describe("totalsByCurrency", () => {
  it("keeps currencies separate and sums without float drift", () => {
    const totals = totalsByCurrency([e(0.1, "EUR", "2026-10-01"), e(0.2, "EUR", "2026-10-02"), e(30, "USD", "2026-10-03")]);
    expect(totals).toEqual({ EUR: 0.3, USD: 30 });
  });
  it("is empty for no entries", () => expect(totalsByCurrency([])).toEqual({}));
});

describe("monthTotal", () => {
  it("counts only the given currency in the current month", () => {
    const now = new Date(2026, 9, 15);
    const entries = [
      e(50, "EUR", new Date(2026, 9, 1).toISOString()),
      e(25, "EUR", new Date(2026, 9, 14).toISOString()),
      e(100, "EUR", new Date(2026, 8, 30).toISOString()),
      e(10, "USD", new Date(2026, 9, 2).toISOString()),
    ];
    expect(monthTotal(entries, "EUR", now)).toBe(75);
  });
});

describe("usedCurrencies / sortNewestFirst", () => {
  const entries = [e(1, "EUR", "2026-10-01T10:00:00Z"), e(1, "AED", "2026-10-03T10:00:00Z"), e(1, "EUR", "2026-10-02T10:00:00Z")];
  it("lists currencies most recent first, once each", () => expect(usedCurrencies(entries)).toEqual(["AED", "EUR"]));
  it("sorts newest first", () => expect(sortNewestFirst(entries).map((x) => x.savedAt.slice(0, 10))).toEqual(["2026-10-03", "2026-10-02", "2026-10-01"]));
});

describe("cleanNote", () => {
  it("trims and collapses whitespace", () => expect(cleanNote("  In   my\nsafe ")).toBe("In my safe"));
  it.each([null, undefined, "", "   "])("turns %j into null", (v) => expect(cleanNote(v)).toBeNull());
});

describe("noteSuggestions", () => {
  it("offers defaults when there are no notes yet", () => expect(noteSuggestions([])).toEqual(["Cash", "Bank account", "Safe"]));
  it("puts recent notes first, without duplicates (case-insensitive)", () => {
    const entries = [
      { ...e(1, "EUR", "2026-10-01T10:00:00Z"), note: "cash" },
      { ...e(1, "EUR", "2026-10-03T10:00:00Z"), note: "Revolut" },
      { ...e(1, "EUR", "2026-10-02T10:00:00Z"), note: null },
    ];
    expect(noteSuggestions(entries)).toEqual(["Revolut", "cash", "Bank account"]);
  });
});
