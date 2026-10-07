import { useCallback, useEffect, useRef, useState } from "react";
import { enrollBiometric, verifyBiometric } from "./biometric";
import { clearLockConfig, loadLockConfig, saveLockConfig, type LockConfig } from "./lockStore";
import { hashPin, verifyPin } from "./pin";
import { lockoutMs, shouldRelock } from "./policy";

export type PinCheck = { ok: true } | { ok: false; waitMs: number };

/**
 * Opt-in app lock for this device. Locked when the app opens and after more than a minute away;
 * unlocked with the PIN or, if enrolled, the device's fingerprint / Face ID.
 */
export function useAppLock() {
  const [config, setConfig] = useState<LockConfig | null>(loadLockConfig);
  // Start locked when a lock exists, so the savings never flash on screen before the lock appears.
  const [locked, setLocked] = useState(() => loadLockConfig() !== null);
  const hiddenAt = useRef<number | null>(null);

  const persist = useCallback((next: LockConfig | null) => {
    if (next) saveLockConfig(next);
    else clearLockConfig();
    setConfig(next);
  }, []);

  useEffect(() => {
    if (!config) return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
      } else if (shouldRelock(hiddenAt.current, Date.now())) {
        setLocked(true);
      }
    };
    // Back/forward cache restores a page without reloading it: treat that like coming back.
    const onPageShow = (e: PageTransitionEvent) => e.persisted && setLocked(true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [config]);

  /** Milliseconds until another PIN attempt is allowed (0 = now). */
  const waitMs = useCallback((c: LockConfig | null = config) => {
    if (!c?.lastFailureAt) return 0;
    return Math.max(0, c.lastFailureAt + lockoutMs(c.failures) - Date.now());
  }, [config]);

  const unlockWithPin = useCallback(
    async (pin: string): Promise<PinCheck> => {
      const current = loadLockConfig();
      if (!current) {
        setLocked(false);
        return { ok: true };
      }
      const wait = waitMs(current);
      if (wait > 0) return { ok: false, waitMs: wait };
      if (await verifyPin(pin, current.pin)) {
        persist({ ...current, failures: 0, lastFailureAt: null });
        setLocked(false);
        return { ok: true };
      }
      const failed = { ...current, failures: current.failures + 1, lastFailureAt: Date.now() };
      persist(failed);
      return { ok: false, waitMs: waitMs(failed) };
    },
    [persist, waitMs],
  );

  const unlockWithBiometric = useCallback(async () => {
    if (!config?.biometricId) return false;
    const ok = await verifyBiometric(config.biometricId);
    if (ok) {
      persist({ ...config, failures: 0, lastFailureAt: null });
      setLocked(false);
    }
    return ok;
  }, [config, persist]);

  /** Turns the lock on with a new PIN. Doesn't lock right away: the person just proved who they are. */
  const enable = useCallback(
    async (pin: string) => persist({ pin: await hashPin(pin), biometricId: null, failures: 0, lastFailureAt: null }),
    [persist],
  );

  const addBiometric = useCallback(async () => {
    if (!config) return false;
    const id = await enrollBiometric();
    if (id) persist({ ...config, biometricId: id });
    return id !== null;
  }, [config, persist]);

  const removeBiometric = useCallback(() => config && persist({ ...config, biometricId: null }), [config, persist]);

  const changePin = useCallback(
    async (pin: string) => config && persist({ ...config, pin: await hashPin(pin), failures: 0, lastFailureAt: null }),
    [config, persist],
  );

  /** Checks the current PIN without changing lock state (for settings changes). */
  const confirmPin = useCallback(async (pin: string) => (config ? verifyPin(pin, config.pin) : false), [config]);

  /** Removes the lock from this device (turned off in settings, or reset after "forgot PIN"). */
  const disable = useCallback(() => {
    persist(null);
    setLocked(false);
  }, [persist]);

  return {
    enabled: config !== null,
    hasBiometric: Boolean(config?.biometricId),
    pinLength: config?.pin.length ?? 4,
    locked: locked && config !== null,
    waitMs,
    unlockWithPin,
    unlockWithBiometric,
    enable,
    addBiometric,
    removeBiometric,
    changePin,
    confirmPin,
    disable,
  };
}

export type AppLock = ReturnType<typeof useAppLock>;
