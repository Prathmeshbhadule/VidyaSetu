# Multi-stage production Dockerfile for apps/api
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile=false

COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
RUN pnpm --filter @vidya-setu/shared run build

COPY apps/api/ ./apps/api/
RUN pnpm --filter @vidya-setu/api run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache ffmpeg curl

# Create non-root user
RUN addgroup -S vidyasetu && adduser -S vidyasetu -G vidyasetu

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile=false

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

USER vidyasetu

EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
