# Vidyaverse backend (Fastify) — Coolify build.
#
# Build from the REPO ROOT context (pnpm workspace; depends on
# packages/shared-validation). In Coolify:
#   Build Pack = Dockerfile, Base Directory = /,
#   Dockerfile Location = /backend/Dockerfile, Ports Exposes = 3000.
#
# The backend runs from SOURCE via tsx (not tsc-compiled). Its source uses 100+
# tsconfig path-alias imports (@modules/*, @/*) plus some extensionless relative
# imports — Node's compiled ESM can't resolve those, but tsx does (this is how
# `pnpm dev` runs). shared-validation is still built (the backend imports its
# dist), and the Prisma client is generated at build time.
# Prisma schema declares linux-musl, so node:22-alpine works.

# ---- Builder ----------------------------------------------------------------
FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++ openssl
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-validation/package.json ./packages/shared-validation/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
# --ignore-scripts: pnpm 10+ blocks dependency build scripts (ERR_PNPM_IGNORED_BUILDS).
# bcryptjs is pure JS, sharp 0.33 ships prebuilt binaries, Prisma generated below.
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY packages/shared-validation ./packages/shared-validation
COPY backend ./backend

# Build the shared package (consumed as dist) and generate the Prisma client.
# The backend is intentionally NOT compiled — tsx runs it from source.
RUN pnpm --filter @vidyaverse/shared-validation build \
 && pnpm --filter @vidyaverse/backend exec prisma generate \
 # Entitlements is a second, separate datasource with its own generated client.
 # `|| true` because it is an optional module: a build without it must still
 # produce a working image, and the runtime loads the client lazily so its absence
 # is only felt if the feature is actually enabled.
 && (pnpm --filter @vidyaverse/backend exec prisma generate --schema prisma/entitlements/schema.prisma || true) \
 # Taxonomy is a THIRD datasource with its own generated client. It was added
 # after this Dockerfile and never wired in, so the client was absent from every
 # image ever built and /api/v1/taxonomy/* answered 500 with
 # "Cannot find module '.prisma/taxonomy-client'" from the day it shipped —
 # which meant DigiClassroom's book-tagging picker, which proxies this service,
 # could never populate.
 #
 # Deliberately NOT `|| true`. The entitlements line above swallows failures
 # because that module is optional; taxonomy is not — every book tagged in either
 # RP goes through it, and a silent 500 is exactly how this went unnoticed. A
 # failed generate should fail the build.
 && pnpm --filter @vidyaverse/backend exec prisma generate --schema prisma/taxonomy/schema.prisma

# ---- Production -------------------------------------------------------------
FROM node:22-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app
RUN corepack enable
# tsx: production TS runtime that honours tsconfig paths + extensionless imports.
RUN npm install -g tsx@4
ENV NODE_ENV=production

COPY --from=builder /app ./
WORKDIR /app/backend

EXPOSE 3000

# Apply pending migrations (idempotent), then run the API from source via tsx.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && tsx src/index.ts"]
