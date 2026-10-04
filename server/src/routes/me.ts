import { Router } from "express";
import { requireSession } from "../auth/requireSession";
import type { Auth } from "../auth/auth";

export function meRouter(auth: Auth) {
  const router = Router();

  router.get("/", requireSession(auth), (_req, res) => {
    const { id, name, email, image } = res.locals.session!.user;
    res.json({ user: { id, name, email, image } });
  });

  return router;
}
