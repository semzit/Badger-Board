import { NextFunction, Request, RequestHandler, Response } from "express";

export const catchAsync =
  (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
  ): RequestHandler =>
  (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
