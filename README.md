<div align="center">

# 🎓 Vidyaverse Pro

**Comprehensive Educational Management Platform**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)](https://fastify.io/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*Manage institutions, students, ID cards, certificates, group photos, and more — all from one platform.*

</div>

---

## 🌟 The Educational Excellence Trio

This application is proudly part of an integrated trio of platforms designed to deliver complete educational excellence, working seamlessly together to manage, educate, and empower institutions:

1. **Vidyaverse Pro**: The core Educational Management Platform. Handles institutional administration, student records, ID cards, certificates, and operational workflows.
2. **PDLMS Pro**: The Digital Library Management System. Provides a comprehensive, multi-tenant digital library for students and institutions to access and manage educational resources.
3. **DigiClassroom Pro**: The AI-Powered Learning Engine. Delivers advanced document processing, Retrieval-Augmented Generation (RAG), and AI tutoring capabilities to transform static materials into interactive learning experiences.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Scripts](#-scripts)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **Institution Management** | Multi-tenant institution onboarding with branches, classes, streams, and sections |
| **Student Records** | Full CRUD, bulk CSV import, approval workflows, data-status tracking |
| **ID Card Generation** | Single & bulk generation with customizable templates |
| **Certificate Generation** | Event/achievement certificates with template support |
| **Group Photo Processing** | AI-powered face detection and student-face mapping |
| **Visionarium** | Test series creation, submissions, and grading |
| **Saathi Social** | Student social feed and connections |
| **User Management** | Role-based access control (Super Admin, Admin, Teacher, Student) |
| **Template Engine** | Centralized template system for ID cards, certificates, marksheets, and more |
| **Notifications** | In-app and email notifications with invitation system |

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Fastify 5 with TypeScript
- **ORM:** Prisma (MySQL)
- **Auth:** Better Auth with email/password credentials
- **Object Storage:** MinIO (S3-compatible)
- **Cache:** Redis 7
- **Email:** Nodemailer with circuit breaker resilience
- **Logging:** Pino
- **Validation:** Zod schemas

### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **Styling:** Tailwind CSS + CSS custom properties
- **Routing:** React Router v6 with lazy-loaded pages

### Infrastructure
- **Containers:** Docker Compose (MySQL, Redis, MinIO)
- **Code Quality:** ESLint, Husky pre-commit hooks, lint-staged
- **Testing:** Vitest

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────────┐ │
│  │ Dashboard │  │ Students │  │ ID Cards  │  │ Visionarium│ │
│  └──────────┘  └──────────┘  └───────────┘  └────────────┘ │
│                    React Router + React.lazy                  │
│                    Zustand + React Query                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────┴────────────────────────────────────┐
│                     Backend (Fastify)                         │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Auth   │  │  RBAC    │  │  Modules  │  │  Plugins   │  │
│  │(Better) │  │(Plugin)  │  │ (18 feat) │  │(Helmet,etc)│  │
│  └─────────┘  └──────────┘  └───────────┘  └────────────┘  │
│                         Prisma ORM                            │
└──────┬──────────────┬──────────────┬────────────────────────┘
       │              │              │
  ┌────┴────┐   ┌─────┴────┐  ┌─────┴─────┐
  │  MySQL  │   │  Redis   │  │   MinIO   │
  │  (DB)   │   │ (Cache)  │  │ (Storage) │
  └─────────┘   └──────────┘  └───────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.0
- **pnpm** ≥ 8.0
- **Docker Desktop** (for MySQL, Redis, MinIO)

### 1. Clone & Install

```bash
git clone <repo-url> vidyaverse-pro
cd vidyaverse-pro
pnpm install
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

This starts MySQL (3306), Redis (6379), and MinIO (9000/9001).

### 3. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your settings (see Environment Variables section)
```

### 4. Set Up Database

```bash
pnpm db:push       # Push schema to database
pnpm db:seed       # Seed default super admin user
```

### 5. Start Development

```bash
pnpm dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3002
- **API Docs:** http://localhost:3002/docs
- **MinIO Console:** http://localhost:9001

### Default Login

| Field | Value |
|-------|-------|
| Email | `thevinstitution@gmail.com` |
| Password | `Admin@123` |

---

## 📁 Project Structure

```
vidyaverse-pro/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Database seeder
│   ├── src/
│   │   ├── config/                # Environment, DB, Redis, MinIO config
│   │   ├── lib/                   # Auth setup
│   │   ├── modules/               # Feature modules (18 total)
│   │   │   ├── institution/       # Institution CRUD + onboarding
│   │   │   ├── student/           # Student records & bulk operations
│   │   │   ├── id-card/           # ID card generation
│   │   │   ├── certificate/       # Certificate generation
│   │   │   ├── group-photo/       # Group photo processing
│   │   │   ├── visionarium/       # Test series & submissions
│   │   │   ├── social/            # Saathi social features
│   │   │   └── ...                # More modules
│   │   ├── plugins/               # Fastify plugins (auth, RBAC, errors)
│   │   ├── schemas/               # Zod validation schemas
│   │   └── utils/                 # Logger, mailer, circuit-breaker, email templates
│   ├── Dockerfile
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/            # UI components (shadcn/ui, shared, layout)
│   │   ├── lib/
│   │   │   ├── queries/           # Modular React Query hooks
│   │   │   │   ├── student/       # Student queries
│   │   │   │   ├── institution/   # Institution, branch, class, section queries
│   │   │   │   ├── auth/          # User, profile, notification queries
│   │   │   │   ├── id-cards/      # ID card queries
│   │   │   │   ├── certificates/  # Certificate queries
│   │   │   │   ├── group-photo/   # Group photo queries
│   │   │   │   ├── templates/     # Template queries
│   │   │   │   └── shared/        # Shared types
│   │   │   ├── api.ts             # Axios instance with timeout & interceptors
│   │   │   ├── auth.client.ts     # Better Auth React client
│   │   │   └── lazy-page.tsx      # React.lazy + ErrorBoundary wrapper
│   │   ├── pages/                 # Route pages (lazy-loaded)
│   │   ├── stores/                # Zustand stores
│   │   └── App.tsx                # Router with code splitting
│   ├── Dockerfile
│   └── vite.config.ts
├── docker-compose.yml             # Development infrastructure
├── docker-compose.prod.yml        # Production deployment
├── pnpm-workspace.yaml
└── package.json
```

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both frontend and backend in development mode |
| `pnpm build` | Build both packages for production |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm test` | Run tests across all packages |
| `pnpm type-check` | TypeScript type checking |
| `pnpm docker:up` | Start Docker containers (MySQL, Redis, MinIO) |
| `pnpm docker:down` | Stop Docker containers |
| `pnpm db:push` | Push Prisma schema to database |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed database with default data |

---

## 🔐 Environment Variables

Create `backend/.env` from the example and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend server port | `3002` |
| `DATABASE_URL` | MySQL connection string | `mysql://...` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | — |
| `BETTER_AUTH_SECRET` | Better Auth encryption key | — |
| `BETTER_AUTH_URL` | Auth server base URL | `http://localhost:3002` |
| `FRONTEND_URL` | Frontend URL for CORS/emails | `http://localhost:5173` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASSWORD` | SMTP password (App Password) | — |
| `EMAIL_FROM` | Sender email address | — |
| `MINIO_ENDPOINT` | MinIO endpoint | `localhost` |
| `MINIO_PORT` | MinIO port | `9000` |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadmin123` |
| `MAX_UPLOAD_SIZE_MB` | Max file upload size | `50` |

---

## 📖 API Documentation

Once the server is running, visit **http://localhost:3002/docs** for interactive Swagger/OpenAPI documentation.

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/sign-in/email` | Sign in with email/password |
| `GET` | `/api/v1/institution` | List institutions |
| `POST` | `/api/v1/institution` | Create institution |
| `GET` | `/api/v1/student` | List students (paginated) |
| `POST` | `/api/v1/student/bulk-csv` | Bulk import students from CSV |
| `POST` | `/api/v1/id-card/generate` | Generate an ID card |
| `POST` | `/api/v1/certificates` | Create a certificate |
| `GET` | `/api/v1/system/health` | Health check |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality

- Pre-commit hooks run ESLint automatically via Husky
- TypeScript strict mode is enforced
- All API inputs are validated with Zod schemas

---

<div align="center">

**Built with ❤️ by the Vidyaverse team**

</div>
