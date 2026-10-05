import { useEffect, useRef, useState } from "react";
import { authClient } from "../../lib/authClient";

type Props = { user: { name: string; email: string; image?: string | null } };

/** Signed-in header control: avatar with a small menu. */
export function AccountMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = user.name || user.email;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu" aria-label={`Account: ${label}`} className="grid size-11 place-items-center rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-600">
        {user.image ? (
          <img src={user.image} alt="" referrerPolicy="no-referrer" className="size-[30px] rounded-[10px]" />
        ) : (
          <span className="grid size-[30px] place-items-center rounded-[10px] bg-lime-300 text-sm font-extrabold text-zinc-950">{label.charAt(0).toUpperCase()}</span>
        )}
      </button>
      {open && (
        <div role="menu" className="animate-fade-up absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl shadow-black/40">
          {user.name && <p className="truncate px-3 pt-2 text-sm font-semibold text-zinc-100">{user.name}</p>}
          <p className="truncate px-3 pb-2 text-xs text-zinc-400">{user.email}</p>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); void authClient.signOut(); }} className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-zinc-800">Sign out</button>
        </div>
      )}
    </div>
  );
}
