/**
 * Badger Board shared API contract.
 *
 * The REST and WebSocket wire shapes shared by `@badger/api` and
 * `@badger/frontend`. Defined as Zod schemas so both sides can validate
 * at runtime; the exported types are derived via `z.infer`.
 *
 * Conventions:
 * - Colors are normalized hex strings, e.g. "#ff0000".
 * - Drawings are 2D grids indexed `drawing[row][col]` (row-major).
 * - WebSocket messages are discriminated unions on the `type` field.
 */

import { z } from "zod";

/** Geographic coordinate (WGS84). */
export const LatLonSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type LatLon = z.infer<typeof LatLonSchema>;

/** Dimensions of a drawing grid. */
export const BoardSizeSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type BoardSize = z.infer<typeof BoardSizeSchema>;

/** A single pixel color as a normalized hex string, e.g. "#ff0000". */
export const ColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "color must be a hex string like #ff0000");
export type Color = z.infer<typeof ColorSchema>;

/** A single pixel write. */
export const PixelUpdateSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  color: ColorSchema,
});
export type PixelUpdate = z.infer<typeof PixelUpdateSchema>;

/** 2D grid of pixels, indexed `drawing[row][col]`. */
export const DrawingSchema = z.array(z.array(ColorSchema));
export type Drawing = z.infer<typeof DrawingSchema>;

/** A board's full state. */
export const BoardSchema = z.object({
  name: z.string().min(1),
  drawing: DrawingSchema,
  /** Building boundary polygon vertices, in order. */
  coords: z.array(LatLonSchema),
  size: BoardSizeSchema,
  /** Total number of pixel updates applied. */
  updates: z.number().int().nonnegative(),
  /** Unix epoch milliseconds of the last write. */
  updatedAt: z.number().int().nonnegative(),
});
export type Board = z.infer<typeof BoardSchema>;

/** Lightweight board metadata for list endpoints. */
export const BoardSummarySchema = BoardSchema.pick({
  name: true,
  size: true,
  updates: true,
  updatedAt: true,
});
export type BoardSummary = z.infer<typeof BoardSummarySchema>;

/** POST /api/sessions */
export const CreateSessionRequestSchema = z.object({
  coords: LatLonSchema,
});
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

/** Response for POST /api/sessions (201) or error (404 when outside any board). */
export const CreateSessionResponseSchema = z.object({
  sessionId: z.string().uuid(),
  building: z.string().min(1),
});
export type CreateSessionResponse = z.infer<typeof CreateSessionResponseSchema>;

/** POST /api/boards */
export const CreateBoardRequestSchema = z.object({
  name: z.string().min(1),
  /** Building boundary polygon vertices, in order. */
  coords: z.array(LatLonSchema).min(3),
  size: BoardSizeSchema,
});
export type CreateBoardRequest = z.infer<typeof CreateBoardRequestSchema>;

/** PATCH /api/boards/:name/pixels */
export const UpdatePixelsRequestSchema = z.object({
  pixels: z.array(PixelUpdateSchema).min(1),
});
export type UpdatePixelsRequest = z.infer<typeof UpdatePixelsRequestSchema>;

/** WebSocket client -> server. */
export const WsPaintMessageSchema = z.object({
  type: z.literal("paint"),
  sessionId: z.string().uuid(),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  color: ColorSchema,
});
export type WsPaintMessage = z.infer<typeof WsPaintMessageSchema>;

export const WsClientMessageSchema = z.discriminatedUnion("type", [WsPaintMessageSchema]);
export type WsClientMessage = z.infer<typeof WsClientMessageSchema>;

/** WebSocket server -> client. */
export const WsUpdateMessageSchema = z.object({
  type: z.literal("update"),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  color: ColorSchema,
});
export type WsUpdateMessage = z.infer<typeof WsUpdateMessageSchema>;

export const WsServerMessageSchema = z.discriminatedUnion("type", [WsUpdateMessageSchema]);
export type WsServerMessage = z.infer<typeof WsServerMessageSchema>;

/** Standard error payload returned by the REST API. */
export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
