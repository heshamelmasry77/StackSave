import { useCallback, useEffect, useRef, useState } from "react";
import type { CurrencyCode } from "@shared/currencies";
import { sortNewestFirst, type SavingEntry } from "@shared/savings";
import { deleteSaving, fetchSavings, importSavings, postSaving } from "./api";
import { clearDeviceSavings, loadDeviceSavings, saveDeviceSavings } from "./deviceStore";

/** "device": signed out, kept in this browser. "account": signed in, kept on the server. */
export type SavingsMode = "loading" | "device" | "account";

/**
 * The person's savings, wherever they live.
 * `userId`: undefined while the session is loading, null when signed out.
 * On sign-in, saves made on this device are moved into the account once, then cleared locally.
 */
export function useSavings(userId: string | null | undefined) {
  const [entries, setEntries] = useState<SavingEntry[]>(() => sortNewestFirst(loadDeviceSavings()));
  const [mode, setMode] = useState<SavingsMode>("loading");
  const [error, setError] = useState<string | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) {
      setEntries(sortNewestFirst(loadDeviceSavings()));
      setMode("device");
      return;
    }

    let cancelled = false;
    setMode("loading");
    const local = loadDeviceSavings();
    (local.length ? importSavings(local) : fetchSavings())
      .then((serverEntries) => {
        if (cancelled) return;
        if (local.length) clearDeviceSavings();
        setEntries(sortNewestFirst(serverEntries));
        setMode("account");
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        // Keep showing what we have; device saves stay on the device until the next try.
        setMode("account");
        setError("Couldn't load your savings. Check your connection and try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const apply = useCallback((update: (prev: SavingEntry[]) => SavingEntry[]) => {
    setEntries((prev) => {
      const next = sortNewestFirst(update(prev));
      if (modeRef.current === "device") saveDeviceSavings(next);
      return next;
    });
  }, []);

  const put = useCallback(
    async (entry: SavingEntry) => {
      apply((prev) => [entry, ...prev.filter((e) => e.id !== entry.id)]);
      if (modeRef.current !== "account") return;
      try {
        await postSaving(entry);
        setError(null);
      } catch {
        apply((prev) => prev.filter((e) => e.id !== entry.id));
        setError("That didn't save. Check your connection and try again.");
      }
    },
    [apply],
  );

  const add = useCallback(
    (amount: number, currency: CurrencyCode) => {
      const entry: SavingEntry = { id: crypto.randomUUID(), amount, currency, savedAt: new Date().toISOString() };
      void put(entry);
      return entry;
    },
    [put],
  );

  const remove = useCallback(
    async (entry: SavingEntry) => {
      apply((prev) => prev.filter((e) => e.id !== entry.id));
      if (modeRef.current !== "account") return;
      try {
        await deleteSaving(entry.id);
      } catch {
        apply((prev) => [entry, ...prev]);
        setError("Couldn't remove that. Check your connection and try again.");
      }
    },
    [apply],
  );

  /** Puts back an entry that was just removed (undo). */
  const restore = useCallback((entry: SavingEntry) => void put(entry), [put]);

  return { entries, mode, error, dismissError: () => setError(null), add, remove, restore };
}
