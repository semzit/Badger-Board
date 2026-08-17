import { WsUpdateMessageSchema } from "@badger/shared";
import { getBoardMeta } from "../redis/boardRepository";
import { incrementUpdates, setPixels } from "../redis/boardRepository";
import { publishBoardUpdate } from "../redis/pubsub";
import { BoardNotFoundError } from "./boardService";

export class PixelOutOfBoundsError extends Error {
  constructor(name: string, x: number, y: number) {
    super(`Pixel (${x}, ${y}) is outside board "${name}"`);
    this.name = "PixelOutOfBoundsError";
  }
}

/**
 * Apply one or more pixel writes: bounds-check, HSET each pixel, bump the
 * updates counter and updatedAt, then publish each update on the board channel.
 */
export const applyPixels = async (
  name: string,
  pixels: { x: number; y: number; color: string }[],
): Promise<void> => {
  const meta = await getBoardMeta(name);
  if (!meta) {
    throw new BoardNotFoundError(name);
  }

  for (const { x, y } of pixels) {
    if (x < 0 || y < 0 || x >= meta.size.width || y >= meta.size.height) {
      throw new PixelOutOfBoundsError(name, x, y);
    }
  }

  await setPixels(name, pixels);
  await incrementUpdates(name, pixels.length);

  for (const { x, y, color } of pixels) {
    const message = WsUpdateMessageSchema.parse({ type: "update", x, y, color });
    await publishBoardUpdate(name, message);
  }
};
