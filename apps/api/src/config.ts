// oxlint-disable-next-line import/no-unassigned-import
import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 8080,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  adminKey: process.env.ADMIN_KEY || "",
  sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS) || 600,
} as const;
