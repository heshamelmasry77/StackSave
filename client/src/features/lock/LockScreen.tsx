import { useEffect, useRef, useState } from "react";
import { FingerprintIcon, LockKeyholeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLock } from "./useAppLock";
import { PinField } from "./PinField";

type Props = {
  lock: AppLock;
  signedIn: boolean;
  /** Forgot PIN: sign in again (signed in) or erase this device's saves (signed out). */
  onReset: () => void;
};

const seconds = (ms: number) => Math.ceil(ms / 1000);

/** Shown instead of the app while it's locked; the savings aren't rendered at all. */
export function LockScreen({ lock, signedIn, onReset }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [waitMs, setWaitMs] = useState(() => lock.waitMs());
  const [checking, setChecking] = useState(false);
  const [forgot, setForgot] = useState(false);
  const triedBiometric = useRef(false);

  // Count down a lockout after too many wrong PINs.
  useEffect(() => {
    if (waitMs <= 0) return;
    const t = setInterval(() => setWaitMs(lock.waitMs()), 1000);
    return () => clearInterval(t);
  }, [waitMs, lock]);

  // Offer the fingerprint straight away (browsers that need a tap first just ignore this).
  useEffect(() => {
    if (lock.hasBiometric && !triedBiometric.current) {
      triedBiometric.current = true;
      void lock.unlockWithBiometric();
    }
  }, [lock]);

  const submit = async (value: string) => {
    if (checking || waitMs > 0) return;
    setChecking(true);
    const result = await lock.unlockWithPin(value);
    setChecking(false);
    if (result.ok) return;
    setPin("");
    setWaitMs(result.waitMs);
    setError(result.waitMs > 0 ? null : "Wrong PIN. Try again.");
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm animate-page-in flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div className="grid size-16 place-items-center rounded-3xl bg-primary text-primary-foreground" aria-hidden="true">
        <LockKeyholeIcon className="size-7" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight">SlackSave is locked</h1>
        <p className="text-sm text-muted-foreground">Unlock to see your savings.</p>
      </div>

      {lock.hasBiometric && (
        <Button size="lg" className="w-full" onClick={() => void lock.unlockWithBiometric()}>
          <FingerprintIcon className="size-5" />
          Unlock with fingerprint or face
        </Button>
      )}

      <form className="w-full text-left" onSubmit={(e) => { e.preventDefault(); void submit(pin); }}>
        <PinField
          id="unlock-pin"
          label={lock.hasBiometric ? "Or enter your PIN" : "Enter your PIN"}
          value={pin}
          onChange={(v) => { setPin(v); setError(null); }}
          completeAt={lock.pinLength}
          onComplete={(v) => void submit(v)}
          error={waitMs > 0 ? `Too many wrong PINs. Try again in ${seconds(waitMs)} s.` : error}
          disabled={waitMs > 0 || checking}
          autoFocus={!lock.hasBiometric}
        />
        {/* Hashing the PIN is deliberately slow (it makes guessing expensive), so say something is happening. */}
        <p aria-live="polite" className="mt-2 h-5 text-center text-sm text-muted-foreground">{checking ? "Checking…" : ""}</p>
      </form>

      {!forgot ? (
        <Button variant="link" onClick={() => setForgot(true)} className="text-muted-foreground">Forgot PIN?</Button>
      ) : (
        <div className="flex w-full flex-col gap-3 rounded-2xl border bg-card p-4 text-left">
          {signedIn ? (
            <>
              <p className="text-sm text-foreground/85">Sign in again to prove it's you. The lock is removed on this device, and your savings come back from your account.</p>
              <Button onClick={onReset}>Sign in again</Button>
            </>
          ) : (
            <>
              <p className="text-sm text-foreground/85">You're not signed in, so the only way to reset is to <strong className="text-foreground">erase the saves on this device</strong> and remove the lock. This can't be undone.</p>
              <Button variant="destructive" onClick={onReset}>Erase saves and remove lock</Button>
            </>
          )}
          <Button variant="ghost" onClick={() => setForgot(false)}>Cancel</Button>
        </div>
      )}
    </main>
  );
}
