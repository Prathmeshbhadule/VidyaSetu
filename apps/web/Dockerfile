# Multi-stage production Dockerfile for apps/web behind Nginx
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile=false

COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
RUN pnpm --filter @vidya-setu/shared run build

COPY apps/web/ ./apps/web/
RUN pnpm --filter @vidya-setu/web run build

FROM nginx:1.25-alpine AS runner

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
