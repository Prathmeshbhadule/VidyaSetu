# Vidya Setu (विद्या सेतू)

> **A production-grade, offline-first digital learning and school management platform purpose-built for rural and remote schools across India.**

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![pnpm Monorepo](https://img.shields.io/badge/pnpm-Workspaces-orange.svg)](https://pnpm.io/)
[![Offline First](https://img.shields.io/badge/Architecture-Offline--First-green.svg)](docs/architecture.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Product Overview

Rural schools across India operate in extreme environments:
- **Zero Internet for Days or Weeks**: Continuous network availability is rare; applications must run fully disconnected by default.
- **Shared Low-Spec Devices**: One or two 2 GB Android tablets per multi-grade classroom; multiple students log in on the same physical device.
- **Multilingual & Low Literacy**: Intuitive visual interfaces in regional languages (**Hindi**, **Marathi**, **English**) with Web Speech audio narration for non-reading children.
- **Data Protection Compliance (DPDP Act 2023)**: Strict privacy protection for minors — **zero collection or storage of Aadhaar numbers**.

Vidya Setu bridges this gap by decoupling student and teacher daily workflows from internet connectivity. Every action succeeds locally first, writes to local persistent storage (IndexedDB / SQLite), and synchronizes opportunistically whenever school Wi-Fi or cellular connections are available.

---

## 🏛️ Three-Tier Architecture

```
+-----------------------------------------------------------------------------------+
| Tier 1: Classroom Devices (Tablets, Phones)                                      |
| React 18 PWA • Dexie.js (IndexedDB) • Service Worker • Web Speech • Outbox Engine |
+-----------------------------------------------------------------------------------+
                                         │
                   Local Wi-Fi HTTP      │ (No Internet Required)
                   Port 3002             ▼
+-----------------------------------------------------------------------------------+
| Tier 2: School Hub (Classroom PC / Android Termux)                                |
| Node.js 20 • Express • better-sqlite3 (WAL Mode) • Local Media Cache • Outbox     |
+-----------------------------------------------------------------------------------+
                                         │
                   Opportunistic WAN     │ (When Cellular / Internet Available)
                   HTTPS Port 3001       ▼
+-----------------------------------------------------------------------------------+
| Tier 3: Cloud Infrastructure                                                      |
| Express REST API • PostgreSQL 16 • Redis 7 • BullMQ (FFmpeg) • MinIO Object Store  |
+-----------------------------------------------------------------------------------+
```

1. **Tier 1 (Devices)**: React 18 PWA running on Android tablets. Stores lessons, quizzes, adaptive scores, and attendance in IndexedDB (`Dexie.js`).
2. **Tier 2 (School Hub)**: Lightweight Node service running on any spare classroom PC, laptop, or Android device via Termux. Exposes local REST APIs, streams 240p/360p H.264 video with HTTP Range requests, and maintains an outbox for two-way synchronization.
3. **Tier 3 (Cloud API)**: Production-grade cloud platform running PostgreSQL 16, Redis, BullMQ async transcode worker, and multi-tier notification adapters (On-device, Printable slip, SMS/IVR, Community Notice Board).

---

## 📦 Monorepo Structure

```
vidya-setu/
├── apps/
│   ├── web/           # React 18 PWA (Vite, Dexie, Tailwind, Zustand, TanStack Query, i18next)
│   ├── hub/           # School Hub Service (Node 20, Express, better-sqlite3, HubSyncEngine)
│   └── api/           # Cloud API (Node 20, Express, Prisma, PostgreSQL 16, BullMQ, Redis, Argon2)
├── packages/
│   └── shared/        # Pure domain logic: Adaptive TaRL, HLC clocks, conflict rules, schemas, locales
├── docs/
│   ├── architecture.md       # 8 UML diagrams, component mapping, DPDP compliance
│   ├── runbook.md            # Hub PC & Termux setup, backup/restore, sneakernet USB distribution
│   ├── teacher-quickstart.md # 60-second attendance, TaRL level grouping, welfare scheme checklist
│   ├── ASSUMPTIONS.md        # Core architectural & domain decisions
│   └── adr/                  # Architecture Decision Records (001-004)
├── scripts/           # PowerShell and Bash backup/restore scripts for SQLite & PostgreSQL
└── docker-compose.yml # Containerized stack (api, postgres, redis, minio, hub, web)
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 20 LTS
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose (optional, for full cloud stack)

### 1. Installation & Build

```bash
# Clone the repository
git clone https://github.com/vidyasetu/vidya-setu.git
cd vidya-setu

# Install workspace dependencies
pnpm install

# Build shared library, hub, api, and web PWA
pnpm build
```

### 2. Running Test Suites

Run unit, property-based, and integration test suites across all workspaces:

```bash
# Run all tests monorepo-wide
pnpm test

# Test individual packages
pnpm --filter @vidya-setu/shared test  # Pure domain & conflict tests (46 tests)
pnpm --filter @vidya-setu/hub test     # School Hub SQLite tests (7 tests)
pnpm --filter @vidya-setu/api test     # Cloud API Supertest integration (10 tests)
pnpm --filter @vidya-setu/web test     # Web PWA offline DB & i18n tests (7 tests)
```

### 3. Running Applications Locally

#### Launch School Hub (Tier 2):
```bash
cd apps/hub
node dist/server.js
# School Hub starts on http://localhost:3002
```

#### Launch Web Application (Tier 1):
```bash
cd apps/web
pnpm dev
# PWA opens on http://localhost:5173
```

#### Launch Cloud Stack via Docker Compose (Tier 3):
```bash
docker compose up -d
# Cloud API: http://localhost:3001
# Web PWA:   http://localhost:8080
# MinIO:     http://localhost:9001
```

---

## 👥 Demo Personas & Default Credentials

The platform is seeded with realistic demonstration personas for immediate evaluation:

| Role | Username / Identifier | Password / PIN | Description |
| :--- | :--- | :--- | :--- |
| **Teacher** | `teacher@vidyasetu.org` | `VidyaSetu#2026` | Sunil Patil, Zilla Parishad Primary School |
| **District Admin** | `district@vidyasetu.org` | `VidyaSetu#2026` | Pune District Education Officer |
| **Content Admin** | `content@vidyasetu.org` | `VidyaSetu#2026` | Curriculum Author & Media Specialist |
| **Student 1** | Aarav Patil (Grade 3) | `1234` | Avatar: 🦁 Lion |
| **Student 2** | Priya Sharma (Grade 4) | `5678` | Avatar: 🐘 Elephant |
| **Student 3** | Ananya Shinde (Grade 2) | `1111` | Avatar: 🦚 Peacock |

---

## 🔄 Two-Way Synchronization Protocol

- **Transactional Outbox**: Every mutation writes to local IndexedDB/SQLite and an outbox queue in a single atomic transaction. Sync never blocks user actions.
- **Push (`POST /sync/push`)**: Bounded batches of at most 200 items. Change ID acts as an idempotency key.
- **Pull (`GET /sync/pull?since=<seq>`)**: Cursor-based delta feed tracking changes with monotonic sequence IDs and soft-delete tombstones.
- **Hybrid Logical Clocks (HLC)**: Orders concurrent writes causally without relying on unsynchronized tablet hardware clocks.
- **Conflict Resolution Rules**:
  - `QuizResult`: Append-only, deduplicated by ID, never conflicts.
  - `Attendance`: Last-Writer-Wins using HLC; teacher edits always supersede automated records.
  - `Student Progress`: Merged with `Math.max()` for scores/levels and set union for lesson milestones.
  - `Curriculum & Schemes`: Server-authoritative (read-only on tablets).
  - `AtRiskFlag`: Derived deterministically; manual teacher follow-ups resolve as Last-Writer-Wins.

---

## 🔒 Security & Privacy (DPDP Act 2023)

- **Zero Aadhaar/Government ID Storage**: Document checklists only record whether a document is ready (`["Ration Card", "Passbook"]`), never recording government identification numbers.
- **Multi-Tenant Scoping**: All database queries and sync feeds are strictly scoped to the user's `schoolId` and district.
- **Student Data Rights**: Full support for student data export (`GET /api/v1/students/:id/export`) and right to erasure (`DELETE /api/v1/students/:id`).
- **Cryptographic Device Pairing**: Tablets pair with the School Hub using a one-time pairing code and receive revocable HMAC-SHA256 device tokens.

---

## 📚 Documentation Links

- [System Architecture & UML Diagrams](docs/architecture.md)
- [Operational Runbook & Backups](docs/runbook.md)
- [Teacher Quickstart Guide](docs/teacher-quickstart.md)
- [Architecture Decision Records (ADRs)](docs/adr/)
- [Domain & Design Assumptions](docs/ASSUMPTIONS.md)

---

## 📄 License

Vidya Setu is open-source software licensed under the [MIT License](LICENSE).
#   V i d y a S e t u  
 