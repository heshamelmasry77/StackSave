import { useState, type FormEvent } from "react";
import { NotebookPenIcon } from "lucide-react";
import type { CurrencyCode } from "@shared/currencies";
import { MAX_NOTE_LENGTH, parseAmount } from "@shared/savings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmountField } from "./AmountField";
import { NoteSuggestions } from "./NoteSuggestions";

type Props = {
  currency: CurrencyCode;
  disabled?: boolean;
  /** Quick picks for the note field. */
  noteSuggestions: string[];
  onOpenCurrencies: () => void;
  onSave: (amount: number, note: string) => void;
};

const QUICK = [10, 50, 100];

export function SaveCard({ currency, disabled, noteSuggestions, onOpenCurrencies, onSave }: Props) {
  const [draft, setDraft] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const amount = parseAmount(draft);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (amount === null || disabled) return;
    onSave(amount, note);
    setDraft("");
    setNote("");
    setNoteOpen(false);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5 rounded-3xl border bg-card p-[18px]">
      <Label htmlFor="save-amount" className="text-sm font-semibold text-foreground/85">How much are you putting aside?</Label>
      <AmountField id="save-amount" value={draft} onChange={setDraft} currency={currency} onCurrencyClick={onOpenCurrencies} />
      <div className="flex gap-2">
        {QUICK.map((q) => (
          <Button key={q} type="button" variant="outline" onClick={() => setDraft(String((Number(draft) || 0) + q))} className="flex-1 bg-background">
            +{q}
          </Button>
        ))}
      </div>
      {noteOpen ? (
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="save-note" className="text-sm font-semibold text-foreground/85">
            Note <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <p id="save-note-hint" className="-mt-1 text-[13px] text-muted-foreground">Where it's kept or what it's for.</p>
          <Input id="save-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={MAX_NOTE_LENGTH} autoComplete="off" aria-describedby="save-note-hint" className="bg-background" autoFocus />
          <NoteSuggestions suggestions={noteSuggestions} current={note} onPick={setNote} />
        </div>
      ) : (
        <Button type="button" variant="ghost" size="sm" onClick={() => setNoteOpen(true)} className="self-start text-muted-foreground hover:text-foreground">
          <NotebookPenIcon />
          Add a note
        </Button>
      )}
      <Button type="submit" size="lg" disabled={amount === null || disabled}>Save it</Button>
    </form>
  );
}
