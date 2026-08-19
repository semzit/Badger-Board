import { Router } from "express";
import { CreateSessionRequestSchema } from "../schemas";
import { createSession } from "../controllers/sessionController";
import { validate } from "../middleware/validate";

export const sessionRoutes = Router();

sessionRoutes.post("/", validate(CreateSessionRequestSchema), createSession);
