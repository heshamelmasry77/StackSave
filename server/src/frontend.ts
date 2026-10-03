import path from "node:path";
import type { Server } from "node:http";
import express, { type Express } from "express";
import { isProduction } from "./env";

/**
 * Serves the React app from the same origin as the API.
 * - development: Vite runs inside Express as middleware (HMR over the same HTTP server, one port).
 * - production: the built files in dist/client are served statically with an SPA fallback.
 * Returns a cleanup function for graceful shutdown.
 */
export async function mountFrontend(app: Express, server: Server): Promise<() => Promise<void>> {
  if (!isProduction) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: "spa",
    });
    app.use(vite.middlewares);
    return () => vite.close();
  }

  // The bundled server lives at dist/server/index.js, next to dist/client.
  const clientDir = path.resolve(import.meta.dirname, "../client");

  app.use(
    express.static(clientDir, {
      index: false,
      setHeaders(res, filePath) {
        // Vite fingerprints everything under /assets, so it can be cached forever.
        // Everything else (sw.js, manifest, icons) must revalidate so updates reach installed PWAs.
        const immutable = filePath.startsWith(path.join(clientDir, "assets") + path.sep);
        res.setHeader("Cache-Control", immutable ? "public, max-age=31536000, immutable" : "no-cache");
      },
    }),
  );

  app.get("/{*path}", (req, res) => {
    // A missing file (e.g. an old /assets chunk) must 404, not get index.html served as JavaScript.
    if (path.extname(req.path)) {
      res.sendStatus(404);
      return;
    }
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(clientDir, "index.html"));
  });

  return async () => {};
}
