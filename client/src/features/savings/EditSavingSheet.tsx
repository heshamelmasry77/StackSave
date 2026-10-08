import { useState, type FormEvent } from "react";
import { ArrowLeftIcon, Trash2Icon } from "lucide-react";
import { formatMoney, type CurrencyCode } from "@shared/currencies";
import { cleanNote, MAX_NOTE_LENGTH, parseAmount, type SavingEntry } from "@shared/savings";
import { AppSheet } from "@/components/AppSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { savedAtLabel } from "@/lib/dates";
import type { SavingChanges } from "./api";
import { AmountField } from "./AmountField";
import { CurrencyList } from "./CurrencySheet";
import { NoteSuggestions } from "./NoteSuggestions";

type Props = {
  entry: SavingEntry;
  usedCurrencies: CurrencyCode[];
  noteSuggestions: string[];
  onSave: (changes: SavingChanges) => void;
  onDelete: () => void;
  onClose: () => void;
};

/** Change the amount, currency or note of a save, or delete it. */
export function EditSavingSheet({ entry, usedCurrencies, noteSuggestions, onSave, onDelete, onClose }: Props) {
  const [draft, setDraft] = useState(String(entry.amount));
  const [currency, setCurrency] = useState<CurrencyCode>(entry.currency);
  const [note, setNote] = useState(entry.note ?? "");
  const [pickingCurrency, setPickingCurrency] = useState(false);

  const amount = parseAmount(draft);
  const changes: SavingChanges = {
    ...(amount !== null && amount !== entry.amount ? { amount } : {}),
    ...(currency !== entry.currency ? { currency } : {}),
    ...(cleanNote(note) !== (entry.note ?? null) ? { note: cleanNote(note) } : {}),
  };
  const hasChanges = Object.keys(changes).length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (amount === null || !hasChanges) return;
    onSave(changes);
    onClose();
  };

  if (pickingCurrency) {
    return (
      <AppSheet title="Currency" description="Choose the currency of this save" onClose={onClose}>
        <Button variant="ghost" size="sm" onClick={() => setPickingCurrency(false)} className="-ml-2 self-start text-muted-foreground">
          <ArrowLeftIcon />
          Back to the save
        </Button>
        <CurrencyList
          value={currency}
          used={usedCurrencies}
          onPick={(code) => {
            setCurrency(code);
            setPickingCurrency(false);
          }}
        />
      </AppSheet>
    );
  }

  return (
    <AppSheet eyebrow={`Saved ${savedAtLabel(entry.savedAt).toLowerCase()}`} title="Edit save" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-amount" className="text-sm font-semibold text-foreground/85">Amount</Label>
          <AmountField id="edit-amount" value={draft} onChange={setDraft} currency={currency} onCurrencyClick={() => setPickingCurrency(true)} />
          {amount === null && <p role="alert" className="text-sm text-red-300">Enter an amount above zero.</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-note" className="text-sm font-semibold text-foreground/85">
            Note <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <p id="edit-note-hint" className="-mt-1 text-[13px] text-muted-foreground">Where it's kept or what it's for.</p>
          <Input id="edit-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={MAX_NOTE_LENGTH} autoComplete="off" aria-describedby="edit-note-hint" />
          <NoteSuggestions suggestions={noteSuggestions} current={note} onPick={setNote} />
        </div>

        <Button type="submit" size="lg" disabled={amount === null || !hasChanges}>
          {amount !== null && hasChanges ? `Save ${formatMoney(amount, currency)}` : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="text-red-300 hover:text-red-200"
        >
          <Trash2Icon />
          Delete this save
        </Button>
      </form>
    </AppSheet>
  );
}
