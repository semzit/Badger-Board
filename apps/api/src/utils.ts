import { BoardSize, BoardSummary } from "./schemas";

export const WHITE = "#ffffff";

export const metaToSummary = (meta: {
  name: string;
  size: BoardSize;
  updates: number;
  updatedAt: number;
}): BoardSummary => ({
  name: meta.name,
  size: meta.size,
  updates: meta.updates,
  updatedAt: meta.updatedAt,
});

/**
 * Hydrate a full board: meta JSON + HGETALL pixels mapped to a 2D grid.
 * Missing cells are filled white.
 */
export const hydrateDrawing = (
  meta: { size: BoardSize },
  pixels: Map<string, string>,
): string[][] => {
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
