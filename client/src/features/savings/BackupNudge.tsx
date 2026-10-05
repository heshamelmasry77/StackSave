import { ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { lastSaved: string; onKeepSafe: () => void; onDismiss: () => void };

/** Shown after saving while signed out: saves only live on this device until there's an account. */
export function BackupNudge({ lastSaved, onKeepSafe, onDismiss }: Props) {
  return (
    <section aria-label="Back up your savings" className="flex animate-fade-up flex-col gap-3 rounded-3xl border border-success-border bg-success-surface p-[18px]">
      <div className="flex items-start gap-3">
        <ShieldCheckIcon className="mt-0.5 size-[22px] shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <strong className="text-base text-lime-50">Nice, {lastSaved} saved.</strong>
          <p className="text-sm leading-relaxed text-lime-200">It's only on this device for now. Create a free account so you never lose it and can see it anywhere.</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onKeepSafe} className="flex-1">Keep it safe</Button>
        <Button variant="outline" onClick={onDismiss} className="border-success-border bg-transparent text-lime-200 hover:bg-lime-900 hover:text-lime-100 dark:border-success-border dark:bg-transparent dark:hover:bg-lime-900">Not now</Button>
      </div>
    </section>
  );
}
