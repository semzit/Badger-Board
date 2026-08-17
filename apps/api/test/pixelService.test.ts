import RedisMock from "ioredis-mock";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getRedis, setRedis } from "../src/redis/client";
import { createBoard } from "../src/services/boardService";
import { PixelOutOfBoundsError, applyPixels } from "../src/services/pixelService";

describe("pixelService", () => {
  let redis: RedisMock;

  beforeEach(async () => {
    redis = new RedisMock();
    setRedis(redis);
    await createBoard(
      "tower-a",
      [
        { latitude: -1, longitude: -1 },
        { latitude: -1, longitude: 1 },
        { latitude: 1, longitude: 1 },
        { latitude: 1, longitude: -1 },
      ],
      { width: 3, height: 3 },
    );
  });

  afterEach(async () => {
    await redis.flushall();
    redis.disconnect();
  });

  it("applies a pixel and bumps the updates counter and updatedAt", async () => {
    await applyPixels("tower-a", [{ x: 1, y: 2, color: "#ff0000" }]);

    expect(await redis.hget("board:tower-a:pixels", "1:2")).toBe("#ff0000");

    const meta = JSON.parse((await getRedis().get("board:tower-a:meta")) ?? "{}");
    expect(meta.updates).toBe(1);
    expect(meta.updatedAt).toBeGreaterThan(0);
  });

  it("applies many pixels in one call", async () => {
    await applyPixels("tower-a", [
      { x: 0, y: 0, color: "#ff0000" },
      { x: 2, y: 2, color: "#00ff00" },
    ]);

    expect(await redis.hget("board:tower-a:pixels", "0:0")).toBe("#ff0000");
    expect(await redis.hget("board:tower-a:pixels", "2:2")).toBe("#00ff00");
    const meta = JSON.parse((await getRedis().get("board:tower-a:meta")) ?? "{}");
    expect(meta.updates).toBe(2);
  });

  it("rejects pixels outside the board bounds", async () => {
    await expect(applyPixels("tower-a", [{ x: 3, y: 0, color: "#ff0000" }])).rejects.toBeInstanceOf(
      PixelOutOfBoundsError,
    );
    await expect(
      applyPixels("tower-a", [{ x: 0, y: -1, color: "#ff0000" }]),
    ).rejects.toBeInstanceOf(PixelOutOfBoundsError);

    expect(await redis.hgetall("board:tower-a:pixels")).toEqual({});
  });

  it("rejects pixels for a missing board", async () => {
    await expect(applyPixels("missing", [{ x: 0, y: 0, color: "#ff0000" }])).rejects.toThrow(
      "Board not found",
    );
  });
});
