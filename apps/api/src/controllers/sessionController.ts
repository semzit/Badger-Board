import { NextFunction, Request, Response } from "express";
import { CreateSessionRequest, CreateSessionResponseSchema } from "../schemas";
import { createSession as createSessionForCoords } from "../services/sessionService";

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { coords } = req.body as CreateSessionRequest;
    const session = await createSessionForCoords(coords);
    res.status(201).json(CreateSessionResponseSchema.parse(session));
  } catch (err) {
    next(err);
  }
};
