import { z } from "zod";

// Local development reads .env (see .env.example). Railway injects variables directly.
if (process.env.NODE_ENV !== "production") {
  try {
    process.loadEnvFile();
  } catch {
    // No .env file: fall back to the local defaults below.
  }
}

const isProd = process.env.NODE_ENV === "production";
const local = (schema: z.ZodType<string, string>, devDefault: string) => (isProd ? schema : schema.default(devDefault));
const optional = z
  .string()
  .optional()
  .transform((v) => v || undefined);

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: local(z.url(), "postgres://stacksave:stacksave@localhost:54329/stacksave"),

  // Public URL of the app. On Railway it defaults to the generated domain.
  APP_URL: optional,
  RAILWAY_PUBLIC_DOMAIN: optional,

  // Signs session cookies and tokens. Generate with: openssl rand -base64 32
  BETTER_AUTH_SECRET: local(z.string().min(32), "dev-only-secret-change-me-dev-only-secret"),

  GOOGLE_CLIENT_ID: optional,
  GOOGLE_CLIENT_SECRET: optional,

  // e.g. smtps://user:pass@smtp.example.com:465. Unset in development: magic links are printed to the console.
  SMTP_URL: optional,
  MAIL_FROM: z.string().default("SlackSave <login@stacksave.local>"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

const data = parsed.data;
const appUrl =
  data.APP_URL ?? (data.RAILWAY_PUBLIC_DOMAIN ? `https://${data.RAILWAY_PUBLIC_DOMAIN}` : `http://localhost:${data.PORT}`);

export const env = { ...data, APP_URL: appUrl.replace(/\/$/, "") };
export const isProduction = env.NODE_ENV === "production";

export const features = {
  google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  // Magic links need a mail server in production; in development they are logged instead.
  magicLink: Boolean(env.SMTP_URL) || !isProduction,
};
