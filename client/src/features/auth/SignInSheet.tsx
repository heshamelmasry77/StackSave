import { useState, type FormEvent } from "react";
import { Sheet } from "../../components/Sheet";
import { authClient } from "../../lib/authClient";
import type { AuthConfig } from "./useAuthConfig";

type Props = {
  config: AuthConfig;
  initialError: string | null;
  /** Device saves that will move into the account, e.g. ["€1,250", "$300"]. */
  carried: { count: number; totals: string[] } | null;
  onClose: () => void;
};

export function SignInSheet({ config, initialError, carried, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState(initialError);

  const google = async () => {
    setPending("google");
    setError(null);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/" });
    // On success the browser is already navigating to Google.
    if (error) {
      setError(error.message ?? "Couldn't start Google sign-in.");
      setPending(null);
    }
  };

  const sendLink = async (e: FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;
    setPending("email");
    setError(null);
    const { error } = await authClient.signIn.magicLink({ email: address, callbackURL: "/" });
    setPending(null);
    if (error) {
      setError(error.status === 429 ? "Too many requests. Wait a minute and try again." : (error.message ?? "Couldn't send the link."));
      return;
    }
    setSentTo(address);
  };

  if (sentTo) {
    return (
      <Sheet eyebrow="Check your email" title="Your link is on its way" onClose={onClose}>
        <p className="text-sm leading-relaxed text-zinc-300">
          We sent a sign-in link to <strong className="text-zinc-100">{sentTo}</strong>. Open it on this device. It works once and expires in 15 minutes.
        </p>
        <button type="button" onClick={() => setSentTo(null)} className="self-start text-sm font-bold text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline">Use a different email</button>
      </Sheet>
    );
  }

  return (
    <Sheet eyebrow="Free · no password" title={carried ? "Keep your savings safe" : "Sign in to SlackSave"} onClose={onClose}>
      {carried && (
        <div className="flex flex-col gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3.5">
          <span className="text-sm text-zinc-300">
            Your {carried.count === 1 ? "save moves" : `${carried.count} saves move`} into your account:
          </span>
          <div className="flex flex-wrap gap-2">
            {carried.totals.map((t) => (
              <span key={t} className="rounded-full bg-lime-950 px-2.5 py-1 text-[13px] font-bold text-lime-200">{t}</span>
            ))}
          </div>
        </div>
      )}

      {config.google && (
        <button type="button" onClick={() => void google()} disabled={pending !== null} className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-white text-base font-bold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50">
          <GoogleMark />
          {pending === "google" ? "Opening Google…" : "Continue with Google"}
        </button>
      )}

      {config.google && config.magicLink && (
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-500"><span className="h-px flex-1 bg-zinc-800" />or<span className="h-px flex-1 bg-zinc-800" /></div>
      )}

      {config.magicLink && (
        <form onSubmit={(e) => void sendLink(e)} className="flex flex-col gap-2.5">
          <label htmlFor="sign-in-email" className="text-sm font-semibold text-zinc-300">Email</label>
          <input id="sign-in-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-[52px] rounded-2xl border border-zinc-700 bg-zinc-950 px-3.5 text-base outline-none transition placeholder:text-zinc-500 focus:border-lime-300" />
          <button type="submit" disabled={pending !== null || !email.trim()} className="h-[52px] rounded-2xl bg-lime-300 text-base font-extrabold text-zinc-950 transition hover:bg-lime-200 disabled:opacity-40">{pending === "email" ? "Sending…" : "Email me a sign-in link"}</button>
        </form>
      )}

      {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <p className="text-center text-[13px] leading-relaxed text-zinc-400">We'll never ask for a password. Your numbers stay private to you.</p>
    </Sheet>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-4">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
