import type { SavingEntry } from "@shared/savings";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/savings${path}`, {
    ...init,
    headers: init?.body ? { "content-type": "application/json" } : undefined,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const fetchSavings = () => request<{ entries: SavingEntry[] }>("").then((r) => r.entries);

export const postSaving = (entry: SavingEntry) =>
  request<{ entry: SavingEntry }>("", { method: "POST", body: JSON.stringify(entry) }).then((r) => r.entry);

const IMPORT_BATCH = 500;

/** Moves device saves into the account, in batches to stay under the request size limit. Returns the full list. */
export async function importSavings(entries: SavingEntry[]) {
  let result: SavingEntry[] = [];
  for (let i = 0; i < entries.length; i += IMPORT_BATCH) {
    const batch = entries.slice(i, i + IMPORT_BATCH);
    result = (await request<{ entries: SavingEntry[] }>("/import", { method: "POST", body: JSON.stringify({ entries: batch }) })).entries;
  }
  return result;
}

export type SavingChanges = Partial<Pick<SavingEntry, "amount" | "currency" | "note">>;

/** Changes any of amount, currency and note; fields left out stay as they are. */
export const patchSaving = (id: string, changes: SavingChanges) =>
  request<{ entry: SavingEntry }>(`/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(changes) }).then((r) => r.entry);

export const deleteSaving = (id: string) => request<void>(`/${encodeURIComponent(id)}`, { method: "DELETE" });
