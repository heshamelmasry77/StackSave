import { useEffect } from "react";

type Props = { message: string; onUndo: () => void; onDone: () => void };

const DURATION_MS = 6000;

export function UndoToast({ message, onUndo, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, DURATION_MS);
    return () => clearTimeout(t);
  }, [message, onDone]);

  return (
    <div role="status" className="animate-fade-up fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-800 py-2 pl-4 pr-2 shadow-2xl shadow-black/50">
      <span className="flex-1 text-sm text-zinc-100">{message}</span>
      <button type="button" onClick={onUndo} className="h-10 rounded-xl px-3 text-sm font-bold text-lime-300 transition hover:bg-zinc-700">Undo</button>
    </div>
  );
}
