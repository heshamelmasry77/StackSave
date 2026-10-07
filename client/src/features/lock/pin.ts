// The PIN never leaves the device and is never stored: only a salted PBKDF2-SHA256 hash is kept.

export type PinRecord = { hash: string; salt: string; iterations: number; length: number };

const ITERATIONS = 310_000; // OWASP's PBKDF2-HMAC-SHA256 recommendation.

export const isValidPin = (pin: string) => /^\d{4,6}$/.test(pin);

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derive(pin: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return new Uint8Array(bits);
}

export async function hashPin(pin: string, iterations = ITERATIONS): Promise<PinRecord> {
  if (!isValidPin(pin)) throw new Error("PIN must be 4 to 6 digits");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { hash: toBase64(await derive(pin, salt, iterations)), salt: toBase64(salt), iterations, length: pin.length };
}

export async function verifyPin(pin: string, record: PinRecord): Promise<boolean> {
  if (!isValidPin(pin)) return false;
  const actual = await derive(pin, fromBase64(record.salt), record.iterations);
  const expected = fromBase64(record.hash);
  // Compare every byte so timing doesn't reveal how much matched.
  let diff = actual.length ^ expected.length;
  for (let i = 0; i < Math.max(actual.length, expected.length); i++) diff |= (actual[i] ?? 0) ^ (expected[i] ?? 0);
  return diff === 0;
}
