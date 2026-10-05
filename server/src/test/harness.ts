// Spins up the real app on a random port for API tests, with outgoing email captured in memory.
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "../app";
import { createAuth } from "../auth/auth";
import { db, pool } from "../db/client";
import { env } from "../env";
import type { Mail } from "../mail/mailer";

export async function startTestServer() {
  const sent: Mail[] = [];
  const auth = createAuth({ db, mailer: { send: async (mail) => void sent.push(mail) } });
  const server: Server = createApp({ auth, db }).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  /** Signs a new user in through the magic-link flow and returns their session cookie. */
  async function signIn(email = `user-${crypto.randomUUID()}@example.com`) {
    await fetch(`${baseUrl}/api/auth/sign-in/magic-link`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: env.APP_URL },
      body: JSON.stringify({ email, callbackURL: "/" }),
    });
    const mail = sent.findLast((m) => m.to === email)!;
    const link = new URL(mail.text.match(/https?:\/\/\S+/)![0]);
    const res = await fetch(`${baseUrl}${link.pathname}${link.search}`, { redirect: "manual" });
    return res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  }

  async function close() {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await pool.end();
  }

  return { baseUrl, sent, signIn, close };
}
