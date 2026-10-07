// Fingerprint / Face ID / Windows Hello through WebAuthn. The OS verifies the person; we only keep the
// credential id so we can ask for that same credential again. Credentials are tied to this website's domain.

const toBase64Url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64Url = (s: string) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};
const challenge = () => crypto.getRandomValues(new Uint8Array(32));

export async function isBiometricAvailable() {
  try {
    return typeof PublicKeyCredential !== "undefined" && (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
  } catch {
    return false;
  }
}

/** Registers this device's biometric; resolves with the credential id, or null if the person cancelled. */
export async function enrollBiometric(): Promise<string | null> {
  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        rp: { name: "SlackSave" },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: "SlackSave app lock", displayName: "SlackSave app lock" },
        challenge: challenge(),
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged" },
        attestation: "none",
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null;
    return credential ? toBase64Url(credential.rawId) : null;
  } catch {
    return null;
  }
}

/** Asks the OS to verify the person with the enrolled credential. False if cancelled or unavailable. */
export async function verifyBiometric(credentialId: string): Promise<boolean> {
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: challenge(),
        allowCredentials: [{ type: "public-key", id: fromBase64Url(credentialId) }],
        userVerification: "required",
        timeout: 60_000,
      },
    });
    return assertion !== null;
  } catch {
    return false;
  }
}
