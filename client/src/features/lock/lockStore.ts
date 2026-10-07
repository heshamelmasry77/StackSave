// App-lock settings for this device. Fingerprints are per device, so nothing here syncs to the account.
import { readJson, removeKey, writeJson } from "@/lib/storage";
import type { PinRecord } from "./pin";

export type LockConfig = {
  pin: PinRecord;
  /** WebAuthn credential id (base64url) when fingerprint / Face ID unlock is set up. */
  biometricId: string | null;
  /** Wrong PIN entries since the last successful unlock, and when the last one happened. */
  failures: number;
  lastFailureAt: number | null;
};

const KEY = "stacksave.lock.v1";
const OFFER_KEY = "stacksave.lockOfferDismissed";

const isConfig = (v: unknown): v is LockConfig => {
  const c = v as Partial<LockConfig> | null;
  const p = c?.pin as Partial<PinRecord> | undefined;
  return (
    typeof p?.hash === "string" &&
    typeof p.salt === "string" &&
    typeof p.iterations === "number" &&
    typeof p.length === "number" &&
    (c!.biometricId === null || typeof c!.biometricId === "string") &&
    typeof c!.failures === "number"
  );
};

export function loadLockConfig(): LockConfig | null {
  const data = readJson(KEY);
  return isConfig(data) ? data : null;
}

export const saveLockConfig = (config: LockConfig) => writeJson(KEY, config);
export const clearLockConfig = () => removeKey(KEY);

export const isLockOfferDismissed = () => readJson(OFFER_KEY) === true;
export const dismissLockOffer = () => writeJson(OFFER_KEY, true);
