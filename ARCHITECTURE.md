# 🏗️ Architecture Overview

This document describes the high-level architecture of Vidyaverse Pro.

---

## Ecosystem Integration

Vidyaverse Pro operates as part of the **Educational Excellence Trio**:
1. **Vidyaverse Pro**: Educational management and administrative core.
2. **PDLMS Pro**: Digital library and resource management.
3. **DigiClassroom Pro**: AI-powered tutoring and document processing.

These three systems function together to provide a comprehensive, end-to-end educational ecosystem for institutions and students.

---

## System Overview

Vidyaverse Pro is a **monorepo** containing two workspaces:

| Package | Technology | Purpose |
|---------|------------|---------|
| `backend/` | Fastify + Prisma + TypeScript | REST API server |
| `frontend/` | React + Vite + TypeScript | Single-page application |

Both packages share a root `package.json` with workspace-level scripts managed via **pnpm workspaces**.

---

## Backend Architecture

### Layered Module System

Each feature is a self-contained **module** under `backend/src/modules/`:

```
modules/<feature>/
├── index.ts            # Fastify plugin export
├── <feature>.routes.ts # Route definitions
└── <feature>.service.ts # Business logic
```

**Current modules (18):**
institution, branch, user, class, stream, section, student, photo, template, id-card, certificate, group-photo, portfolio, hall-ticket, marksheet, library-card, transfer-certificate, visionarium, social

### Plugin System

Fastify plugins in `backend/src/plugins/`:

| Plugin | Purpose |
|--------|---------|
| `auth.plugin.ts` | Session verification via Better Auth cookies |
| `rbac.plugin.ts` | Role-based access control decorators |
| `error-handler.plugin.ts` | Consistent error response formatting |

### Authentication Flow

```
Browser                Frontend              Backend
  │                       │                     │
  │   POST /login         │                     │
  │──────────────────────>│                     │
  │                       │  POST /api/auth/    │
  │                       │  sign-in/email      │
  │                       │────────────────────>│
  │                       │                     │ Better Auth validates
  │                       │   Set-Cookie:       │ credentials against
  │                       │   session_token     │ Account + User tables
  │                       │<────────────────────│
  │   Cookie stored       │                     │
  │<──────────────────────│                     │
  │                       │                     │
  │   GET /api/v1/...     │                     │
  │──────────────────────>│                     │
  │                       │  GET + Cookie       │
  │                       │────────────────────>│ authPlugin verifies
  │                       │   JSON response     │ session cookie
  │                       │<────────────────────│
  │   Render data         │                     │
  │<──────────────────────│                     │
```

### Database

- **ORM:** Prisma with MySQL
- **Schema:** `backend/prisma/schema.prisma`
- **Multi-tenancy:** All tenant data is scoped by `institutionId`

### External Services

| Service | Purpose | Resilience |
|---------|---------|------------|
| **SMTP** (Nodemailer) | Transactional emails | Circuit breaker (5 failures → 60s cooldown) |
| **MinIO** | Object storage (photos, PDFs) | Local Docker instance |
| **Redis** | Caching & rate limiting | Graceful degradation when unavailable |

---

## Frontend Architecture

### Code Splitting Strategy

Every page is **lazy-loaded** via `React.lazy` + `Suspense`, wrapped in a per-page `ErrorBoundary` using the `lazyPage()` utility:

```typescript
// lib/lazy-page.tsx
const DashboardPage = lazyPage(() => import('@/pages/dashboard/DashboardPage'));
```

This ensures:
- Each page is its own Vite chunk (downloaded on-demand)
- A crash in one page doesn't take down others
- A polished loading spinner is shown during chunk download

### Data Fetching

```
Component
    │
    ▼
useStudents() ─────────> React Query cache
    │                          │
    ▼                          ▼ (cache miss)
lib/queries/student/      Axios → /api/v1/student
student-queries.ts             │
                               ▼
                          Backend API
```

- **React Query** manages caching, refetching, and optimistic updates
- **Queries are modular:** split into domain-specific files under `lib/queries/`
- **Axios interceptors** handle timeouts and network errors

### State Management

| Store | Purpose |
|-------|---------|
| `auth.store.ts` | Current user session & role |
| `theme.store.ts` | Dark/light mode preference |
| `layout.store.ts` | Sidebar collapse state |
| `onboarding.store.ts` | Multi-step onboarding wizard state |

### Route Guards

| Guard | Purpose |
|-------|---------|
| `PublicRoute` | Redirects authenticated users to their dashboard |
| `ProtectedRoute` | Requires any valid session |
| `AdminRoute` | Requires `super_admin` or `admin` globalRole |

---

## Infrastructure

### Docker Compose (Development)

```yaml
services:
  db:     MySQL 8.0      → localhost:3306
  redis:  Redis 7-alpine → localhost:6379
  minio:  MinIO latest   → localhost:9000 (API), 9001 (Console)
```

### Production Dockerfiles

| Service | Base Image | Strategy |
|---------|------------|----------|
| Backend | `node:20-alpine` | Multi-stage build, non-root user, health check |
| Frontend | `nginx:alpine` | Vite build → static files served by Nginx |

---

## Key Design Decisions

1. **Better Auth over NextAuth/Passport** — lightweight, works natively with Fastify, cookie-based sessions
2. **Prisma over TypeORM/Drizzle** — type-safe schema, powerful migrations, excellent DX
3. **Fastify over Express** — faster, built-in validation, plugin system, OpenAPI support
4. **Zustand over Redux** — minimal boilerplate, no providers, simple API
5. **React Query over SWR** — richer devtools, mutation support, optimistic updates
6. **pnpm workspaces** — faster installs, strict dependency isolation
7. **Circuit breaker for SMTP** — prevents cascading failures when email service is down
