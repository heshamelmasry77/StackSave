import { formatMoney } from "@shared/currencies";
import type { SavingEntry } from "@shared/savings";
import { savedAtLabel } from "../../lib/dates";

type Props = { entries: SavingEntry[]; onRemove: (entry: SavingEntry) => void };

export function History({ entries, onRemove }: Props) {
  return (
    <section aria-labelledby="history-title" className="flex flex-col gap-2">
      <h2 id="history-title" className="mb-0.5 text-[13px] font-semibold uppercase tracking-widest text-zinc-400">History</h2>
      {entries.length === 0 ? (
        <p className="py-3 text-sm text-zinc-500">Your saves will show up here.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => {
            const amount = `+${formatMoney(e.amount, e.currency)}`;
            return (
              <li key={e.id} className="animate-fade-up flex items-center gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-900/60 py-1.5 pl-4 pr-1.5">
                <span className="flex-1 text-[17px] font-bold tabular-nums text-lime-300">{amount}</span>
                <span className="text-[13px] text-zinc-400">{savedAtLabel(e.savedAt)}</span>
                <button type="button" onClick={() => onRemove(e)} aria-label={`Remove ${amount}`} className="grid size-11 place-items-center rounded-xl text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
