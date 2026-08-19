import { Redis } from "ioredis";
import RedisMock from "ioredis-mock";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { setRedis } from "../src/redis/client";

const ADMIN_PASSWORD = "test-admin-key";

const coords = [
  { latitude: -1, longitude: -1 },
  { latitude: -1, longitude: 1 },
  { latitude: 1, longitude: 1 },
  { latitude: 1, longitude: -1 },
];

const createBoard = (name = "tower-a") =>
  request(app)
    .post("/api/boards")
    .set("x-admin-password", ADMIN_PASSWORD)
    .send({ name, coords, size: { width: 2, height: 2 } });

describe("API", () => {
  let redis: Redis;

  beforeEach(() => {
    redis = new RedisMock();
    setRedis(redis);
  });

  afterEach(async () => {
    await redis.flushall();
    redis.disconnect();
  });

  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  describe("sessions", () => {
    it("POST /api/sessions returns 201 with sessionId and building", async () => {
      await createBoard("tower-a");

      const res = await request(app)
        .post("/api/sessions")
        .send({ coords: { latitude: 0.5, longitude: -0.5 } });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        sessionId: expect.stringMatching(/^[0-9a-f-]{36}$/),
        building: "tower-a",
      });
      expect(await redis.get(`session:${res.body.sessionId}`)).toBe("tower-a");
    });

    it("POST /api/sessions returns 404 when outside any board", async () => {
      const res = await request(app)
        .post("/api/sessions")
        .send({ coords: { latitude: 10, longitude: 10 } });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: expect.any(String),
        message: expect.any(String),
      });
    });

    it("POST /api/sessions returns 400 for an invalid body", async () => {
      const res = await request(app).post("/api/sessions").send({ coords: {} });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("validation_error");
    });
  });

  describe("boards", () => {
    it("POST /api/boards creates a board with an all-white drawing", async () => {
      const res = await createBoard();

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("tower-a");
      expect(res.body.size).toEqual({ width: 2, height: 2 });
      expect(res.body.drawing).toEqual([
        ["#ffffff", "#ffffff"],
        ["#ffffff", "#ffffff"],
      ]);
      expect(res.body.updates).toBe(0);
    });

    it("POST /api/boards requires the admin key", async () => {
      const res = await request(app)
        .post("/api/boards")
        .send({ name: "tower-a", coords, size: { width: 2, height: 2 } });

      expect(res.status).toBe(403);
    });

    it("GET /api/boards lists summaries", async () => {
      await createBoard("tower-a");

      const res = await request(app).get("/api/boards");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({ name: "tower-a", size: { width: 2, height: 2 } });
      expect(res.body[0]).not.toHaveProperty("drawing");
    });

    it("GET /api/boards/:name returns the board with its drawing", async () => {
      await createBoard("tower-a");
      await redis.hset("board:tower-a:pixels", "1:0", "#ff0000");

      const res = await request(app).get("/api/boards/tower-a");
      expect(res.status).toBe(200);
      expect(res.body.drawing).toEqual([
        ["#ffffff", "#ff0000"],
        ["#ffffff", "#ffffff"],
      ]);
    });

    it("GET /api/boards/:name returns 404 for a missing board", async () => {
      const res = await request(app).get("/api/boards/nope");
      expect(res.status).toBe(404);
    });

    it("GET /api/boards/:name/pixels returns the raw drawing grid", async () => {
      await createBoard("tower-a");

      const res = await request(app).get("/api/boards/tower-a/pixels");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        ["#ffffff", "#ffffff"],
        ["#ffffff", "#ffffff"],
      ]);
    });

    it("PATCH /api/boards/:name/pixels applies pixels and bumps updates", async () => {
      await createBoard("tower-a");

      const res = await request(app)
        .patch("/api/boards/tower-a/pixels")
        .send({ pixels: [{ x: 0, y: 0, color: "#ff0000" }] });

      expect(res.status).toBe(204);
      expect(await redis.hget("board:tower-a:pixels", "0:0")).toBe("#ff0000");
      const meta = JSON.parse((await redis.get("board:tower-a:meta")) ?? "{}");
      expect(meta.updates).toBe(1);
    });

    it("PATCH returns 400 for out-of-bounds pixels", async () => {
      await createBoard("tower-a");

      const res = await request(app)
        .patch("/api/boards/tower-a/pixels")
        .send({ pixels: [{ x: 9, y: 0, color: "#ff0000" }] });

      expect(res.status).toBe(400);
    });

    it("PATCH returns 404 for a missing board", async () => {
      const res = await request(app)
        .patch("/api/boards/nope/pixels")
        .send({ pixels: [{ x: 0, y: 0, color: "#ff0000" }] });

      expect(res.status).toBe(404);
    });

    it("DELETE /api/boards/:name removes the board", async () => {
      await createBoard("tower-a");

      const res = await request(app)
        .delete("/api/boards/tower-a")
        .set("x-admin-password", ADMIN_PASSWORD);
      expect(res.status).toBe(204);
      expect(await redis.exists("board:tower-a:meta")).toBe(0);
    });
  });
});
