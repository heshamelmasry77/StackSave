// Error codes Better Auth appends to the callback URL (?error=...) when sign-in fails.
const messages: Record<string, string> = {
  INVALID_TOKEN: "That sign-in link is invalid or was already used. Request a new one.",
  EXPIRED_TOKEN: "That sign-in link has expired. Request a new one.",
  ATTEMPTS_EXCEEDED: "That sign-in link was already used. Request a new one.",
  access_denied: "Google sign-in was cancelled.",
};

export const describeAuthError = (code: string) => messages[code] ?? "Sign-in failed. Please try again.";

/** Reads and removes ?error= from the URL so a refresh doesn't show it again. */
export function takeAuthErrorFromUrl(): string | null {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("error");
  if (!code) return null;
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  return describeAuthError(code);
}
