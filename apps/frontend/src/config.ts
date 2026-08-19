type EnvRecord = Record<string, string | undefined>;

function readEnv(key: string): string | undefined {
  const metaEnv = (import.meta as { env?: EnvRecord }).env;
  const processEnv = (globalThis as { process?: { env?: EnvRecord } }).process?.env;
  return metaEnv?.[key] ?? processEnv?.[key];
}

export const API_BASE_URL = readEnv("VITE_API_BASE_URL") ?? "/api";

export const ADMIN_KEY_HEADER = "x-admin-key";
