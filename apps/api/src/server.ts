import { createServer } from "node:http";
import { app } from "./app";
import { config } from "./config";
import { createRedis, setRedis } from "./redis/client";
import { Hub } from "./ws/hub";

async function main(): Promise<void> {
  const redis = createRedis();
  setRedis(redis);
  await redis.connect();

  const server = createServer(app);
  const hub = new Hub(server);
  await hub.start();

  server.listen(config.port, () => {
    console.log(`Badger API listening on port ${config.port}`);
  });

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}, shutting down`);
    server.close(() => {
      void (async () => {
        await hub.close();
        await redis.quit();
        process.exit(0);
      })();
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
