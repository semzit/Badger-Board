import { NextFunction, Request, Response } from "express";
import { config } from "../config";

/**
 * Require the x-admin-password header to match the configured ADMIN_PASSWORD.
 * Protected routes are expected to be called with the middleware in front.
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const password = req.header("x-admin-password");
  if (!config.adminPassword || password !== config.adminPassword) {
    res.status(403).json({ error: "forbidden", message: "Invalid admin password" });
    return;
  }
  next();
};
