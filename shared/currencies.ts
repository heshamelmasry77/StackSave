// Currencies a saving can be recorded in. Display symbols come from Intl.NumberFormat.

export const CURRENCIES = [
  { code: "EUR", name: "Euro" },
  { code: "USD", name: "US Dollar" },
  { code: "GBP", name: "British Pound" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "DKK", name: "Danish Krone" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "BHD", name: "Bahraini Dinar" },
  { code: "PLN", name: "Polish Złoty" },
  { code: "CZK", name: "Czech Koruna" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const CODES: ReadonlySet<string> = new Set(CURRENCIES.map((c) => c.code));

export const isCurrencyCode = (value: unknown): value is CurrencyCode => typeof value === "string" && CODES.has(value);

export const currencyName = (code: CurrencyCode) => CURRENCIES.find((c) => c.code === code)!.name;

/** Formats an amount, e.g. 1250 EUR → "€1,250". Whole amounts show no decimals. */
export function formatMoney(amount: number, currency: CurrencyCode, locale?: string) {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : undefined,
    maximumFractionDigits: whole ? 0 : undefined,
  }).format(amount);
}

/** The currency's symbol on its own, e.g. "€", for the amount field prefix. */
export function currencySymbol(currency: CurrencyCode, locale?: string) {
  const part = new Intl.NumberFormat(locale, { style: "currency", currency })
    .formatToParts(0)
    .find((p) => p.type === "currency");
  return part?.value ?? currency;
}

// Best guess for a first-time visitor, from the browser's region. Falls back to EUR.
const REGION_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD", GB: "GBP", NO: "NOK", SE: "SEK", DK: "DKK", CH: "CHF", CA: "CAD", AU: "AUD", NZ: "NZD",
  JP: "JPY", CN: "CNY", IN: "INR", EG: "EGP", AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD",
  PL: "PLN", CZ: "CZK",
};

export function guessCurrency(locale: string | undefined): CurrencyCode {
  try {
    const region = locale ? new Intl.Locale(locale).maximize().region : undefined;
    return (region && REGION_CURRENCY[region]) || "EUR";
  } catch {
    return "EUR";
  }
}
