import { describe, expect, it } from "vitest";
import { hashPin, isValidPin, verifyPin } from "./pin";
import { FREE_ATTEMPTS, lockoutMs, RELOCK_AFTER_MS, shouldRelock } from "./policy";

describe("PIN", () => {
  it.each(["1234", "12345", "123456"])("accepts %j", (p) => expect(isValidPin(p)).toBe(true));
  it.each(["", "123", "1234567", "12a4", " 1234"])("rejects %j", (p) => expect(isValidPin(p)).toBe(false));

  it("hashes with a random salt and verifies only the right PIN", async () => {
    const a = await hashPin("2468", 1000);
    const b = await hashPin("2468", 1000);
    expect(a.hash).not.toBe(b.hash); // different salts
    expect(a).toMatchObject({ iterations: 1000, length: 4 });
    expect(JSON.stringify(a)).not.toContain("2468");
    expect(await verifyPin("2468", a)).toBe(true);
    expect(await verifyPin("2469", a)).toBe(false);
    expect(await verifyPin("246", a)).toBe(false);
  });

  it("refuses to hash an invalid PIN", async () => {
    await expect(hashPin("12")).rejects.toThrow();
  });
});

describe("re-lock timing", () => {
  it("doesn't re-lock after a quick switch, does after more than a minute", () => {
    expect(shouldRelock(null, 1e9)).toBe(false);
    expect(shouldRelock(1000, 1000 + RELOCK_AFTER_MS)).toBe(false);
    expect(shouldRelock(1000, 1000 + RELOCK_AFTER_MS + 1)).toBe(true);
  });
});

describe("wrong-PIN throttling", () => {
  it("allows 5 tries, then waits longer each time, capped", () => {
    expect(lockoutMs(FREE_ATTEMPTS - 1)).toBe(0);
    expect(lockoutMs(5)).toBe(30_000);
    expect(lockoutMs(6)).toBe(60_000);
    expect(lockoutMs(7)).toBe(300_000);
    expect(lockoutMs(8)).toBe(900_000);
    expect(lockoutMs(50)).toBe(900_000);
  });
});
