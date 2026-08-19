import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { AddressInfo } from "node:net";
import RedisMock from "ioredis-mock";
import { Redis } from "ioredis";
import request from "supertest";
import { WebSocket } from "ws";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { setRedis } from "../src/redis/client";
import { Hub } from "../src/ws/hub";

const coords = [
  { latitude: -1, longitude: -1 },
  { latitude: -1, longitude: 1 },
  { latitude: 1, longitude: 1 },
  { latitude: 1, longitude: -1 },
];

describe("WebSocket hub", () => {
  let redis: Redis;
  let subscriber: Redis;
  let server: ReturnType<typeof createServer>;
  let hub: Hub;
  let port: number;
  let sessionId: string;

  beforeAll(async () => {
    redis = new RedisMock();
    setRedis(redis);
    subscriber = new RedisMock();

    server = createServer(app);
    hub = new Hub(server, subscriber);
    await hub.start();

    await redis.set(
      "board:tower-a:meta",
      JSON.stringify({
        name: "tower-a",
        coords,
        size: { width: 3, height: 3 },
        updates: 0,
        updatedAt: Date.now(),
      }),
    );

    sessionId = randomUUID();
    await redis.set(`session:${sessionId}`, "tower-a", "EX", 600);

    await new Promise<void>((resolve) => server.listen(0, resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await hub.close();
    server.close();
    redis.disconnect();
    subscriber.disconnect();
  });

  it("applies a paint message and broadcasts later REST updates to subscribers", async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    const received: string[] = [];
    ws.on("message", (data) => received.push(data.toString()));
    await new Promise<void>((resolve) => ws.on("open", resolve));

    ws.send(JSON.stringify({ type: "paint", sessionId, x: 1, y: 1, color: "#ff0000" }));
    await new Promise((resolve) => setTimeout(resolve, 50));

    const res = await request(app)
      .patch("/api/boards/tower-a/pixels")
      .send({ pixels: [{ x: 2, y: 2, color: "#00ff00" }] });
    expect(res.status).toBe(204);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(received).toContainEqual(
      JSON.stringify({ type: "update", x: 2, y: 2, color: "#00ff00" }),
    );
    expect(received).not.toContainEqual(
      JSON.stringify({ type: "update", x: 1, y: 1, color: "#ff0000" }),
    );

    const grid = await request(app).get("/api/boards/tower-a/pixels");
    expect(grid.body[1][1]).toBe("#ff0000");

    ws.close();
  });

  it("rejects a paint message with an invalid session", async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    const received: string[] = [];
    ws.on("message", (data) => received.push(data.toString()));
    await new Promise<void>((resolve) => ws.on("open", resolve));

    ws.send(
      JSON.stringify({
        type: "paint",
        sessionId: randomUUID(),
        x: 0,
        y: 0,
        color: "#ff0000",
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(received).toContainEqual(JSON.stringify({ error: "invalid session" }));
    ws.close();
  });

  it("rejects a paint message outside the board bounds", async () => {
    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    const received: string[] = [];
    ws.on("message", (data) => received.push(data.toString()));
    await new Promise<void>((resolve) => ws.on("open", resolve));

    ws.send(JSON.stringify({ type: "paint", sessionId, x: 9, y: 9, color: "#ff0000" }));

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(received).toHaveLength(1);
    expect(JSON.parse(received[0]).error).toBeDefined();
    ws.close();
  });
});
