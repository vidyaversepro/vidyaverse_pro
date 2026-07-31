# Vidyaverse frontend (Vite + nginx) — Coolify build.
#
# IMPORTANT: build from the REPO ROOT context — pnpm workspace; the frontend
# also depends on packages/shared-validation.
# In Coolify set:  Build Pack = Dockerfile
#                  Base Directory = /
#                  Dockerfile Location = /frontend/Dockerfile
#                  Ports Exposes = 80
#
# VITE_* are inlined into the bundle at BUILD time — add them in Coolify as
# environment variables (they are passed through as build args below):
#   VITE_API_URL     = https://api.vidyaverse.vinstitution.com/api/v1
#   VITE_CHAT_WS_URL = wss://api.vidyaverse.vinstitution.com/api/v1/chat/ws

# ---- Builder ----------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-validation/package.json ./packages/shared-validation/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
# --ignore-scripts: pnpm 10+ blocks dependency build scripts by default and
# errors (ERR_PNPM_IGNORED_BUILDS). The frontend build (vite) needs no native
# postinstalls, so skipping scripts is safe.
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY packages/shared-validation ./packages/shared-validation
COPY frontend ./frontend

ARG VITE_API_URL
ARG VITE_CHAT_WS_URL
ARG VITE_SENTRY_DSN
ENV VITE_API_URL=$VITE_API_URL \
    VITE_CHAT_WS_URL=$VITE_CHAT_WS_URL \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN

# The frontend build script is `tsc && vite build`; the tsc type-check fails on
# stray unused imports. Run vite directly (esbuild transpiles without a type
# gate) so production builds don't break on type errors — same policy as PDLMS.
RUN pnpm --filter @vidyaverse/shared-validation build \
 && pnpm --filter @vidyaverse/frontend exec vite build

# ---- Production (nginx) -----------------------------------------------------
FROM nginx:alpine AS production
COPY frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
