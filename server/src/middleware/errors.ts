import type { ErrorRequestHandler, RequestHandler } from "express";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const apiNotFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `No API route for ${req.method} ${req.originalUrl}`));
};

// Express and body-parser errors carry their own status (e.g. 400 for malformed JSON).
const statusOf = (err: unknown) => {
  const status = (err as { status?: unknown }).status;
  return typeof status === "number" && status >= 400 && status < 600 ? status : 500;
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = statusOf(err);
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status >= 500 ? "Internal server error" : (err as Error).message,
  });
};
