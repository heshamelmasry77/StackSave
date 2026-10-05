import { formatMoney, type CurrencyCode } from "@shared/currencies";
import { monthTotal, totalsByCurrency, type SavingEntry } from "@shared/savings";
import { Button } from "@/components/ui/button";

type Props = {
  entries: SavingEntry[];
  currency: CurrencyCode;
  onPickCurrency: (code: CurrencyCode) => void;
};

/** The selected currency's total, big; other currencies as chips (never converted). */
export function TotalHero({ entries, currency, onPickCurrency }: Props) {
  const totals = totalsByCurrency(entries);
  const month = monthTotal(entries, currency);
  const others = (Object.keys(totals) as CurrencyCode[]).filter((code) => code !== currency);

  return (
    <section aria-labelledby="total-label" className="flex flex-col gap-1.5 pt-2">
      <span id="total-label" className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">Total saved · {currency}</span>
      <output aria-live="polite" className="text-[56px] font-extrabold leading-none tracking-[-0.05em] tabular-nums">{formatMoney(totals[currency] ?? 0, currency)}</output>
      {month > 0 && <span className="text-sm font-semibold text-success">+{formatMoney(month, currency)} this month</span>}
      {entries.length === 0 && <span className="mt-1 text-sm text-muted-foreground">Add your first amount below to start your stack.</span>}
      {others.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {others.map((code) => (
            <Button key={code} variant="outline" size="sm" onClick={() => onPickCurrency(code)} aria-label={`Show ${code} total`} className="rounded-full bg-card tabular-nums">
              {formatMoney(totals[code]!, code)}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
