import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  title: string;
  /** Small line above the title. */
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Bottom sheet on phones, centred dialog on larger screens.
 * Portalled to <body> so ancestors with transforms can't break `position: fixed`.
 */
export function Sheet({ title, eyebrow, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-up flex max-h-[90dvh] w-full flex-col gap-4 overflow-y-auto rounded-t-[28px] border-t border-zinc-700 bg-zinc-900 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 outline-none sm:max-w-md sm:rounded-[28px] sm:border sm:pb-6"
      >
        <div className="mx-auto h-1.5 w-10 shrink-0 rounded-full bg-zinc-700 sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            {eyebrow && <span className="text-xs font-bold uppercase tracking-widest text-lime-300">{eyebrow}</span>}
            <h2 id="sheet-title" className="text-xl font-extrabold tracking-tight">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 grid size-11 shrink-0 place-items-center rounded-xl text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
