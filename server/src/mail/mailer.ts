import nodemailer from "nodemailer";
import { env, isProduction } from "../env";

export type Mail = { to: string; subject: string; text: string; html: string };
export type Mailer = { send: (mail: Mail) => Promise<void> };

/** SMTP when SMTP_URL is set; otherwise prints the email to the console (development only). */
export function createMailer(): Mailer {
  if (!env.SMTP_URL && isProduction) {
    // Never fall back to logging in production: that would put working sign-in links in the logs.
    return {
      async send() {
        throw new Error("Email is not configured (SMTP_URL is unset)");
      },
    };
  }

  if (!env.SMTP_URL) {
    return {
      async send(mail) {
        console.log(`\n[mail] to ${mail.to}: ${mail.subject}\n${mail.text}\n`);
      },
    };
  }

  const transport = nodemailer.createTransport(env.SMTP_URL);
  return {
    async send(mail) {
      await transport.sendMail({ from: env.MAIL_FROM, ...mail });
    },
  };
}
