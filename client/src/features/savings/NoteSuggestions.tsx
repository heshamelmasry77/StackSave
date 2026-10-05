import { Button } from "@/components/ui/button";

type Props = { suggestions: string[]; current: string; onPick: (note: string) => void };

/** Quick picks for a note: the person's recent notes, or defaults like "Cash". */
export function NoteSuggestions({ suggestions, current, onPick }: Props) {
  if (!suggestions.length) return null;
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested notes">
      {suggestions.map((s) => (
        <Button key={s} type="button" variant="outline" size="sm" aria-pressed={current === s} onClick={() => onPick(s)} className="rounded-full bg-background aria-pressed:border-primary aria-pressed:text-primary">
          {s}
        </Button>
      ))}
    </div>
  );
}
