import { NextFunction, Request, Response } from "express";
import { CreateBoardRequest, UpdatePixelsRequest } from "@badger/shared";
import {
  createBoard as createBoardService,
  deleteBoard as deleteBoardService,
  getBoardDrawing,
  getBoard as getBoardService,
  listBoards as listBoardsService,
} from "../services/boardService";
import { applyPixels } from "../services/pixelService";

export const listBoards = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json(await listBoardsService());
  } catch (err) {
    next(err);
  }
};

export const createBoard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, coords, size } = req.body as CreateBoardRequest;
    const board = await createBoardService(name, coords, size);
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
};

export const getBoard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json(await getBoardService(String(req.params.name)));
  } catch (err) {
    next(err);
  }
};

export const deleteBoard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteBoardService(String(req.params.name));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const updatePixels = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { pixels } = req.body as UpdatePixelsRequest;
    await applyPixels(String(req.params.name), pixels);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const getPixels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json(await getBoardDrawing(String(req.params.name)));
  } catch (err) {
    next(err);
  }
};
