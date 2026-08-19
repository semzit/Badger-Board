import { CreateBoardRequestSchema, UpdatePixelsRequestSchema } from "../schemas";
import { catchAsync } from "../middleware/catchAsync";
import {
  createBoard as createBoardService,
  deleteBoard as deleteBoardService,
  getBoardDrawing,
  getBoard as getBoardService,
  listBoards as listBoardsService,
} from "../services/boardService";
import { applyPixels } from "../services/pixelService";

export const listBoards = catchAsync(async (_req, res) => {
  res.json(await listBoardsService());
});

export const createBoard = catchAsync(async (req, res) => {
  const { name, coords, size } = CreateBoardRequestSchema.parse(req.body);
  const board = await createBoardService(name, coords, size);
  res.status(201).json(board);
});

export const getBoard = catchAsync(async (req, res) => {
  res.json(await getBoardService(String(req.params.name)));
});

export const deleteBoard = catchAsync(async (req, res) => {
  await deleteBoardService(String(req.params.name));
  res.status(204).end();
});

export const updatePixels = catchAsync(async (req, res) => {
  const { pixels } = UpdatePixelsRequestSchema.parse(req.body);
  await applyPixels(String(req.params.name), pixels);
  res.status(204).end();
});

export const getPixels = catchAsync(async (req, res) => {
  res.json(await getBoardDrawing(String(req.params.name)));
});
