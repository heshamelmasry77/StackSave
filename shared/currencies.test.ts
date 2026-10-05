import { describe, expect, it } from "vitest";
import { CURRENCIES, currencySymbol, formatMoney, guessCurrency, isCurrencyCode } from "./currencies";

describe("currencies", () => {
  it("has 21 unique, valid ISO codes", () => {
    expect(CURRENCIES).toHaveLength(21);
    expect(new Set(CURRENCIES.map((c) => c.code)).size).toBe(21);
    for (const c of CURRENCIES) expect(() => new Intl.NumberFormat("en", { style: "currency", currency: c.code })).not.toThrow();
  });

  it("validates codes", () => {
    expect(isCurrencyCode("EUR")).toBe(true);
    expect(isCurrencyCode("XYZ")).toBe(false);
    expect(isCurrencyCode(42)).toBe(false);
  });

  it("formats whole amounts without decimals and keeps cents otherwise", () => {
    expect(formatMoney(1250, "EUR", "en-IE")).toBe("€1,250");
    expect(formatMoney(12.5, "USD", "en-US")).toBe("$12.50");
  });

  it("returns the symbol", () => expect(currencySymbol("GBP", "en-GB")).toBe("£"));

  it("guesses the currency from the locale region", () => {
    expect(guessCurrency("en-US")).toBe("USD");
    expect(guessCurrency("ar-AE")).toBe("AED");
    expect(guessCurrency("fi-FI")).toBe("EUR");
    expect(guessCurrency(undefined)).toBe("EUR");
    expect(guessCurrency("not a locale!")).toBe("EUR");
  });
});
