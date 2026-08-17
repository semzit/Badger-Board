import Redis from "ioredis";
import { getRedis } from "./client";

export const boardChannel = (name: string): string => `board:${name}:pixels`;

export const subscribeToBoard = async (
  client: Redis,
  name: string,
  onMessage: (channel: string, message: string) => void,
): Promise<void> => {
  client.on("message", onMessage);
  await client.subscribe(boardChannel(name));
};

export const publishBoardUpdate = async (
  name: string,
  message: Record<string, unknown>,
): Promise<void> => {
  await getRedis().publish(boardChannel(name), JSON.stringify(message));
};
