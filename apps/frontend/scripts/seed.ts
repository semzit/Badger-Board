// Seeds a demo board into the running API using the shared api client.
// Usage:
//   pnpm --filter @badger/frontend seed
//   VITE_API_BASE_URL=http://localhost:8080 pnpm --filter @badger/frontend seed
process.env.VITE_API_BASE_URL ??= "http://localhost:8080";

const { createBoard } = await import("../src/lib/api");

const name = process.env.BOARD_NAME ?? "morg";
const adminKey = process.env.ADMIN_KEY ?? "1234";

const coords = [
  { latitude: 45.6581812088617, longitude: -94.6197712462103 },
  { latitude: 45.36719016965179, longitude: -82.90951936954298 },
  { latitude: 40.591149344196786, longitude: -93.84462454988244 },
  { latitude: 39.936286135844675, longitude: -86.78525285118228 },
];

await createBoard({ name, coords, size: { width: 100, height: 100 } }, adminKey);

console.log(`Seeded board "${name}" via ${process.env.VITE_API_BASE_URL}`);
