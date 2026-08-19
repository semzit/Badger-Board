import { Router } from "express";
import { sessionRoutes } from "./sessionRoutes";
import { boardRoutes } from "./boardRoutes";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/sessions", sessionRoutes);
router.use("/boards", boardRoutes);
