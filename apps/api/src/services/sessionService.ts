import { randomUUID } from "node:crypto";
import { listBoardMetas } from "../redis/boardRepository";
import { createSession as persistSession } from "../redis/sessionRepository";
import { config } from "../config";
import { isInsidePolygon } from "./geoService";

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionError";
  }
}

/**
 * Resolve a coordinate to a building and create a TTL'd session for it.
 * Throws SessionError when the coordinate is not inside any board.
 */
export const createSession = async (coords: {
  latitude: number;
  longitude: number;
}): Promise<{ sessionId: string; building: string }> => {
  const metas = await listBoardMetas();
  const match = metas.find((meta) => isInsidePolygon(coords, meta.coords));
  if (!match) {
    throw new SessionError("Coordinates are not inside any board");
  }

  const sessionId = randomUUID();
  await persistSession(sessionId, match.name, config.sessionTtlSeconds);
  return { sessionId, building: match.name };
};
