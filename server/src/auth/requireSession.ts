import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { HttpError } from "../middleware/errors";
import type { Auth } from "./auth";

type Session = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;

declare module "express-serve-static-core" {
  interface Locals {
    session?: Session;
  }
}

/** Rejects the request with 401 unless it carries a valid session; exposes it as res.locals.session. */
export const requireSession =
  (auth: Auth): RequestHandler =>
  async (req, res, next) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) throw new HttpError(401, "Not signed in");
    res.locals.session = session;
    next();
  };
