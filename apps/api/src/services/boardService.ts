import { Board, BoardSize, BoardSummary, LatLon } from "../schemas";
import * as repo from "../redis/boardRepository";
import { BoardMeta } from "../redis/boardRepository";

export class BoardNotFoundError extends Error {
  constructor(name: string) {
    super(`Board not found: ${name}`);
    this.name = "BoardNotFoundError";
  }
}

export const WHITE = "#ffffff";

const metaToSummary = (meta: BoardMeta): BoardSummary => ({
  name: meta.name,
  size: meta.size,
  updates: meta.updates,
  updatedAt: meta.updatedAt,
});

/**
 * Hydrate a full board: meta JSON + HGETALL pixels mapped to a 2D grid.
 * Missing cells are filled white.
 */
const hydrateDrawing = (meta: BoardMeta, pixels: Map<string, string>): string[][] => {
  const drawing: string[][] = [];
  for (let y = 0; y < meta.size.height; y++) {
    const row: string[] = [];
    for (let x = 0; x < meta.size.width; x++) {
      row.push(pixels.get(`${x}:${y}`) ?? WHITE);
    }
    drawing.push(row);
  }
  return drawing;
};

export const createBoard = async (
  name: string,
  coords: LatLon[],
  size: BoardSize,
): Promise<Board> => {
  const meta: BoardMeta = {
    name,
    coords,
    size,
    updates: 0,
    updatedAt: Date.now(),
  };
  await repo.createBoardMeta(name, coords, size);
  return { ...meta, drawing: hydrateDrawing(meta, new Map()) };
};

export const listBoards = async (): Promise<BoardSummary[]> =>
  (await repo.listBoardMetas()).map(metaToSummary);

export const getBoard = async (name: string): Promise<Board> => {
  const meta = await repo.getBoardMeta(name);
  if (!meta) {
    throw new BoardNotFoundError(name);
  }
  const pixels = await repo.getPixels(name);
  return { ...meta, drawing: hydrateDrawing(meta, pixels) };
};

export const getBoardDrawing = async (name: string): Promise<string[][]> => {
  const meta = await repo.getBoardMeta(name);
  if (!meta) {
    throw new BoardNotFoundError(name);
  }
  const pixels = await repo.getPixels(name);
  return hydrateDrawing(meta, pixels);
};

export const deleteBoard = async (name: string): Promise<boolean> => {
  const exists = await repo.boardExists(name);
  if (!exists) {
    throw new BoardNotFoundError(name);
  }
  await repo.deleteBoard(name);
  return true;
};
