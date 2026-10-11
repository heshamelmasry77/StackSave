import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SavingEntry } from "@shared/savings";
import { startTestServer } from "../test/harness";

// Needs Postgres with migrations applied (npm run services:up && npm run db:migrate). CI sets RUN_DB_TESTS=1.
describe.skipIf(!process.env.RUN_DB_TESTS)("/api/savings", () => {
  let t: Awaited<ReturnType<typeof startTestServer>>;
  let alice: string;
  let bob: string;

  beforeAll(async () => {
    t = await startTestServer();
    [alice, bob] = await Promise.all([t.signIn(), t.signIn()]);
  });
  afterAll(() => t.close());

  const call = (cookie: string | null, method: string, path = "", body?: unknown) =>
    fetch(`${t.baseUrl}/api/savings${path}`, {
      method,
      headers: { ...(cookie ? { cookie } : {}), ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });

  const listOf = async (cookie: string) => ((await (await call(cookie, "GET")).json()) as { entries: SavingEntry[] }).entries;

  const entry = (over: Record<string, unknown> = {}) => ({
    id: crypto.randomUUID(),
    amount: 50,
    currency: "EUR",
    savedAt: new Date().toISOString(),
    ...over,
  });

  it("requires a session", async () => {
    expect((await call(null, "GET")).status).toBe(401);
    expect((await call(null, "POST", "", entry())).status).toBe(401);
  });

  it("adds, lists newest first, and keeps users apart", async () => {
    const older = entry({ amount: 12.5, currency: "USD", savedAt: new Date(Date.now() - 60_000).toISOString() });
    const newer = entry();
    expect((await call(alice, "POST", "", older)).status).toBe(201);
    const created = await call(alice, "POST", "", newer);
    expect(created.status).toBe(201);
    expect(await created.json()).toEqual({ entry: { ...newer, savedAt: new Date(newer.savedAt).toISOString(), note: null } });

    const list = await listOf(alice);
    expect(list.map((e) => e.id)).toEqual([newer.id, older.id]);
    expect(list[1]).toMatchObject({ amount: 12.5, currency: "USD" });

    expect(await listOf(bob)).toEqual([]);
  });

  it("re-posting the same id is idempotent", async () => {
    const e = entry({ amount: 7 });
    await call(alice, "POST", "", e);
    expect((await call(alice, "POST", "", e)).status).toBe(201);
    const ids = (await listOf(alice)).filter((x) => x.id === e.id);
    expect(ids).toHaveLength(1);
  });

  it("cannot claim or delete another user's entry", async () => {
    const e = entry();
    await call(alice, "POST", "", e);
    expect((await call(bob, "POST", "", e)).status).toBe(409);
    expect((await call(bob, "DELETE", `/${e.id}`)).status).toBe(404);
    const stillThere = (await listOf(alice)).some((x) => x.id === e.id);
    expect(stillThere).toBe(true);
  });

  it("deletes, and undo re-adds the same entry", async () => {
    const e = entry({ amount: 99 });
    await call(alice, "POST", "", e);
    expect((await call(alice, "DELETE", `/${e.id}`)).status).toBe(204);
    expect((await call(alice, "DELETE", `/${e.id}`)).status).toBe(404);
    expect((await call(alice, "POST", "", e)).status).toBe(201);
  });

  it("stores a cleaned note, and lets only the owner edit or clear it", async () => {
    const e = entry({ amount: 2000, currency: "USD", note: "  In my   safe  " });
    const created = (await (await call(alice, "POST", "", e)).json()) as { entry: SavingEntry };
    expect(created.entry.note).toBe("In my safe");

    const edited = await call(alice, "PATCH", `/${e.id}`, { note: "Bank account" });
    expect(edited.status).toBe(200);
    expect(((await edited.json()) as { entry: SavingEntry }).entry).toMatchObject({ id: e.id, amount: 2000, note: "Bank account" });

    expect((await call(bob, "PATCH", `/${e.id}`, { note: "mine now" })).status).toBe(404);
    expect((await call(alice, "PATCH", `/${e.id}`, { note: "x".repeat(201) })).status).toBe(400);
    expect((await call(alice, "PATCH", `/${crypto.randomUUID()}`, { note: "nope" })).status).toBe(404);

    const cleared = (await (await call(alice, "PATCH", `/${e.id}`, { note: "   " })).json()) as { entry: SavingEntry };
    expect(cleared.entry.note).toBeNull();
    expect((await listOf(alice)).find((x) => x.id === e.id)?.note).toBeNull();
  });

  it("edits amount and currency without touching the note, and validates edits", async () => {
    const e = entry({ amount: 200, currency: "EUR", note: "Safe" });
    await call(alice, "POST", "", e);

    const res = await call(alice, "PATCH", `/${e.id}`, { amount: 250.5 });
    expect(res.status).toBe(200);
    expect(((await res.json()) as { entry: SavingEntry }).entry).toMatchObject({ amount: 250.5, currency: "EUR", note: "Safe" });

    const both = (await (await call(alice, "PATCH", `/${e.id}`, { amount: 300, currency: "USD" })).json()) as { entry: SavingEntry };
    expect(both.entry).toMatchObject({ amount: 300, currency: "USD", note: "Safe", savedAt: new Date(e.savedAt).toISOString() });

    for (const bad of [{}, { amount: 0 }, { amount: -1 }, { amount: 2e9 }, { amount: 1.23456 }, { currency: "XYZ" }]) {
      expect((await call(alice, "PATCH", `/${e.id}`, bad)).status).toBe(400);
    }
    expect((await call(bob, "PATCH", `/${e.id}`, { amount: 1 })).status).toBe(404);
    expect((await listOf(alice)).find((x) => x.id === e.id)).toMatchObject({ amount: 300, currency: "USD", note: "Safe" });
  });

  it("imports notes from device saves", async () => {
    const erin = await t.signIn();
    const withNote = entry({ note: "Cash" });
    const { entries } = (await (await call(erin, "POST", "/import", { entries: [withNote, entry()] })).json()) as { entries: SavingEntry[] };
    expect(entries.find((x) => x.id === withNote.id)?.note).toBe("Cash");
  });

  it.each([
    ["note too long", { note: "x".repeat(201) }],
    ["zero amount", { amount: 0 }],
    ["negative amount", { amount: -5 }],
    ["huge amount", { amount: 2e9 }],
    ["too many decimals", { amount: 1.23456 }],
    ["unknown currency", { currency: "XYZ" }],
    ["future date", { savedAt: new Date(Date.now() + 3 * 86_400_000).toISOString() }],
    ["bad id", { id: "not-a-uuid" }],
  ])("rejects %s with 400", async (_label, over) => {
    const res = await call(alice, "POST", "", entry(over));
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty("error");
  });

  it("imports device saves into the account, skipping ones already there", async () => {
    const carol = await t.signIn();
    const a = entry({ amount: 1 });
    const b = entry({ amount: 2, currency: "AED" });
    await call(carol, "POST", "", a);
    const res = await call(carol, "POST", "/import", { entries: [a, b] });
    expect(res.status).toBe(200);
    const { entries } = (await res.json()) as { entries: SavingEntry[] };
    expect(entries.map((x) => x.id).sort()).toEqual([a.id, b.id].sort());
  });

  it("accepts a full 500-entry batch (fits the body size limit) and rejects 501", async () => {
    const dave = await t.signIn();
    const many = Array.from({ length: 500 }, (_, i) => entry({ amount: 1000.25, savedAt: new Date(Date.now() - i * 1000).toISOString() }));
    const ok = await call(dave, "POST", "/import", { entries: many });
    expect(ok.status).toBe(200);
    expect(((await ok.json()) as { entries: SavingEntry[] }).entries).toHaveLength(500);
    expect((await call(dave, "POST", "/import", { entries: [...many, entry()] })).status).toBe(400);
  });

  it("rejects an import with an invalid entry", async () => {
    const res = await call(alice, "POST", "/import", { entries: [entry(), entry({ currency: "nope" })] });
    expect(res.status).toBe(400);
  });
});
