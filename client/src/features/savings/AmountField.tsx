import { ChevronDownIcon } from "lucide-react";
import { currencySymbol, type CurrencyCode } from "@shared/currencies";
import { isMoneyDraft } from "@shared/savings";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  value: string;
  onChange: (draft: string) => void;
  currency: CurrencyCode;
  onCurrencyClick: () => void;
  autoFocus?: boolean;
};

/** The big amount input with the currency symbol inside, plus the currency button next to it. */
export function AmountField({ id, value, onChange, currency, onCurrencyClick, autoFocus }: Props) {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-[60px] min-w-0 flex-1 items-center gap-2 rounded-2xl border border-input bg-background px-3.5 transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
        <span className="text-[22px] font-semibold text-muted-foreground" aria-hidden="true">{currencySymbol(currency)}</span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => isMoneyDraft(e.target.value) && onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[28px] font-bold tabular-nums outline-none placeholder:text-muted-foreground/60"
        />
      </div>
      <Button type="button" variant="outline" onClick={onCurrencyClick} aria-label={`Currency: ${currency}. Change`} className="h-[60px] w-24 rounded-2xl bg-background text-base font-bold">
        {currency}
        <ChevronDownIcon className="text-muted-foreground" />
      </Button>
    </div>
  );
}
