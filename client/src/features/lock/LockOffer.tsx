import { LockKeyholeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { onSetUp: () => void; onDismiss: () => void };

/** One-time, opt-in suggestion to lock the app once the person has a few saves. */
export function LockOffer({ onSetUp, onDismiss }: Props) {
  return (
    <section aria-label="Lock SlackSave" className="flex animate-fade-up flex-col gap-3 rounded-3xl border bg-card p-[18px]">
      <div className="flex items-start gap-3">
        <LockKeyholeIcon className="mt-0.5 size-[22px] shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <strong className="text-base">Keep your savings private</strong>
          <p className="text-sm leading-relaxed text-foreground/80">Lock SlackSave with your fingerprint, face or a PIN, so only you can open it.</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onSetUp} className="flex-1">Set up lock</Button>
        <Button variant="outline" onClick={onDismiss} className="bg-transparent">No thanks</Button>
      </div>
    </section>
  );
}
