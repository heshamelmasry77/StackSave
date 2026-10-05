import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app";
import { createAuth } from "./auth/auth";
import { db, pool } from "./db/client";
import { env, features } from "./env";
import type { Mail } from "./mail/mailer";

const sent: Mail[] = [];
const auth = createAuth({ db, mailer: { send: async (mail) => void sent.push(mail) } });

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createApp({ auth, db }).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await pool.end();
});

describe("API", () => {
  it("GET /api/health reports ok", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: "ok" });
  });

  it("unknown /api routes return JSON 404 instead of the SPA", async () => {
    const res = await fetch(`${baseUrl}/api/nope`);
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    expect(await res.json()).toEqual({ error: "No API route for GET /api/nope" });
  });

  it("malformed JSON bodies return 400, not 500", async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{oops",
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty("error");
  });

  it("GET /api/config exposes which sign-in methods are enabled", async () => {
    const res = await fetch(`${baseUrl}/api/config`);
    expect(await res.json()).toEqual({ auth: features });
    expect(features.magicLink).toBe(true); // always on outside production
  });

  it("Better Auth is mounted under /api/auth", async () => {
    const res = await fetch(`${baseUrl}/api/auth/ok`);
    expect(res.status).toBe(200);
  });

  it("GET /api/me without a session is 401", async () => {
    const res = await fetch(`${baseUrl}/api/me`);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Not signed in" });
  });

  it("password sign-up is disabled", async () => {
    const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: env.APP_URL },
      body: JSON.stringify({ email: "pw@example.com", password: "hunter2hunter2", name: "pw" }),
    });
    expect(res.ok).toBe(false);
  });
});

// Needs Postgres with migrations applied (npm run services:up && npm run db:migrate). CI sets RUN_DB_TESTS=1.
describe.skipIf(!process.env.RUN_DB_TESTS)("magic-link sign-in (database)", () => {
  const email = `test-${Date.now()}@example.com`;

  const requestLink = async () => {
    const res = await fetch(`${baseUrl}/api/auth/sign-in/magic-link`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: env.APP_URL },
      body: JSON.stringify({ email, callbackURL: "/" }),
    });
    expect(res.status).toBe(200);
    const mail = sent.findLast((m) => m.to === email)!;
    expect(mail.subject).toMatch(/sign-in link/);
    const link = new URL(mail.text.match(/https?:\/\/\S+/)![0]);
    // The link points at APP_URL; send it to this test server instead.
    return `${baseUrl}${link.pathname}${link.search}`;
  };

  it("emails a single-use link that signs the user in and creates the account", async () => {
    const link = await requestLink();

    const verify = await fetch(link, { redirect: "manual" });
    expect(verify.status).toBe(302);
    expect(verify.headers.get("location")).not.toMatch(/error=/);
    const cookie = verify.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
    expect(cookie).toMatch(/session_token=/);

    const me = await fetch(`${baseUrl}/api/me`, { headers: { cookie } });
    expect(me.status).toBe(200);
    expect(await me.json()).toMatchObject({ user: { email } });

    const reuse = await fetch(link, { redirect: "manual" });
    expect(reuse.headers.get("location")).toMatch(/error=/);
  });

  it("rejects a tampered token", async () => {
    const link = new URL(await requestLink());
    link.searchParams.set("token", "not-a-real-token");
    const res = await fetch(link, { redirect: "manual" });
    expect(res.headers.get("location")).toMatch(/error=INVALID_TOKEN/);
  });
});
