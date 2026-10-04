import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import type { Database } from "../db/client";
import * as schema from "../db/schema";
import { env, features } from "../env";
import type { Mailer } from "../mail/mailer";
import { magicLinkEmail } from "../mail/templates";

const MAGIC_LINK_MINUTES = 15;

/**
 * Passwordless auth: Google sign-in and emailed magic links.
 * Better Auth serves every endpoint under /api/auth/* (see app.ts).
 */
export function createAuth({ db, mailer }: { db: Database; mailer: Mailer }) {
  return betterAuth({
    appName: "SlackSave",
    baseURL: env.APP_URL,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "pg", schema }),

    emailAndPassword: { enabled: false },

    socialProviders: features.google
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
            prompt: "select_account",
          },
        }
      : {},

    // Someone who used a magic link and later picks Google with the same (Google-verified) email
    // ends up on one account instead of two.
    account: { accountLinking: { enabled: true, trustedProviders: ["google"] } },

    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // refresh expiry at most once a day
    },

    rateLimit: {
      customRules: {
        // Each request sends an email: keep it tight.
        "/sign-in/magic-link": { window: 60, max: 3 },
      },
    },

    plugins: [
      magicLink({
        expiresIn: MAGIC_LINK_MINUTES * 60,
        storeToken: "hashed",
        sendMagicLink: async ({ email, url }) => {
          await mailer.send(magicLinkEmail(email, url, MAGIC_LINK_MINUTES));
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
