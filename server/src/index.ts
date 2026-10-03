import { createServer } from "node:http";
import { createApp } from "./app";
import { createAuth } from "./auth/auth";
import { db, pool } from "./db/client";
import { env, features } from "./env";
import { mountFrontend } from "./frontend";
import { createMailer } from "./mail/mailer";

const auth = createAuth({ db, mailer: createMailer() });
const app = createApp({ auth });
const server = createServer(app);
const closeFrontend = await mountFrontend(app, server);

server.listen(env.PORT, () => {
  console.log(`StackSave listening on ${env.APP_URL} (${env.NODE_ENV}, port ${env.PORT})`);
  console.log(`Sign-in: google=${features.google} magicLink=${features.magicLink}${features.magicLink && !env.SMTP_URL ? " (links logged to console)" : ""}`);
});

let shuttingDown = false;
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down`);
    server.close(() => void Promise.all([closeFrontend(), pool.end()]).then(() => process.exit(0)));
    // Don't hang forever on keep-alive connections.
    setTimeout(() => process.exit(0), 10_000).unref();
  });
}
