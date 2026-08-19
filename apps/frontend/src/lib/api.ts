import { create, isAxiosError } from "axios";
import { z } from "zod";
import {
  type ApiError,
  type Board,
  BoardSchema,
  type BoardSize,
  type BoardSummary,
  BoardSummarySchema,
  type Color,
  type CreateSessionResponse,
  CreateSessionResponseSchema,
  type LatLon,
  type PixelUpdate,
} from "@badger/shared";

/** Header carrying the admin key for board management endpoints. */
export const ADMIN_KEY_HEADER = "x-admin-key";

/** Request payload for POST /api/boards. */
export type CreateBoardRequest = {
  name: string;
  coords: LatLon[];
  size: BoardSize;
};

/** Normalized error rejected by the api client (ApiError plus optional HTTP status). */
export type ApiErrorLike = ApiError & { status?: number };

const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env ?? {};

/** Base URL for the REST api; override with VITE_API_BASE_URL (e.g. for scripts). */
export const API_BASE_URL = env.VITE_API_BASE_URL ?? "/api";

export const api = create({ baseURL: API_BASE_URL });

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError<ApiError>(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      const normalized: ApiErrorLike = {
        error: data?.error ?? "request_failed",
        message: data?.message ?? error.message,
        status,
      };
      return Promise.reject(normalized);
    }
    return Promise.reject({
      error: "request_failed",
      message: error instanceof Error ? error.message : "Unknown request error",
    } satisfies ApiErrorLike);
  },
);

/** True when the value was rejected by the api client. */
export function isApiError(value: unknown): value is ApiErrorLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string" &&
    "message" in value &&
    typeof value.message === "string"
  );
}

function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw {
      error: "invalid_response",
      message: `Invalid server response: ${result.error.message}`,
    } satisfies ApiErrorLike;
  }
  return result.data;
}

/** POST /api/sessions — starts a session for the given coordinates. */
export async function createSession(coords: LatLon): Promise<CreateSessionResponse> {
  const { data } = await api.post("/sessions", { coords });
  return validate(CreateSessionResponseSchema, data);
}

/** GET /api/boards — lists all boards. */
export async function getBoards(): Promise<BoardSummary[]> {
  const { data } = await api.get("/boards");
  return validate(z.array(BoardSummarySchema), data);
}

/** GET /api/boards/:name — fetches a full board state. */
export async function getBoard(name: string): Promise<Board> {
  const { data } = await api.get(`/boards/${encodeURIComponent(name)}`);
  return validate(BoardSchema, data);
}

/** GET /api/boards/:name — fetches the drawing as a row-major flat pixel list. */
export async function getBoardPixels(name: string): Promise<Color[]> {
  const board = await getBoard(name);
  return board.drawing.flat();
}

/** PATCH /api/boards/:name/pixels — writes pixels. */
export async function patchPixels(name: string, pixels: PixelUpdate[]): Promise<void> {
  await api.patch(`/boards/${encodeURIComponent(name)}/pixels`, { pixels });
}

/** POST /api/boards — creates a board (admin key required). */
export async function createBoard(input: CreateBoardRequest, adminKey: string): Promise<void> {
  await api.post("/boards", input, { headers: { [ADMIN_KEY_HEADER]: adminKey } });
}

/** DELETE /api/boards/:name — removes a board (admin key required). */
export async function deleteBoard(name: string, adminKey: string): Promise<void> {
  await api.delete(`/boards/${encodeURIComponent(name)}`, {
    headers: { [ADMIN_KEY_HEADER]: adminKey },
  });
}
