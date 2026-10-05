import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { isCurrencyCode } from "@shared/currencies";
import { cleanNote, MAX_AMOUNT, MAX_NOTE_LENGTH, type SavingEntry } from "@shared/savings";
import type { Auth } from "../auth/auth";
import { requireSession } from "../auth/requireSession";
import type { Database } from "../db/client";
import { saving } from "../db/schema";
import { HttpError } from "../middleware/errors";

const DAY_MS = 24 * 60 * 60 * 1000;

const noteSchema = z
  .string()
  .nullish()
  .transform(cleanNote)
  .refine((n) => n === null || n.length <= MAX_NOTE_LENGTH, `Note must be ${MAX_NOTE_LENGTH} characters or fewer`);

const entrySchema = z.object({
  id: z.uuid(),
  amount: z
    .number()
    .positive()
    .max(MAX_AMOUNT)
    .refine((n) => Math.round(n * 10_000) === n * 10_000, "At most 4 decimal places"),
  currency: z.string().refine(isCurrencyCode, "Unsupported currency"),
  savedAt: z.iso
    .datetime({ offset: true })
    // Clocks drift, but a save can't be from the far future or before the app existed.
    .refine((s) => {
      const t = Date.parse(s);
      return t >= Date.UTC(2020, 0, 1) && t <= Date.now() + DAY_MS;
    }, "Date out of range"),
  note: noteSchema,
});

const updateSchema = z.object({ note: noteSchema });

// The client sends batches of 500; ~110 bytes each stays well under the 100 kB body limit.
const importSchema = z.object({ entries: z.array(entrySchema).max(500) });

const parse = <T>(schema: z.ZodType<T>, body: unknown): T => {
  const result = schema.safeParse(body);
  if (!result.success) throw new HttpError(400, z.prettifyError(result.error));
  return result.data;
};

const toEntry = (row: typeof saving.$inferSelect): SavingEntry => ({
  id: row.id,
  amount: row.amount,
  currency: row.currency as SavingEntry["currency"],
  savedAt: row.savedAt.toISOString(),
  note: row.note,
});

/** The signed-in user's savings. Every query is scoped to the session's user id. */
export function savingsRouter({ auth, db }: { auth: Auth; db: Database }) {
  const router = Router();
  router.use(requireSession(auth));

  const userId = (res: { locals: { session?: { user: { id: string } } } }) => res.locals.session!.user.id;

  const list = (uid: string) =>
    db.select().from(saving).where(eq(saving.userId, uid)).orderBy(desc(saving.savedAt)).limit(5000);

  router.get("/", async (_req, res) => {
    res.json({ entries: (await list(userId(res))).map(toEntry) });
  });

  router.post("/", async (req, res) => {
    const entry = parse(entrySchema, req.body);
    const uid = userId(res);
    // Re-sending the same id (a retry, or an undo after delete) is a no-op rather than a duplicate.
    await db
      .insert(saving)
      .values({ ...entry, userId: uid, savedAt: new Date(entry.savedAt) })
      .onConflictDoNothing({ target: saving.id });
    const [row] = await db
      .select()
      .from(saving)
      .where(and(eq(saving.id, entry.id), eq(saving.userId, uid)));
    if (!row) throw new HttpError(409, "That id is already in use");
    res.status(201).json({ entry: toEntry(row) });
  });

  // Moves saves made before sign-in (kept on the device) into the account.
  router.post("/import", async (req, res) => {
    const { entries } = parse(importSchema, req.body);
    const uid = userId(res);
    if (entries.length) {
      await db
        .insert(saving)
        .values(entries.map((e) => ({ ...e, userId: uid, savedAt: new Date(e.savedAt) })))
        .onConflictDoNothing({ target: saving.id });
    }
    res.json({ entries: (await list(uid)).map(toEntry) });
  });

  router.patch("/:id", async (req, res) => {
    const { note } = parse(updateSchema, req.body);
    const [row] = await db
      .update(saving)
      .set({ note })
      .where(and(eq(saving.id, req.params.id), eq(saving.userId, userId(res))))
      .returning();
    if (!row) throw new HttpError(404, "Saving not found");
    res.json({ entry: toEntry(row) });
  });

  router.delete("/:id", async (req, res) => {
    const deleted = await db
      .delete(saving)
      .where(and(eq(saving.id, req.params.id), eq(saving.userId, userId(res))))
      .returning({ id: saving.id });
    if (!deleted.length) throw new HttpError(404, "Saving not found");
    res.sendStatus(204);
  });

  return router;
}
