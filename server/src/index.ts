import { createServer } from "node:http";
import { createApp } from "./app";
import { env } from "./env";
import { mountFrontend } from "./frontend";

const app = createApp();
const server = createServer(app);
const closeFrontend = await mountFrontend(app, server);

server.listen(env.PORT, () => {
  console.log(`StackSave listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

let shuttingDown = false;
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down`);
    server.close(() => void closeFrontend().then(() => process.exit(0)));
    // Don't hang forever on keep-alive connections.
    setTimeout(() => process.exit(0), 10_000).unref();
  });
}
