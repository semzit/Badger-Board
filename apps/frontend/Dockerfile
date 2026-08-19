# STAGE 1: Build the React App
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/infra/package.json apps/infra/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile
COPY apps/frontend apps/frontend
COPY packages/shared packages/shared
RUN pnpm --filter @badger/shared build
RUN pnpm --filter @badger/frontend build

# STAGE 2: Serve with Nginx
FROM nginx:stable-alpine
# Copy the compiled files from the build stage
COPY --from=build /repo/apps/frontend/docs /usr/share/nginx/html
# Copy your custom Nginx config (we made this earlier)
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
