import { Server as HttpServer } from "node:http";
import Redis from "ioredis";
import { WsClientMessageSchema, WsUpdateMessage } from "@badger/shared";
import { WebSocket, WebSocketServer } from "ws";
import { config } from "../config";
import { boardChannel } from "../redis/pubsub";
import { getSession } from "../redis/sessionRepository";
import { PixelOutOfBoundsError, applyPixels } from "../services/pixelService";

type ConnectionState = {
  /** Boards this connection is subscribed to for broadcasts. */
  boards: Set<string>;
  ws: WebSocket;
};

export class Hub {
  private wss: WebSocketServer;
  private connections = new Set<ConnectionState>();
  private subscriber: Redis;
  private channelRefCounts = new Map<string, number>();

  constructor(server: HttpServer, subscriber?: Redis) {
    this.wss = new WebSocketServer({ server, path: "/ws" });
    this.subscriber =
      subscriber ?? new Redis(config.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });

    this.wss.on("connection", (ws) => {
      const state: ConnectionState = { boards: new Set(), ws };
      this.connections.add(state);
      ws.on("error", (err) => console.error("[ws] connection error:", err));
      ws.on("message", (data) => void this.handleMessage(state, data));
      ws.on("close", () => this.handleClose(state));
    });

    this.subscriber.on("message", (channel, raw) => this.onBoardMessage(channel, raw));
  }

  private async handleMessage(
    state: ConnectionState,
    data: Buffer | ArrayBuffer | Buffer[],
  ): Promise<void> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      this.reject(state, "invalid JSON");
      return;
    }

    const message = WsClientMessageSchema.safeParse(parsed);
    if (!message.success) {
      this.reject(state, "invalid message");
      return;
    }

    const paint = message.data;
    const building = await getSession(paint.sessionId);
    if (!building) {
      this.reject(state, "invalid session");
      return;
    }

    try {
      await applyPixels(building, [{ x: paint.x, y: paint.y, color: paint.color }]);
    } catch (err) {
      if (err instanceof PixelOutOfBoundsError) {
        this.reject(state, err.message);
      } else {
        this.reject(state, "failed to apply pixel");
      }
      return;
    }

    if (!state.boards.has(building)) {
      await this.subscribeBoard(state, building);
    }
  }

  private reject(state: ConnectionState, message: string): void {
    if (state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify({ error: message }));
      state.ws.close();
    }
  }

  private async subscribeBoard(state: ConnectionState, board: string): Promise<void> {
    const channel = boardChannel(board);
    if (!this.channelRefCounts.has(channel)) {
      await this.subscriber.subscribe(channel);
    }
    this.channelRefCounts.set(channel, (this.channelRefCounts.get(channel) ?? 0) + 1);
    state.boards.add(board);
  }

  private handleClose(state: ConnectionState): void {
    this.connections.delete(state);
    for (const board of state.boards) {
      this.unsubscribeBoard(board);
    }
    state.boards.clear();
  }

  private unsubscribeBoard(board: string): void {
    const channel = boardChannel(board);
    const count = (this.channelRefCounts.get(channel) ?? 0) - 1;
    if (count <= 0) {
      this.channelRefCounts.delete(channel);
      void this.subscriber.unsubscribe(channel);
    } else {
      this.channelRefCounts.set(channel, count);
    }
  }

  /** Called when a board's pixels channel receives an update. */
  private onBoardMessage(channel: string, raw: string): void {
    const board = channel.replace(/^board:/, "").replace(/:pixels$/, "");
    let update: WsUpdateMessage;
    try {
      update = JSON.parse(raw) as WsUpdateMessage;
    } catch {
      return;
    }
    for (const state of this.connections) {
      if (state.boards.has(board) && state.ws.readyState === WebSocket.OPEN) {
        state.ws.send(JSON.stringify(update));
      }
    }
  }

  async start(): Promise<void> {
    if (this.subscriber.status === "wait") {
      await this.subscriber.connect();
    }
  }

  async close(): Promise<void> {
    for (const state of this.connections) {
      state.ws.terminate();
    }
    this.connections.clear();
    for (const channel of this.channelRefCounts.keys()) {
      await this.subscriber.unsubscribe(channel);
    }
    this.channelRefCounts.clear();
    await this.subscriber.quit();
    await new Promise<void>((resolve) => this.wss.close(() => resolve()));
  }
}
