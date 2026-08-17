import RedisMock from "ioredis-mock";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setRedis } from "../src/redis/client";
import { createBoard } from "../src/services/boardService";
import { SessionError, createSession } from "../src/services/sessionService";

const building = [
  { latitude: -1, longitude: -1 },
  { latitude: -1, longitude: 1 },
  { latitude: 1, longitude: 1 },
  { latitude: 1, longitude: -1 },
];

describe("sessionService", () => {
  let redis: RedisMock;

  beforeEach(async () => {
    redis = new RedisMock();
    setRedis(redis);
    await createBoard("tower-a", building, { width: 10, height: 10 });
  });

  afterEach(async () => {
    await redis.flushall();
    redis.disconnect();
  });

  it("creates a session bound to the building containing the coords", async () => {
    const session = await createSession({ latitude: 0.5, longitude: -0.5 });

    expect(session).toEqual({
      sessionId: expect.stringMatching(/^[0-9a-f-]{36}$/),
      building: "tower-a",
    });
    const ttl = await redis.ttl(`session:${session.sessionId}`);
    expect(ttl).toBeGreaterThan(0);
    expect(await redis.get(`session:${session.sessionId}`)).toBe("tower-a");
  });

  it("throws SessionError when coords are outside every board", async () => {
    await expect(createSession({ latitude: 10, longitude: 10 })).rejects.toBeInstanceOf(
      SessionError,
    );
  });
});
