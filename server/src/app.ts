import compression from "compression";
import express from "express";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import type { Auth } from "./auth/auth";
import type { Database } from "./db/client";
import { isProduction } from "./env";
import { apiNotFound, errorHandler } from "./middleware/errors";
import { configRouter } from "./routes/config";
import { healthRouter } from "./routes/health";
import { meRouter } from "./routes/me";
import { savingsRouter } from "./routes/savings";

/** Builds the Express app with every /api route. The frontend is mounted separately (see frontend.ts). */
export function createApp({ auth, db }: { auth: Auth; db: Database }) {
  const app = express();

  // Railway (and most hosts) terminate TLS at a proxy in front of us.
  app.set("trust proxy", 1);
  app.use(
    helmet({
      // Vite's dev server injects inline scripts (React Refresh), so CSP is production-only.
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              // Google profile pictures.
              "img-src": ["'self'", "data:", "https://lh3.googleusercontent.com"],
            },
          }
        : false,
    }),
  );
  app.use(compression());

  // Better Auth parses its own request bodies, so it must be mounted before express.json().
  app.all("/api/auth/{*path}", toNodeHandler(auth));

  const api = express.Router();
  api.use(express.json({ limit: "100kb" }));
  api.use("/health", healthRouter);
  api.use("/config", configRouter);
  api.use("/me", meRouter(auth));
  api.use("/savings", savingsRouter({ auth, db }));
  api.use(apiNotFound);
  api.use(errorHandler);
  app.use("/api", api);

  return app;
}
