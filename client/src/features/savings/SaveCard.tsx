import { useState, type FormEvent } from "react";
import { currencySymbol, type CurrencyCode } from "@shared/currencies";
import { isMoneyDraft, parseAmount } from "@shared/savings";

type Props = {
  currency: CurrencyCode;
  disabled?: boolean;
  onOpenCurrencies: () => void;
  onSave: (amount: number) => void;
};

const QUICK = [10, 50, 100];

export function SaveCard({ currency, disabled, onOpenCurrencies, onSave }: Props) {
  const [draft, setDraft] = useState("");
  const amount = parseAmount(draft);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (amount === null || disabled) return;
    onSave(amount);
    setDraft("");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5 rounded-3xl border border-zinc-800 bg-zinc-900 p-[18px]">
      <label htmlFor="save-amount" className="text-sm font-semibold text-zinc-300">How much are you putting aside?</label>
      <div className="flex gap-2.5">
        <div className="flex h-[60px] min-w-0 flex-1 items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-3.5 transition focus-within:border-lime-300">
          <span className="text-[22px] font-semibold text-zinc-500" aria-hidden="true">{currencySymbol(currency)}</span>
          <input
            id="save-amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={draft}
            onChange={(e) => isMoneyDraft(e.target.value) && setDraft(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[28px] font-bold tabular-nums outline-none placeholder:text-zinc-600"
          />
        </div>
        <button type="button" onClick={onOpenCurrencies} aria-label={`Currency: ${currency}. Change`} className="flex h-[60px] w-24 items-center justify-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-950 text-base font-bold transition hover:border-zinc-500">
          {currency}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </div>
      <div className="flex gap-2">
        {QUICK.map((q) => (
          <button key={q} type="button" onClick={() => setDraft(String((Number(draft) || 0) + q))} className="h-11 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 text-[15px] font-semibold text-zinc-300 transition hover:border-zinc-600">
            +{q}
          </button>
        ))}
      </div>
      <button type="submit" disabled={amount === null || disabled} className="h-14 rounded-2xl bg-lime-300 text-[17px] font-extrabold text-zinc-950 transition hover:bg-lime-200 disabled:opacity-35 disabled:hover:bg-lime-300">
        Save it
      </button>
    </form>
  );
}
