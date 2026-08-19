import { NextFunction, Request, Response } from "express";
import { CreateSessionRequestSchema, CreateSessionResponseSchema } from "../schemas";
import { createSession as createSessionForCoords } from "../services/sessionService";

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { coords } = CreateSessionRequestSchema.parse(req.body);
    const session = await createSessionForCoords(coords);
    res.status(201).json(CreateSessionResponseSchema.parse(session));
  } catch (err) {
    next(err);
  }
};
