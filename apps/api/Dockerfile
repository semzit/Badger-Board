FROM node:24-slim AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/frontend/package.json apps/frontend/
COPY apps/infra/package.json apps/infra/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @badger/shared build && pnpm --filter @badger/api build

ENV PORT=8080

EXPOSE 8080

CMD ["node", "apps/api/build/server.js"]
