# Multi-stage production Dockerfile for apps/hub
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm && apk add --no-cache python3 make g++

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/hub/package.json ./apps/hub/

RUN pnpm install --frozen-lockfile=false

COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
RUN pnpm --filter @vidya-setu/shared run build

COPY apps/hub/ ./apps/hub/
RUN pnpm --filter @vidya-setu/hub run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -S vidyasetu && adduser -S vidyasetu -G vidyasetu
RUN mkdir -p /data && chown -R vidyasetu:vidyasetu /data

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/hub/package.json ./apps/hub/

RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile=false

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/hub/dist ./apps/hub/dist
COPY --from=builder /app/apps/hub/migrations ./apps/hub/migrations

USER vidyasetu
VOLUME ["/data"]

EXPOSE 3001
CMD ["node", "apps/hub/dist/server.js"]
