import { Board, BoardSize, LatLon } from "@badger/shared";
import { getRedis } from "./client";

const metaKey = (name: string): string => `board:${name}:meta`;
const pixelsKey = (name: string): string => `board:${name}:pixels`;

export type BoardMeta = Omit<Board, "drawing">;

export const boardExists = async (name: string): Promise<boolean> =>
  (await getRedis().exists(metaKey(name))) === 1;

export const createBoardMeta = async (
  name: string,
  coords: LatLon[],
  size: BoardSize,
): Promise<void> => {
  const meta: BoardMeta = {
    name,
    coords,
    size,
    updates: 0,
    updatedAt: Date.now(),
  };
  await getRedis().set(metaKey(name), JSON.stringify(meta));
};

export const getBoardMeta = async (name: string): Promise<BoardMeta | null> => {
  const raw = await getRedis().get(metaKey(name));
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as BoardMeta;
};

export const updateBoardMeta = async (
  name: string,
  patch: Partial<Pick<BoardMeta, "updates" | "updatedAt">>,
): Promise<void> => {
  const meta = await getBoardMeta(name);
  if (!meta) {
    throw new Error(`Board not found: ${name}`);
  }
  await getRedis().set(
    metaKey(name),
    JSON.stringify({ ...meta, ...patch, updatedAt: patch.updatedAt ?? Date.now() }),
  );
};

export const deleteBoard = async (name: string): Promise<void> => {
  await getRedis().del(metaKey(name), pixelsKey(name));
};

export const listBoardMetas = async (): Promise<BoardMeta[]> => {
  const client = getRedis();
  const keys = await client.keys("board:*:meta");
  if (keys.length === 0) {
    return [];
  }
  const raw = await client.mget(keys);
  return raw
    .filter((r): r is string => r !== null)
    .map((r) => JSON.parse(r) as BoardMeta)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const pixelKey = (x: number, y: number): string => `${x}:${y}`;

export const setPixels = async (
  name: string,
  pixels: { x: number; y: number; color: string }[],
): Promise<void> => {
  const entries: Record<string, string> = {};
  for (const { x, y, color } of pixels) {
    entries[pixelKey(x, y)] = color;
  }
  await getRedis().hset(pixelsKey(name), entries);
};

export const getPixels = async (name: string): Promise<Map<string, string>> => {
  const raw = await getRedis().hgetall(pixelsKey(name));
  return new Map(Object.entries(raw));
};

/**
 * Atomically bump the updates counter and updatedAt timestamp in a board's
 * meta JSON (WATCH + MULTI, retried on contention).
 * Returns the new counter value, or null if the board is missing.
 */
export const incrementUpdates = async (name: string, by: number): Promise<number | null> => {
  const client = getRedis();
  const key = metaKey(name);
  for (let attempt = 0; attempt < 5; attempt++) {
    await client.watch(key);
    const raw = await client.get(key);
    if (!raw) {
      await client.unwatch();
      return null;
    }
    const meta = JSON.parse(raw) as BoardMeta;
    meta.updates += by;
    meta.updatedAt = Date.now();
    const results = await client.multi().set(key, JSON.stringify(meta)).exec();
    if (results) {
      return meta.updates;
    }
  }
  throw new Error(`Failed to increment updates for board: ${name}`);
};
