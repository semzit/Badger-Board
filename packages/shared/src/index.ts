/**
 * Badger Board shared API contract.
 *
 * The REST and WebSocket wire shapes shared by `@badger/api` and
 * `@badger/frontend`. Keep this file free of runtime dependencies so it
 * type-checks and builds everywhere.
 *
 * Conventions:
 * - Colors are normalized hex strings, e.g. "#ff0000".
 * - Drawings are 2D grids indexed `drawing[row][col]` (row-major).
 * - WebSocket messages are discriminated unions on the `type` field.
 */

/** Geographic coordinate (WGS84). */
export type LatLon = {
  latitude: number;
  longitude: number;
};

/** Dimensions of a drawing grid. */
export type BoardSize = {
  width: number;
  height: number;
};

/** A single pixel color as a normalized hex string, e.g. "#ff0000". */
export type Color = string;

/** 2D grid of pixels, indexed `drawing[row][col]`. */
export type Drawing = Color[][];

/** A board's full state. */
export type Board = {
  name: string;
  drawing: Drawing;
  /** Building boundary polygon vertices, in order. */
  coords: LatLon[];
  size: BoardSize;
  /** Total number of pixel updates applied. */
  updates: number;
  /** Unix epoch milliseconds of the last write. */
  updatedAt: number;
};

/** Lightweight board metadata for list endpoints. */
export type BoardSummary = {
  name: string;
  size: BoardSize;
  updates: number;
  updatedAt: number;
};

/** A single pixel write. */
export type PixelUpdate = {
  x: number;
  y: number;
  color: Color;
};

/** POST /api/sessions */
export type CreateSessionRequest = {
  coords: LatLon;
};

/** Response for POST /api/sessions (201) or error (404 when outside any board). */
export type CreateSessionResponse = {
  sessionId: string;
  building: string;
};

/** PATCH /api/boards/:name/pixels */
export type UpdatePixelsRequest = {
  pixels: PixelUpdate[];
};

/** WebSocket client -> server. */
export type WsPaintMessage = {
  type: "paint";
  sessionId: string;
  x: number;
  y: number;
  color: Color;
};

export type WsClientMessage = WsPaintMessage;

/** WebSocket server -> client. */
export type WsUpdateMessage = {
  type: "update";
  x: number;
  y: number;
  color: Color;
};

export type WsServerMessage = WsUpdateMessage;

/** Standard error payload returned by the REST API. */
export type ApiError = {
  error: string;
  message: string;
};
