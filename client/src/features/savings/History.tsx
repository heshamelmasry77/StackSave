import { Trash2Icon } from "lucide-react";
import { formatMoney } from "@shared/currencies";
import type { SavingEntry } from "@shared/savings";
import { Button } from "@/components/ui/button";
import { savedAtLabel } from "@/lib/dates";

type Props = {
  entries: SavingEntry[];
  onEdit: (entry: SavingEntry) => void;
  onRemove: (entry: SavingEntry) => void;
};

export function History({ entries, onEdit, onRemove }: Props) {
  return (
    <section aria-labelledby="history-title" className="flex flex-col gap-2">
      <h2 id="history-title" className="mb-0.5 text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">History</h2>
      {entries.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">Your saves will show up here.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => {
            const amount = `+${formatMoney(e.amount, e.currency)}`;
            return (
              <li key={e.id} className="flex animate-fade-up items-center gap-1 rounded-2xl border bg-card/60 p-1.5">
                {/* Tapping the entry opens it to add or change its note. */}
                <button type="button" onClick={() => onEdit(e)} aria-label={`${amount}${e.note ? `, ${e.note}` : ""}. Edit note`} className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl px-2.5 py-1 text-left outline-none transition hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[17px] font-bold tabular-nums text-primary">{amount}</span>
                    {e.note && <span className="truncate text-[13px] text-foreground/75">{e.note}</span>}
                  </span>
                  <span className="shrink-0 text-[13px] text-muted-foreground">{savedAtLabel(e.savedAt)}</span>
                </button>
                <Button variant="ghost" size="icon" onClick={() => onRemove(e)} aria-label={`Remove ${amount}`} className="text-muted-foreground hover:text-foreground">
                  <Trash2Icon />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
