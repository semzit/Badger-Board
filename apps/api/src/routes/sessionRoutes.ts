import { Router } from "express";
import { CreateSessionRequestSchema } from "@badger/shared";
import { createSession } from "../controllers/sessionController";
import { validate } from "../middleware/validate";

export const sessionRoutes = Router();

sessionRoutes.post("/", validate(CreateSessionRequestSchema), createSession);
