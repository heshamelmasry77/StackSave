import { useEffect, useState, type FormEvent } from "react";
import { FingerprintIcon, KeyRoundIcon, LockKeyholeOpenIcon } from "lucide-react";
import { toast } from "sonner";
import { AppSheet } from "@/components/AppSheet";
import { Button } from "@/components/ui/button";
import { isBiometricAvailable } from "./biometric";
import { isValidPin } from "./pin";
import { PinField } from "./PinField";
import type { AppLock } from "./useAppLock";

type Props = { lock: AppLock; onClose: () => void };

type Action = "change" | "off" | "addBio" | "removeBio";
type Step =
  | { name: "intro" }
  | { name: "newPin"; then: "enable" | "change" }
  | { name: "confirmPin"; pin: string; then: "enable" | "change" }
  | { name: "offerBio" }
  | { name: "menu" }
  | { name: "verify"; action: Action };

const PIN_HINT = "4 to 6 digits. It stays on this device.";

/** Turn the app lock on, and manage it once it's on. */
export function AppLockSheet({ lock, onClose }: Props) {
  const [step, setStep] = useState<Step>(lock.enabled ? { name: "menu" } : { name: "intro" });
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void isBiometricAvailable().then(setBioAvailable);
  }, []);

  const go = (next: Step) => {
    setStep(next);
    setPin("");
    setError(null);
  };

  const done = (message: string) => {
    toast(message);
    onClose();
  };

  const addBiometric = async () => {
    setBusy(true);
    const ok = await lock.addBiometric();
    setBusy(false);
    if (ok) done("Fingerprint unlock is on");
    else setError("That didn't work. You can try again, or keep using your PIN.");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step.name === "newPin") {
      if (!isValidPin(pin)) return setError("Use 4 to 6 digits.");
      return go({ name: "confirmPin", pin, then: step.then });
    }
    if (step.name === "confirmPin") {
      if (pin !== step.pin) {
        setPin("");
        return setError("The PINs don't match. Try again.");
      }
      setBusy(true);
      if (step.then === "enable") {
        await lock.enable(pin);
        setBusy(false);
        return bioAvailable ? go({ name: "offerBio" }) : done("App lock is on");
      }
      await lock.changePin(pin);
      setBusy(false);
      return done("PIN changed");
    }
    if (step.name === "verify") {
      setBusy(true);
      const ok = await lock.confirmPin(pin);
      setBusy(false);
      if (!ok) {
        setPin("");
        return setError("Wrong PIN.");
      }
      if (step.action === "change") return go({ name: "newPin", then: "change" });
      if (step.action === "off") {
        lock.disable();
        return done("App lock is off");
      }
      if (step.action === "removeBio") {
        lock.removeBiometric();
        return done("Fingerprint unlock removed. Your PIN still works.");
      }
      return void addBiometric();
    }
  };

  const titles: Record<Step["name"], string> = {
    intro: "Lock SlackSave",
    newPin: step.name === "newPin" && step.then === "change" ? "Choose a new PIN" : "Choose a PIN",
    confirmPin: "Enter it again",
    offerBio: "Use your fingerprint too?",
    menu: "App lock",
    verify: "Enter your PIN",
  };

  return (
    <AppSheet eyebrow={lock.enabled ? "On for this device" : "Privacy"} title={titles[step.name]} onClose={onClose}>
      {step.name === "intro" && (
        <>
          <p className="text-sm leading-relaxed text-foreground/85">
            Ask for your fingerprint, face or a PIN every time SlackSave opens, and when you come back after more than a minute. Handy if other people use your phone or computer.
          </p>
          <Button size="lg" onClick={() => go({ name: "newPin", then: "enable" })}>Set a PIN</Button>
          <p className="text-center text-[13px] text-muted-foreground">You'll be able to add your fingerprint or face next, if this device supports it.</p>
        </>
      )}

      {(step.name === "newPin" || step.name === "confirmPin" || step.name === "verify") && (
        <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4">
          <PinField
            id="lock-pin"
            label={step.name === "confirmPin" ? "Confirm PIN" : step.name === "verify" ? "Current PIN" : "New PIN"}
            hint={step.name === "newPin" ? PIN_HINT : undefined}
            value={pin}
            onChange={(v) => { setPin(v); setError(null); }}
            error={error}
            autoFocus
          />
          <Button type="submit" size="lg" disabled={busy || pin.length < 4}>
            {step.name === "newPin" ? "Next" : step.name === "confirmPin" ? "Save PIN" : "Continue"}
          </Button>
        </form>
      )}

      {step.name === "offerBio" && (
        <>
          <p className="text-sm leading-relaxed text-foreground/85">Unlock with your fingerprint, face or device screen lock instead of typing the PIN. Your PIN still works as a backup.</p>
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <Button size="lg" onClick={() => void addBiometric()} disabled={busy}>
            <FingerprintIcon className="size-5" />
            Use fingerprint or face
          </Button>
          <Button variant="ghost" onClick={() => done("App lock is on")}>Just the PIN</Button>
        </>
      )}

      {step.name === "menu" && (
        <div className="flex flex-col gap-2">
          <p className="pb-2 text-sm text-foreground/85">
            Locks when SlackSave opens and after a minute away. Unlock with {lock.hasBiometric ? "your fingerprint or face, or your PIN" : "your PIN"}.
          </p>
          {bioAvailable && (
            <Button variant="outline" className="h-12 justify-start bg-background" onClick={() => go({ name: "verify", action: lock.hasBiometric ? "removeBio" : "addBio" })}>
              <FingerprintIcon />
              {lock.hasBiometric ? "Remove fingerprint unlock" : "Add fingerprint unlock"}
            </Button>
          )}
          <Button variant="outline" className="h-12 justify-start bg-background" onClick={() => go({ name: "verify", action: "change" })}>
            <KeyRoundIcon />
            Change PIN
          </Button>
          <Button variant="outline" className="h-12 justify-start bg-background text-red-300 hover:text-red-200" onClick={() => go({ name: "verify", action: "off" })}>
            <LockKeyholeOpenIcon />
            Turn off app lock
          </Button>
        </div>
      )}
    </AppSheet>
  );
}
