import { Trash2Icon } from "lucide-react";
import { formatMoney } from "@shared/currencies";
import type { SavingEntry } from "@shared/savings";
import { Button } from "@/components/ui/button";
import { savedAtLabel } from "@/lib/dates";

type Props = { entries: SavingEntry[]; onRemove: (entry: SavingEntry) => void };

export function History({ entries, onRemove }: Props) {
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
              <li key={e.id} className="flex animate-fade-up items-center gap-3 rounded-2xl border bg-card/60 py-1.5 pl-4 pr-1.5">
                <span className="flex-1 text-[17px] font-bold tabular-nums text-primary">{amount}</span>
                <span className="text-[13px] text-muted-foreground">{savedAtLabel(e.savedAt)}</span>
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
