import RedisMock from "ioredis-mock";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setRedis } from "../src/redis/client";
import {
  BoardNotFoundError,
  createBoard,
  deleteBoard,
  getBoard,
  getBoardDrawing,
  listBoards,
} from "../src/services/boardService";

const coords = [
  { latitude: -1, longitude: -1 },
  { latitude: -1, longitude: 1 },
  { latitude: 1, longitude: 1 },
  { latitude: 1, longitude: -1 },
];

describe("boardService", () => {
  let redis: RedisMock;

  beforeEach(() => {
    redis = new RedisMock();
    setRedis(redis);
  });

  afterEach(async () => {
    await redis.flushall();
    redis.disconnect();
  });

  it("creates a board with an all-white drawing", async () => {
    const board = await createBoard("tower-a", coords, { width: 2, height: 2 });

    expect(board.name).toBe("tower-a");
    expect(board.size).toEqual({ width: 2, height: 2 });
    expect(board.updates).toBe(0);
    expect(board.drawing).toEqual([
      ["#ffffff", "#ffffff"],
      ["#ffffff", "#ffffff"],
    ]);
  });

  it("lists board summaries", async () => {
    await createBoard("tower-a", coords, { width: 2, height: 2 });
    await createBoard("tower-b", coords, { width: 4, height: 4 });

    const summaries = await listBoards();
    expect(summaries.map((s) => s.name)).toEqual(["tower-a", "tower-b"]);
    expect(summaries[0]).not.toHaveProperty("drawing");
    expect(summaries[0]).not.toHaveProperty("coords");
  });

  it("gets a board with drawing hydrated from the pixels hash", async () => {
    await createBoard("tower-a", coords, { width: 2, height: 1 });
    await redis.hset("board:tower-a:pixels", "1:0", "#ff0000");

    const board = await getBoard("tower-a");
    expect(board.drawing).toEqual([["#ffffff", "#ff0000"]]);
    expect(await getBoardDrawing("tower-a")).toEqual([["#ffffff", "#ff0000"]]);
  });

  it("throws BoardNotFoundError for a missing board", async () => {
    await expect(getBoard("missing")).rejects.toBeInstanceOf(BoardNotFoundError);
    await expect(getBoardDrawing("missing")).rejects.toBeInstanceOf(BoardNotFoundError);
    await expect(deleteBoard("missing")).rejects.toBeInstanceOf(BoardNotFoundError);
  });

  it("deletes a board and its pixels", async () => {
    await createBoard("tower-a", coords, { width: 2, height: 2 });
    await redis.hset("board:tower-a:pixels", "0:0", "#00ff00");

    await deleteBoard("tower-a");

    expect(await redis.exists("board:tower-a:meta")).toBe(0);
    expect(await redis.exists("board:tower-a:pixels")).toBe(0);
    expect(await listBoards()).toEqual([]);
  });
});
