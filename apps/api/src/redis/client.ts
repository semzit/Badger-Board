import Redis from "ioredis";
import { config } from "../config";

let redis: Redis | undefined;

export const createRedis = (): Redis =>
  new Redis(config.redisUrl, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

export const setRedis = (client: Redis): void => {
  redis = client;
};

export const getRedis = (): Redis => {
  if (!redis) {
    throw new Error("Redis client not initialized");
  }
  return redis;
};
