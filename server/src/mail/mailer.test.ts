import { afterEach, describe, expect, it, vi } from "vitest";

const mail = { to: "a@example.com", subject: "s", text: "secret-link", html: "<p>secret-link</p>" };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("createMailer", () => {
  it("logs mail to the console in development when SMTP is not configured", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMTP_URL", "");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { createMailer } = await import("./mailer");
    await createMailer().send(mail);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("secret-link"));
  });

  it("refuses to send (and never logs the link) in production without SMTP", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SMTP_URL", "");
    vi.stubEnv("DATABASE_URL", "postgres://u:p@localhost:5432/db");
    vi.stubEnv("BETTER_AUTH_SECRET", "x".repeat(32));
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { createMailer } = await import("./mailer");
    await expect(createMailer().send(mail)).rejects.toThrow(/not configured/);
    expect(log).not.toHaveBeenCalled();
  });
});
