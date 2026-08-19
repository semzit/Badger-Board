FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/infra/package.json apps/infra/package.json
RUN pnpm install --frozen-lockfile
COPY apps/frontend apps/frontend
RUN pnpm --filter @badger/frontend build

FROM nginx:stable-alpine
COPY --from=build /repo/apps/frontend/docs /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
