import { useState, type FormEvent } from "react";
import { formatMoney } from "@shared/currencies";
import { MAX_NOTE_LENGTH, type SavingEntry } from "@shared/savings";
import { AppSheet } from "@/components/AppSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { savedAtLabel } from "@/lib/dates";
import { NoteSuggestions } from "./NoteSuggestions";

type Props = {
  entry: SavingEntry;
  suggestions: string[];
  onSave: (note: string | null) => void;
  onClose: () => void;
};

/** Add, change or remove the note on a save that's already in the history. */
export function NoteSheet({ entry, suggestions, onSave, onClose }: Props) {
  const [note, setNote] = useState(entry.note ?? "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave(note);
    onClose();
  };

  return (
    <AppSheet eyebrow={`+${formatMoney(entry.amount, entry.currency)} · ${savedAtLabel(entry.savedAt)}`} title={entry.note ? "Edit note" : "Add a note"} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Label htmlFor="edit-note" className="text-sm font-semibold text-foreground/85">Note</Label>
        <Input id="edit-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={MAX_NOTE_LENGTH} autoComplete="off" placeholder="Where is it? e.g. In my safe" />
        <NoteSuggestions suggestions={suggestions} current={note} onPick={setNote} />
        <Button type="submit" size="lg" className="mt-1">Save note</Button>
        {entry.note && (
          <Button type="button" variant="ghost" onClick={() => { onSave(null); onClose(); }} className="text-muted-foreground">
            Remove note
          </Button>
        )}
      </form>
    </AppSheet>
  );
}
