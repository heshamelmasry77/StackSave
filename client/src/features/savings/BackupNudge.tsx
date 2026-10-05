type Props = { lastSaved: string; onKeepSafe: () => void; onDismiss: () => void };

/** Shown after saving while signed out: saves only live on this device until there's an account. */
export function BackupNudge({ lastSaved, onKeepSafe, onDismiss }: Props) {
  return (
    <section aria-label="Back up your savings" className="animate-fade-up flex flex-col gap-3 rounded-3xl border border-lime-800 bg-lime-950 p-[18px]">
      <div className="flex items-start gap-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-lime-300" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        <div className="flex flex-col gap-1">
          <strong className="text-base text-lime-50">Nice, {lastSaved} saved.</strong>
          <p className="text-sm leading-relaxed text-lime-200">It's only on this device for now. Create a free account so you never lose it and can see it anywhere.</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onKeepSafe} className="h-11 flex-1 rounded-xl bg-lime-300 text-[15px] font-bold text-zinc-950 transition hover:bg-lime-200">Keep it safe</button>
        <button type="button" onClick={onDismiss} className="h-11 rounded-xl border border-lime-800 px-4 text-[15px] font-semibold text-lime-200 transition hover:bg-lime-900">Not now</button>
      </div>
    </section>
  );
}
