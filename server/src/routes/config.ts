import { Router } from "express";
import { features } from "../env";

/** Public, non-secret settings the client needs, e.g. which sign-in options to show. */
export const configRouter = Router();

configRouter.get("/", (_req, res) => {
  res.json({ auth: features });
});
