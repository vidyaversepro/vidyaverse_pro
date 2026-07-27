# Vidyaverse backend (Fastify) — Coolify build.
#
# IMPORTANT: build from the REPO ROOT context, not /backend, because this is a
# pnpm workspace and the backend depends on packages/shared-validation.
# In Coolify set:  Build Pack = Dockerfile
#                  Base Directory = /
#                  Dockerfile Location = /backend/Dockerfile
#                  Ports Exposes = 3000
#
# The Prisma schema declares the linux-musl target, so node:20-alpine works.
# Runtime env (DATABASE_URL, REDIS_URL, R2_*, JWT_*, BETTER_AUTH_SECRET,
# FRONTEND_URL, API_BASE_URL, PORT=3000, …) is injected by Coolify.

# ---- Builder ----------------------------------------------------------------
FROM node:20-alpine AS builder
# python3/make/g++ for native deps (bcrypt, sharp); openssl for Prisma.
RUN apk add --no-cache python3 make g++ openssl
WORKDIR /app
RUN corepack enable

# Workspace manifests first for better install-layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-validation/package.json ./packages/shared-validation/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile

# Only the sources needed to build the backend.
COPY packages/shared-validation ./packages/shared-validation
COPY backend ./backend

# Build the shared package, generate the Prisma client, compile the backend.
RUN pnpm --filter @vidyaverse/shared-validation build \
 && pnpm --filter @vidyaverse/backend exec prisma generate \
 && pnpm --filter @vidyaverse/backend build

# ---- Production -------------------------------------------------------------
FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production

# Copy the whole built workspace so pnpm symlinks and shared-validation/dist
# stay intact, and the Prisma CLI is available for migrate deploy at startup.
COPY --from=builder /app ./
WORKDIR /app/backend

EXPOSE 3000

# Apply pending migrations (idempotent), then boot the Fastify server.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/index.js"]
