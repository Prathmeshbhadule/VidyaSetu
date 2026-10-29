# Vidya Setu (विद्या सेतू)

<div align="center">

**A Production-Grade, Offline-First Digital Learning & School Hub Platform Purpose-Built for Rural and Remote Schools Across India.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4_Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3_PWA-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-Workspaces-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Dexie.js](https://img.shields.io/badge/Storage-IndexedDB_Dexie-purple)](https://dexie.org/)
[![Offline First](https://img.shields.io/badge/Architecture-Offline--First-2ea44f)](docs/architecture.md)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

[Architecture](docs/architecture.md) • [Teacher Quickstart](docs/teacher-quickstart.md) • [Runbook & Deployments](docs/runbook.md) • [ADRs](docs/adr/) • [Assumptions](docs/ASSUMPTIONS.md)

</div>

---

## 📖 Table of Contents

- [The Ground Reality & Problem](#-the-ground-reality--problem)
- [System Architecture (Three-Tier)](#-system-architecture-three-tier)
- [Key Innovations & Feature Matrix](#-key-innovations--feature-matrix)
  - [1. Student Learning Portal](#1-student-learning-portal)
  - [2. Teacher Hub & Classroom Management](#2-teacher-hub--classroom-management)
  - [3. Guardian / Parent Portal](#3-guardian--parent-portal)
  - [4. Content Studio & Curriculum Admin](#4-content-studio--curriculum-admin)
  - [5. District Education Officer (DEO) Analytics](#5-district-education-officer-deo-analytics)
- [Design System & Accessibility](#-design-system--accessibility)
- [Two-Way Synchronization Protocol](#-two-way-synchronization-protocol)
- [Security & DPDP Act 2023 Compliance](#-security--dpdp-act-2023-compliance)
- [Monorepo Project Structure](#-monorepo-project-structure)
- [Quick Start Guide](#-quick-start-guide)
- [Demo Credentials](#-demo-credentials)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Documentation Index](#-documentation-index)
- [License](#-license)

---

## 🌍 The Ground Reality & Problem

Primary schools located in remote villages and tribal hamlets across India face compounding infrastructural challenges that render cloud-dependent EdTech platforms unusable:

1. **Intermittent or Absent Connectivity**: Cellular networks (2G/3G/spotty 4G) fluctuate constantly; power cuts can knock out communication for consecutive days or weeks. Educational software **must operate completely offline by default**.
2. **Device Scarcity in Multi-Grade Classrooms**: A single classroom often shares one or two low-spec Android tablets (typically 2GB RAM) across 20 to 40 students in varying age cohorts (Class 1 to Class 5).
3. **Language Barriers & Emerging Literacy**: Children speak regional languages (**Marathi**, **Hindi**) and require visual, voice-assisted interfaces rather than dense text menus.
4. **Data Privacy (DPDP Act 2023)**: Strict protection for minors' records — **zero collection or storage of national identity numbers (Aadhaar)**, strict school-tenant isolation, and complete parent access rights.

**Vidya Setu** solves these constraints through a resilient, three-tier local mesh architecture. Every reading activity, video playback, attendance check, and quiz evaluation executes locally on classroom tablets without touching the internet. Data synchronizes opportunistically whenever school Wi-Fi or cellular connectivity becomes available.

---

## 🏛️ System Architecture (Three-Tier)

Vidya Setu distributes computing and storage across three tiers to guarantee 100% operational uptime regardless of WAN status:

```
+---------------------------------------------------------------------------------------+
|  Tier 1: Classroom Devices (Tablets, Smartphones, Laptops)                            |
|  React 18 PWA • Dexie.js (IndexedDB) • Web Speech Voice API • Outbox Mutation Engine  |
|  Role-Isolated Portals: Student • Teacher • Guardian • Content Admin • District Admin |
+---------------------------------------------------------------------------------------+
                                           │
                        Local Wi-Fi HTTP   │   (Zero Internet Required)
                        Port 3002 / Range  ▼
+---------------------------------------------------------------------------------------+
|  Tier 2: School Hub (Classroom PC, Old Laptop, or Android Phone via Termux)           |
|  Node.js 20 • Express • better-sqlite3 (WAL Mode) • Local H.264 Video Range Server    |
|  P2P Peer Sync Adapter • Transactional Outbox Engine • Sneakernet USB Backup Export   |
+---------------------------------------------------------------------------------------+
                                           │
                        Opportunistic WAN  │   (When Cellular / Wi-Fi Becomes Available)
                        HTTPS Port 3001    ▼
+---------------------------------------------------------------------------------------+
|  Tier 3: Cloud Infrastructure (State / District Data Center)                          |
|  Express REST API • PostgreSQL 16 (Prisma ORM) • Redis 7 • BullMQ Background Workers  |
|  MinIO / S3 Object Store • Multi-Channel Alerts (SMS, Slip, On-Device, Notice Board)  |
+---------------------------------------------------------------------------------------+
```

### Tier Highlights
- **Tier 1 (Classroom PWA)**: Installable Progressive Web App. Stores lessons, student profiles, attendance, and quiz submissions in browser IndexedDB (`Dexie.js`). Operates seamlessly in airplane mode.
- **Tier 2 (School Hub)**: Lightweight service runnable on any hardware with Node 20. Serves local offline video files via HTTP 206 Partial Content range requests, caches curriculum bundles, and mediates tablet-to-tablet sync.
- **Tier 3 (Cloud API)**: Central district aggregation platform. Runs asynchronous video transcoding workers (FFmpeg), handles district-wide analytics, and generates welfare scheme compliance digests.

---

## 🚀 Key Innovations & Feature Matrix

### 1. Student Learning Portal
- **Dual Login Modes for Rural Realities**:
  - **Individual Student Login**: Roll number / PRN with a memorable 4-digit PIN for personalized tracking.
  - **Whole-Class Batch Mode**: 1-click grade access (`Class 1`, `Class 2`, `Class 3`, `Class 4`, `Class 5`) designed for shared single-tablet classrooms where individual PIN entry would slow down instruction.
- **Offline Video Lectures**: 240p/360p lightweight video player with scrub controls, resume capability, and local IndexedDB file support.
- **Daily Practice Problems (DPP) & Quizzes**: Linked post-lecture assessments with instant visual feedback, answer explanations, and dynamic mastery scoring.
- **Vernacular E-Library & Study Materials**: Access Balbharati textbooks, handwritten teacher notes, and printable worksheets completely offline.
- **Gamified Progress Tracking**: Attendance streak tracking, star badges, and adaptive level indicators tailored to build student motivation.

### 2. Teacher Hub & Classroom Management
- **60-Second Visual Attendance**: One-tap roster recording (Present, Absent, Late) with automatic offline outbox enqueuing.
- **Teaching at the Right Level (TaRL)**: Automatic diagnostic grouping of students based on foundational numeracy and literacy competency levels (Level 1 to Level 5) rather than chronological age.
- **Welfare Scheme Eligibility Tracker**: Document readiness checklists for state schemes (e.g., Savitribai Phule scholarship, Midday Meal program, bicycle distribution) without storing sensitive national IDs.
- **Hub Synchronization Monitor**: Visual diagnostics indicating outbox mutation count, peer connection status, and last synced timestamp.

### 3. Guardian / Parent Portal
- **Child Attendance & Academic Digest**: Simple cards communicating child progress in clear terms.
- **Multilingual Audio Read-Aloud**: Voice synthesis in Marathi and Hindi for non-reading parents to listen to school circulars, performance summaries, and welfare notifications.
- **Multi-Channel Delivery Support**: Works with on-device digests, printable slips for village notice boards, and SMS summaries.

### 4. Content Studio & Curriculum Admin
- **Direct Local Video Upload**: Faculty can upload actual video files (`.mp4`, `.webm`) directly from disk; stored persistently in browser storage and school hub cache.
- **Manual Question & DPP Builder**: Create interactive questions, multiple options, correct answer keys, and pedagogical explanations.
- **Offline Study Materials Publisher**: Upload textbook PDFs, reading passages, and worksheet notes.
- **Full Asset Lifecycle & Deletion Management**: Direct deletion of lessons, videos, quizzes, and materials from Content Admin with instant synchronization across student tablets (no zombie re-seeding).

### 5. District Education Officer (DEO) Analytics
- **Cross-School Diagnostic Dashboard**: Aggregated attendance averages, dropout risks, and syllabus coverage rates across talukas and districts.
- **Early Warning Flags**: Rule-based detection of chronic student absenteeism or declining TaRL milestones.

---

## 🎨 Design System & Accessibility

Vidya Setu incorporates a human-centered, education-focused design language adhering to **WCAG 2.2 AA** accessibility guidelines:

- **Light & Dark Theme Engine**:
  - Instant theme toggle (`Sun` / `Moon`) accessible in the header on all screens.
  - Persistent preference in `localStorage` with a zero-flash pre-hydration script in `index.html`.
  - Contrast ratios calibrated for both bright daylight classroom visibility and dim low-light settings.
- **Multilingual Localization**:
  - Dynamic runtime switching between **English**, **मराठी (Marathi)**, and **हिंदी (Hindi)** via `react-i18next`.
  - Consistent educational terminology tailored to Indian state curricula.
- **Audio Assistance**:
  - Integrated `AudioHelpButton` leveraging the browser Web Speech API for auditory instructions on every major screen.
- **Touch-Friendly Controls**:
  - Minimum 48px touch targets for small fingers and low-precision touchscreen tablets.
  - High-visibility badges, status pills, and clear visual hierarchy.

---

## 🔄 Two-Way Synchronization Protocol

The synchronization protocol ensures consistency across intermittently connected devices without blocking the user:

```
[Tablet Action] ──► [Dexie DB Mutation] + [Outbox Queue Entry] (Atomic Transaction)
                               │
               (When Local Hub or Wi-Fi Detected)
                               ▼
            POST /sync/push (Batches of <= 200 items)
                               │
            GET /sync/pull?since=<hlc_cursor> (Delta Feed)
                               │
                   [Apply Conflict Rules]
```

### Deterministic Conflict Resolution Matrix

| Entity | Conflict Strategy | Rationale |
| :--- | :--- | :--- |
| **QuizResult** | **Append-Only** | Every student submission is an immutable event; deduplicated by UUIDv7. |
| **Attendance** | **Last-Writer-Wins (HLC)** | Hybrid Logical Clocks causally resolve edits; teacher edits supersede automated scans. |
| **Student Level (TaRL)** | **Monotonic Max** | Level progression merges using `Math.max(local, remote)` to preserve learning achievements. |
| **Curriculum & Videos** | **Server Authoritative** | Hub or cloud content studio publishes master version; tablets pull updates. |
| **AtRiskFlag** | **Deterministic Derivation** | Flags derive from attendance data; manual teacher resolutions take priority. |

---

## 🔒 Security & DPDP Act 2023 Compliance

Vidya Setu implements strict privacy-by-design principles complying with India's **Digital Personal Data Protection (DPDP) Act 2023**:

- **Zero Aadhaar / National ID Storage**: Document checklists only record boolean readiness (`["Ration Card", "Bank Passbook"]`). Government identity numbers are never requested, stored, or transmitted.
- **Multi-Tenant Isolation**: Every database query, cache key, and sync batch is strictly scoped to the tenant's `schoolId`.
- **Role-Based Access Control (`RoleGuard`)**: Strict isolation across `/student/*`, `/teacher/*`, `/parent/*`, `/admin/*`, and `/district/*` routes prevents unauthorized access.
- **Student Data Rights**: Built-in support for complete student profile export (`GET /api/v1/students/:id/export`) and right to erasure (`DELETE /api/v1/students/:id`).
- **Cryptographic Device Tokens**: Tablets pair with School Hubs using one-time verification tokens and authenticate with revocable HMAC-SHA256 signatures.

---

## 📂 Monorepo Project Structure

```
vidya-setu/
├── apps/
│   ├── web/                     # Tier 1: React 18 PWA (Vite, Dexie, Tailwind, Zustand)
│   │   ├── src/
│   │   │   ├── components/      # UI components (Header, ThemeToggle, RoleGuard, VideoPlayer)
│   │   │   ├── db/              # Dexie.js offline schema & one-time content seeder
│   │   │   ├── screens/         # Student, Teacher, Guardian, Content Admin, Auth screens
│   │   │   ├── services/        # ClientSyncManager, HLC Clock, Audio Synthesizer
│   │   │   └── store/           # Zustand Auth & Theme Stores
│   ├── hub/                     # Tier 2: School Hub Service (Node 20, Express, SQLite WAL)
│   │   ├── src/
│   │   │   ├── db/              # better-sqlite3 database manager & migrations
│   │   │   ├── routes/          # Local video streaming, sync push/pull, health endpoints
│   │   │   └── services/        # HubSyncEngine, WAN forwarder, sneakernet backup
│   └── api/                     # Tier 3: Cloud Platform API (Node 20, Express, Prisma)
│       ├── prisma/              # PostgreSQL schema & migrations
│       └── src/
│           ├── controllers/     # Multi-tenant REST endpoints
│           ├── workers/         # BullMQ FFmpeg transcode & notification dispatchers
│           └── services/        # S3/MinIO upload service, Argon2 auth
├── packages/
│   └── shared/                  # Domain contracts, TaRL logic, HLC clock, schemas, types
├── docs/                        # Architecture specs, ADRs, runbooks, teacher guides
│   ├── adr/                     # Architecture Decision Records (001-004)
│   ├── architecture.md          # Complete architectural specification & UML diagrams
│   ├── runbook.md               # Hardware setup, Termux instructions & disaster recovery
│   ├── teacher-quickstart.md    # 60-second teacher operational manual
│   └── ASSUMPTIONS.md           # Domain & architectural baseline assumptions
├── scripts/                     # PowerShell & Bash backup, restore & seed utilities
├── docker-compose.yml           # Complete containerized multi-tier stack
└── package.json                 # Monorepo workspace configuration (pnpm)
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: `v20.x LTS` or higher
- **pnpm**: `v9.x` (`npm install -g pnpm`)
- **Git**

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Prathmeshbhadule/VidyaSetu.git
cd VidyaSetu

# Install dependencies across all monorepo workspaces
pnpm install

# Build shared types, hub service, and web application
pnpm build
```

### 2. Launch Local Development Services

You can run individual workspaces or launch the parallel dev stack:

```bash
# Option A: Start the Web PWA (Tier 1)
pnpm dev:web
# -> Runs on http://localhost:5180 (or http://localhost:5173)

# Option B: Start the School Hub Service (Tier 2)
pnpm dev:hub
# -> Runs on http://localhost:3002

# Option C: Start the Cloud API (Tier 3)
pnpm dev:api
# -> Runs on http://localhost:3001

# Option D: Launch all services concurrently
pnpm dev
```

### 3. Containerized Deployment (Docker Compose)

For running the complete end-to-end cloud environment including PostgreSQL, Redis, MinIO, and BullMQ workers:

```bash
docker compose up -d
```

| Service | Endpoint | Purpose |
| :--- | :--- | :--- |
| **Web PWA** | `http://localhost:8080` | Client application |
| **School Hub** | `http://localhost:3002` | Local school server |
| **Cloud API** | `http://localhost:3001` | Central API server |
| **MinIO Console** | `http://localhost:9001` | S3 Object Store Console |

---

## 🔑 Demo Credentials

The platform is pre-seeded with representative personas for immediate hands-on testing:

| Portal | Role | Username / Identifier | Password / PIN | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Individual Student | `Aarav Patil` (PRN: `STU-2026-001`) | `1234` | Grade 3, Level 3 Scholar |
| **Student** | Whole Class Mode | `इयत्ता ३ री (Class 3)` | *No PIN needed* | 1-Click Batch Classroom Mode |
| **Teacher** | Primary Educator | `teacher@vidyasetu.org` | `VidyaSetu#2026` | Sunil Patil, ZP Primary School |
| **Parent** | Guardian | `parent@vidyasetu.org` | `VidyaSetu#2026` | Ramesh Patil (Aarav's Guardian) |
| **Admin** | Content Studio | `content@vidyasetu.org` | `VidyaSetu#2026` | Curriculum Author & Media Creator |
| **Admin** | District Admin (DEO) | `district@vidyasetu.org` | `VidyaSetu#2026` | Pune District Education Officer |

---

## 🧪 Testing & Quality Assurance

Vidya Setu maintains rigorous test coverage spanning pure domain math, offline IndexedDB lifecycle, SQLite persistence, and Cloud API integrations:

```bash
# Run all unit and integration test suites
pnpm test

# Test specific packages
pnpm --filter @vidya-setu/shared test  # Pure domain, TaRL, and HLC clock tests
pnpm --filter @vidya-setu/hub test     # School Hub SQLite & sync endpoint tests
pnpm --filter @vidya-setu/web test     # Web PWA offline storage & i18n tests
pnpm --filter @vidya-setu/api test     # Cloud API Supertest integration tests
```

---

## 📚 Documentation Index

For deep architectural dives and field operation guides, consult the `docs/` repository:

- 📐 [System Architecture & Complete UML Specifications](docs/architecture.md)
- 🛠️ [School Hub Setup, Termux, & Sneakernet Runbook](docs/runbook.md)
- 👩‍🏫 [Teacher 60-Second Classroom Quickstart Guide](docs/teacher-quickstart.md)
- 📝 [Architecture Decision Records (ADR 001 - 004)](docs/adr/)
- 📌 [System Assumptions & Field Constraints](docs/ASSUMPTIONS.md)

---

## 📄 License

Vidya Setu is open-source software licensed under the [Apache License, Version 2.0](LICENSE).
