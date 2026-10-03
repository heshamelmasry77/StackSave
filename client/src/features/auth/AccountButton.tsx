import { useCallback, useState } from "react";
import { authClient } from "../../lib/authClient";
import { takeAuthErrorFromUrl } from "./authErrors";
import { SignInDialog } from "./SignInDialog";
import { useAuthConfig } from "./useAuthConfig";

/** Header control: "Sign in" when signed out, the user's avatar and a sign-out menu when signed in. */
export function AccountButton() {
  const { data: session, isPending } = authClient.useSession();
  const config = useAuthConfig();
  // A failed magic link / Google callback lands back here with ?error=..., so open the dialog to explain.
  const [urlError] = useState(takeAuthErrorFromUrl);
  const [dialogOpen, setDialogOpen] = useState(urlError !== null);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  if (isPending) return <div className="h-[46px] w-24 rounded-xl border border-zinc-800 bg-zinc-900/60" aria-hidden="true" />;

  if (!session) {
    // Hide sign-in until the server says which methods exist (and entirely if none are configured).
    if (!config || (!config.google && !config.magicLink)) return null;
    return (
      <>
        <button type="button" onClick={() => setDialogOpen(true)} className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-200 transition hover:border-zinc-700">Sign in</button>
        {dialogOpen && <SignInDialog config={config} initialError={urlError} onClose={closeDialog} />}
      </>
    );
  }

  const { user } = session;
  const label = user.name || user.email;

  return (
    <div className="relative">
      <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-haspopup="menu" className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-2 pr-3 text-sm font-bold text-zinc-200 transition hover:border-zinc-700">
        {user.image ? <img src={user.image} alt="" referrerPolicy="no-referrer" className="size-7 rounded-lg" /> : <span className="grid size-7 place-items-center rounded-lg bg-lime-300 text-xs font-black text-zinc-950">{label.charAt(0).toUpperCase()}</span>}
        <span className="max-w-40 truncate">{label}</span>
      </button>
      {menuOpen && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-60 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl shadow-black/40 animate-fade-up">
          <p className="truncate px-3 py-2 text-xs text-zinc-500">{user.email}</p>
          <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); void authClient.signOut(); }} className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-zinc-800">Sign out</button>
        </div>
      )}
    </div>
  );
}
