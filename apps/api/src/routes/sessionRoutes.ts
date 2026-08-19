import { Router } from "express";
import { createSession } from "../controllers/sessionController";

export const sessionRoutes = Router();

sessionRoutes.post("/", createSession);
