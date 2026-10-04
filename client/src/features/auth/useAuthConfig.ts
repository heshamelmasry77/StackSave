import { useEffect, useState } from "react";

export type AuthConfig = { google: boolean; magicLink: boolean };

/** Which sign-in options the server has enabled. Null while loading or when offline. */
export function useAuthConfig() {
  const [config, setConfig] = useState<AuthConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { auth: AuthConfig } | null) => {
        if (!cancelled && body) setConfig(body.auth);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}
