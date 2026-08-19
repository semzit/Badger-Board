import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { BoardNotFoundError } from "../services/boardService";
import { PixelOutOfBoundsError } from "../services/pixelService";
import { SessionError } from "../services/sessionService";

export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export const notFound = (message: string): AppError => new AppError(404, message);

const isAppError = (err: unknown): err is AppError => err instanceof AppError;

const mapKnownErrors = (err: unknown): AppError | null => {
  if (err instanceof ZodError) {
    return new AppError(400, err.issues.map((i) => i.message).join("; "));
  }
  if (err instanceof SessionError || err instanceof BoardNotFoundError) {
    return new AppError(404, err.message);
  }
  if (err instanceof PixelOutOfBoundsError) {
    return new AppError(400, err.message);
  }
  return null;
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const known = mapKnownErrors(err);
  if (known) {
    res.status(known.status).json({
      error: known.status === 400 ? "validation_error" : "not_found",
      message: known.message,
    });
    return;
  }

  if (isAppError(err)) {
    res.status(err.status).json({ error: "error", message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "internal", message: "Internal Server Error" });
};
