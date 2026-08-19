import { z } from "zod";
import {
  type Board,
  BoardSchema,
  type BoardSummary,
  BoardSummarySchema,
  type Color,
  type CreateBoardRequest,
  type CreateSessionResponse,
  CreateSessionResponseSchema,
  type LatLon,
  type PixelUpdate,
} from "@badger/shared";
import { ADMIN_KEY_HEADER } from "../config";
import { api, validate } from "./apiClient";

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
