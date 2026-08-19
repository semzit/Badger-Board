# @badger/frontend

React 19 + Vite single-page application for Badger Board. TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, axios, and a WebSocket client for real-time paint updates.

## Development

Run from the repo root so the workspace is picked up:

```bash
pnpm install
pnpm dev
```

The Vite dev server runs on http://localhost:5173 and proxies `/api` and `/ws` to the API on port 8080 (see `vite.config.ts`). Start the API first (see the root README).

## Configuration

Frontend env vars are loaded by Vite from `apps/frontend/.env` (any `VITE_`-prefixed variable). Copy the example to opt in:

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

| Variable            | Default | Description                                 |
| ------------------- | ------- | ------------------------------------------- |
| `VITE_API_BASE_URL` | `/api`  | API base URL; use `/api` with the dev proxy |

## Commands

```bash
pnpm dev          # Vite dev server with HMR
pnpm build        # production build (outputs to docs/, deployed by CDK)
pnpm typecheck    # tsc type-check
pnpm lint         # oxlint
```
