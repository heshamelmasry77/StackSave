/** Coming back after more than this long in another app or tab locks the app again. */
export const RELOCK_AFTER_MS = 60_000;

export const shouldRelock = (hiddenAt: number | null, now: number) => hiddenAt !== null && now - hiddenAt > RELOCK_AFTER_MS;

export const FREE_ATTEMPTS = 5;

/** How long to wait after `failures` wrong PINs: nothing for the first 5, then 30 s, 1 min, 5 min, 15 min (cap). */
export function lockoutMs(failures: number) {
  if (failures < FREE_ATTEMPTS) return 0;
  const steps = [30_000, 60_000, 300_000, 900_000];
  return steps[Math.min(failures - FREE_ATTEMPTS, steps.length - 1)];
}
