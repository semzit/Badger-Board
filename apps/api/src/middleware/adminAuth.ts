import { NextFunction, Request, Response } from "express";
import { config } from "../config";

/**
 * Require the x-admin-key header to match the configured ADMIN_KEY.
 * Protected routes are expected to be called with the middleware in front.
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const key = req.header("x-admin-key");
  if (!config.adminKey || key !== config.adminKey) {
    res.status(403).json({ error: "forbidden", message: "Invalid admin key" });
    return;
  }
  next();
};
