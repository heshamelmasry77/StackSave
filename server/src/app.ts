import compression from "compression";
import express from "express";
import helmet from "helmet";
import { isProduction } from "./env";
import { apiNotFound, errorHandler } from "./middleware/errors";
import { healthRouter } from "./routes/health";

/** Builds the Express app with every /api route. The frontend is mounted separately (see frontend.ts). */
export function createApp() {
  const app = express();

  // Railway (and most hosts) terminate TLS at a proxy in front of us.
  app.set("trust proxy", 1);
  app.use(
    helmet({
      // Vite's dev server injects inline scripts (React Refresh), so CSP is production-only.
      contentSecurityPolicy: isProduction ? undefined : false,
    }),
  );
  app.use(compression());

  const api = express.Router();
  api.use(express.json({ limit: "100kb" }));
  api.use("/health", healthRouter);
  api.use(apiNotFound);
  api.use(errorHandler);
  app.use("/api", api);

  return app;
}
