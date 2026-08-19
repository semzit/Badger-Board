import { create, isAxiosError } from "axios";
import { z } from "zod";
import type { ApiError } from "@badger/shared";
import { API_BASE_URL } from "../config";

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

export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw {
      error: "invalid_response",
      message: `Invalid server response: ${result.error.message}`,
    } satisfies ApiErrorLike;
  }
  return result.data;
}
