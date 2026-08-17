import { NextFunction, Request, Response } from "express";
import { z } from "zod";

/**
 * Validate a request body against a zod schema. On failure responds 400 and
 * skips the handler; on success stores the parsed value on req.body.
 */
export const validate = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "validation_error",
        message: result.error.issues.map((i) => i.message).join("; "),
      });
      return;
    }
    req.body = result.data;
    next();
  };
};
