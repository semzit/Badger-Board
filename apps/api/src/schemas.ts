import { z } from "zod";

export const LatLonSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const BoardSizeSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const ColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "color must be a hex string like #ff0000");

export const PixelUpdateSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  color: ColorSchema,
});

export const DrawingSchema = z.array(z.array(ColorSchema));

export const BoardSchema = z.object({
  name: z.string().min(1),
  drawing: DrawingSchema,
  coords: z.array(LatLonSchema),
  size: BoardSizeSchema,
  updates: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});

export const BoardSummarySchema = BoardSchema.pick({
  name: true,
  size: true,
  updates: true,
  updatedAt: true,
});

export const CreateSessionRequestSchema = z.object({
  coords: LatLonSchema,
});

export const CreateSessionResponseSchema = z.object({
  sessionId: z.string().uuid(),
  building: z.string().min(1),
});

export const CreateBoardRequestSchema = z.object({
  name: z.string().min(1),
  coords: z.array(LatLonSchema).min(3),
  size: BoardSizeSchema,
});

export const UpdatePixelsRequestSchema = z.object({
  pixels: z.array(PixelUpdateSchema).min(1),
});

export const WsPaintMessageSchema = z.object({
  type: z.literal("paint"),
  sessionId: z.string().uuid(),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  color: ColorSchema,
});

export const WsClientMessageSchema = z.discriminatedUnion("type", [WsPaintMessageSchema]);

export const WsUpdateMessageSchema = z.object({
  type: z.literal("update"),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  color: ColorSchema,
});

export const WsServerMessageSchema = z.discriminatedUnion("type", [WsUpdateMessageSchema]);

export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export type LatLon = z.infer<typeof LatLonSchema>;
export type BoardSize = z.infer<typeof BoardSizeSchema>;
export type Color = z.infer<typeof ColorSchema>;
export type PixelUpdate = z.infer<typeof PixelUpdateSchema>;
export type Drawing = z.infer<typeof DrawingSchema>;
export type Board = z.infer<typeof BoardSchema>;
export type BoardSummary = z.infer<typeof BoardSummarySchema>;
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;
export type CreateSessionResponse = z.infer<typeof CreateSessionResponseSchema>;
export type CreateBoardRequest = z.infer<typeof CreateBoardRequestSchema>;
export type UpdatePixelsRequest = z.infer<typeof UpdatePixelsRequestSchema>;
export type WsPaintMessage = z.infer<typeof WsPaintMessageSchema>;
export type WsClientMessage = z.infer<typeof WsClientMessageSchema>;
export type WsUpdateMessage = z.infer<typeof WsUpdateMessageSchema>;
export type WsServerMessage = z.infer<typeof WsServerMessageSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
