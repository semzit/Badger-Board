import { getRedis } from "./client";

const sessionKey = (id: string): string => `session:${id}`;

export const createSession = async (
  id: string,
  building: string,
  ttlSeconds: number,
): Promise<void> => {
  await getRedis().set(sessionKey(id), building, "EX", ttlSeconds);
};

export const getSession = async (id: string): Promise<string | null> =>
  getRedis().get(sessionKey(id));
