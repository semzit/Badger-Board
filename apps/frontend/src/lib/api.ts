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
import { ADMIN_KEY_HEADER, API_BASE_URL } from "../config";

export type CreateBoardRequest = {
  name: string;
  coords: LatLon[];
  size: BoardSize;
};

export type ApiErrorLike = ApiError & { status?: number };

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

export async function createSession(coords: LatLon): Promise<CreateSessionResponse> {
  const { data } = await api.post("/sessions", { coords });
  return validate(CreateSessionResponseSchema, data);
}

export async function getBoards(): Promise<BoardSummary[]> {
  const { data } = await api.get("/boards");
  return validate(z.array(BoardSummarySchema), data);
}

export async function getBoard(name: string): Promise<Board> {
  const { data } = await api.get(`/boards/${encodeURIComponent(name)}`);
  return validate(BoardSchema, data);
}

export async function getBoardPixels(name: string): Promise<Color[]> {
  const board = await getBoard(name);
  return board.drawing.flat();
}

export async function patchPixels(name: string, pixels: PixelUpdate[]): Promise<void> {
  await api.patch(`/boards/${encodeURIComponent(name)}/pixels`, { pixels });
}

export async function createBoard(input: CreateBoardRequest, adminKey: string): Promise<void> {
  await api.post("/boards", input, { headers: { [ADMIN_KEY_HEADER]: adminKey } });
}

export async function deleteBoard(name: string, adminKey: string): Promise<void> {
  await api.delete(`/boards/${encodeURIComponent(name)}`, {
    headers: { [ADMIN_KEY_HEADER]: adminKey },
  });
}
