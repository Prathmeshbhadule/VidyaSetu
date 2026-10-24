# Vidya Setu - System Architecture Document

## 1. Executive Summary & Product Context

**Vidya Setu (विद्या सेतू)** is an offline-first learning and school management platform purpose-built for rural and remote schools across India. In typical rural schooling environments:
- Continuous internet connectivity is absent for days or weeks at a time.
- Power grids can be intermittent, running on solar backup or battery banks.
- A single shared tablet or low-spec Android device (2 GB RAM) serves an entire classroom or multi-grade cohort.
- Digital literacy among primary school students and guardians is minimal; language diversity demands native regional scripts (Hindi, Marathi, English) with voice and audio scaffolding.
- Strict data privacy guidelines under India's **Digital Personal Data Protection (DPDP) Act 2023** forbid unnecessary collection or retention of sensitive citizen identification numbers (e.g., Aadhaar).

To solve these constraints, Vidya Setu is engineered as a **three-tier offline-first distributed system**:
1. **Tier 1 (Student/Teacher Devices)**: Progressive Web Application (PWA) running on low-spec tablets and phones via Dexie.js (IndexedDB), Service Worker precaching, and Web Speech API. Every user write is local-first.
2. **Tier 2 (School Hub)**: Lightweight Node.js microservice running on a spare classroom desktop, laptop, or low-cost hardware (e.g., Raspberry Pi or Android via Termux). Serves local REST APIs, caches compressed media, and coordinates two-way synchronization over local Wi-Fi without internet.
3. **Tier 3 (Cloud API)**: Production-grade cloud service deployed on PostgreSQL 16, Redis/BullMQ, and MinIO/S3. Aggregates district-wide metrics, runs asynchronous FFmpeg video transcoding, and dispatches multi-channel parent notifications.

---

## 2. Three-Tier Architectural Topology

```mermaid
graph TD
  subgraph Tier1["Tier 1: Classroom Devices (Tablets, Phones)"]
    SW["Service Worker (Precache + Media)"]
    Dexie["IndexedDB (Dexie.js)"]
    ClientSync["Client Sync Manager (Outbox + HLC)"]
    PWA["React 18 PWA Shell"]
    PWA --> Dexie
    PWA --> ClientSync
    ClientSync --> Dexie
  end

  subgraph Tier2["Tier 2: School Hub (Classroom PC / Termux)"]
    HubAPI["Express REST API (Port 3002)"]
    SQLite["SQLite3 (WAL Mode, Busy Timeout)"]
    HubSync["Hub Two-Way Sync Engine"]
    ContentCache["Local Media Content Cache"]
    HubAPI --> SQLite
    HubSync --> SQLite
    HubAPI --> ContentCache
  end

  subgraph Tier3["Tier 3: Cloud Infrastructure"]
    CloudAPI["Express Cloud API (Port 3001)"]
    Postgres[(PostgreSQL 16 Multi-tenant)]
    RedisWorker["Redis + BullMQ Worker (FFmpeg Transcode)"]
    MinIO["MinIO / S3 Object Storage"]
    NotifEngine["Tiered Notification Engine"]
    CloudAPI --> Postgres
    CloudAPI --> RedisWorker
    CloudAPI --> MinIO
    CloudAPI --> NotifEngine
  end

  PWA -- "Local Wi-Fi HTTP\n(No Internet Required)" --> HubAPI
  HubSync -- "Opportunistic WAN HTTPS\n(When Internet Available)" --> CloudAPI
  PWA -. "Direct Cloud Sync\n(If Hub Unavailable)" .-> CloudAPI
```

---

## 3. Comprehensive UML Diagrams & Code Module Mappings

### 3.1. Use Case Diagram

The use case diagram illustrates user interactions across all five specialized personas: **Student**, **Teacher**, **Parent/Guardian**, **Content Administrator**, and **District Administrator**.

```mermaid
flowchart LR
  subgraph Actors
    S["Student"]
    T["Teacher"]
    P["Parent / Guardian"]
    CA["Content Administrator"]
    DA["District Administrator"]
  end

  subgraph Core_Student_Operations["Student Operations (Offline Tier 1)"]
    UC1["Pick Avatar & Enter 4-digit PIN"]
    UC2["Read Interactive Lesson (Text + Speech)"]
    UC3["Take Practice Quiz & Win Stars"]
    UC4["Adaptive Level Assessment (TaRL 1-5)"]
    UC5["View Learning Progress Journey"]
  end

  subgraph Core_Teacher_Operations["Teacher Operations (Offline/LAN)"]
    UC6["Daily Attendance Grid (Auto-present, 7-day window)"]
    UC7["TaRL Level Grouping & Activities"]
    UC8["At-Risk & Girl-Child Retention Monitoring"]
    UC9["Trigger School Hub Sync & Check Queue"]
  end

  subgraph Welfare_and_Notifications["Welfare & Parent Communication"]
    UC10["Browse Welfare Schemes & Eligibility Check"]
    UC11["Offline Document Checklist (Zero Aadhaar Storage)"]
    UC12["Print Checklist Slip / Notice"]
    UC13["Multi-channel Parent Notification Dispatch"]
  end

  subgraph Administration_Operations["District & Content Administration (Cloud Tier 3)"]
    UC14["Upload Video & Transcode 240p/360p"]
    UC15["Manage Lessons, Quizzes & Translations"]
    UC16["District Overview & School Sync Staleness"]
    UC17["Export District Performance CSV"]
  end

  S --> UC1
  S --> UC2
  S --> UC3
  S --> UC4
  S --> UC5
  S --> UC10
  S --> UC11

  T --> UC6
  T --> UC7
  T --> UC8
  T --> UC9
  T --> UC10
  T --> UC11
  T --> UC12

  P --> UC10
  P --> UC11
  P --> UC13

  CA --> UC14
  CA --> UC15

  DA --> UC16
  DA --> UC17
```

**Direct Code Module Mapping:**
- `UC1 - UC5`: `apps/web/src/screens/student/` (`StudentProfilePicker.tsx`, `StudentHome.tsx`, `LessonReaderScreen.tsx`, `QuizRunnerScreen.tsx`, `AdaptiveAssessmentScreen.tsx`).
- `UC6 - UC9`: `apps/web/src/screens/teacher/` (`TeacherAttendanceScreen.tsx`, `TeacherTaRLScreen.tsx`, `TeacherAtRiskScreen.tsx`, `TeacherHubStatusScreen.tsx`).
- `UC10 - UC12`: `apps/web/src/screens/schemes/SchemesBrowserScreen.tsx`, `packages/shared/src/domain/schemes.ts`.
- `UC13`: `apps/api/src/services/notification.service.ts` (4-tier fallback: On-Device -> Print Slip -> SMS -> Community Notice Board).
- `UC14 - UC15`: `apps/web/src/screens/admin/ContentAdminScreen.tsx`, `apps/api/src/services/content.service.ts`.
- `UC16 - UC17`: `apps/web/src/screens/district/DistrictDashboardScreen.tsx`, `apps/api/src/services/district.service.ts`.

---

### 3.2. Domain Class Diagram

Every entity in the Vidya Setu domain model inherits base synchronization metadata: `id` (RFC 9562 UUIDv7), `schoolId`, `createdAt`, `updatedAt`, `deletedAt` (soft delete), `version`, and `deviceId`.

```mermaid
classDiagram
  class BaseSyncEntity {
    +UUID id
    +UUID schoolId
    +DateTime createdAt
    +DateTime updatedAt
    +DateTime deletedAt
    +Int version
    +String deviceId
  }

  class District {
    +UUID id
    +String name
    +String code
    +String state
  }

  class School {
    +UUID id
    +String name
    +String registerNo
    +UUID districtId
    +String address
  }

  class User {
    +UUID id
    +String email
    +String passwordHash
    +UserRole role
    +SupportedLanguage language
  }

  class StudentProfile {
    +UUID id
    +String name
    +String prn
    +Int grade
    +Int assessedLevel
    +String pin
    +String avatar
    +Gender gender
    +String category
    +Boolean bplCard
  }

  class TeacherProfile {
    +UUID id
    +String name
    +String teacherId
    +UUID schoolId
  }

  class Attendance {
    +UUID id
    +UUID studentId
    +String date
    +AttendanceStatus status
    +String markedBy
    +String hlc
  }

  class AtRiskFlag {
    +UUID id
    +UUID studentId
    +String reason
    +String ruleId
    +DateTime raisedAt
    +DateTime resolvedAt
    +String resolvedBy
    +String note
  }

  class Lesson {
    +UUID id
    +String title
    +Subject subject
    +Int grade
    +Int level
    +Json contentBlocks
    +String audioUrl
    +ContentStatus status
  }

  class Quiz {
    +UUID id
    +UUID lessonId
    +String title
    +Int totalMarks
  }

  class QuizResult {
    +UUID id
    +UUID studentId
    +UUID quizId
    +Int score
    +Int assessedLevel
    +AssessmentMode mode
    +Json answers
    +DateTime submittedAt
  }

  class Scheme {
    +UUID id
    +String name
    +String description
    +Json eligibilityRules
    +List requiredDocuments
    +Boolean girlSpecific
    +Int attendanceThreshold
  }

  class SchemeChecklistProgress {
    +UUID id
    +UUID studentId
    +UUID schemeId
    +List checkedDocs
  }

  class ChangeLog {
    +BigInt seq
    +UUID id
    +String entity
    +UUID entityId
    +SyncOp op
    +UUID schoolId
    +Json payload
    +String hlc
    +DateTime receivedAt
  }

  BaseSyncEntity <|-- StudentProfile
  BaseSyncEntity <|-- TeacherProfile
  BaseSyncEntity <|-- Attendance
  BaseSyncEntity <|-- AtRiskFlag
  BaseSyncEntity <|-- Lesson
  BaseSyncEntity <|-- Quiz
  BaseSyncEntity <|-- QuizResult
  BaseSyncEntity <|-- Scheme
  BaseSyncEntity <|-- SchemeChecklistProgress

  District "1" -- "*" School : contains
  School "1" -- "*" StudentProfile : enrolls
  School "1" -- "*" TeacherProfile : employs
  StudentProfile "1" -- "*" Attendance : logs
  StudentProfile "1" -- "*" QuizResult : completes
  StudentProfile "1" -- "*" AtRiskFlag : flagged by
  StudentProfile "1" -- "*" SchemeChecklistProgress : tracks
  Lesson "1" -- "1" Quiz : has
  Scheme "1" -- "*" SchemeChecklistProgress : referenced in
  School "1" -- "*" ChangeLog : changes
```

**Direct Code Module Mapping:**
- Prisma Model Definitions: `apps/api/prisma/schema.prisma`.
- SQLite DDL Migrations: `apps/hub/src/db/migrations/001_initial_schema.sql`.
- IndexedDB Dexie Schema: `apps/web/src/db/offline-db.ts`.
- Core Shared Types: `packages/shared/src/types/index.ts`.

---

### 3.3. Package Diagram & Boundary Enforcement

The repository follows a clean, strict monorepo boundary managed by **pnpm workspaces**. Application packages are prohibited from cross-importing each other; all shared domain engines, schemas, and protocol definitions reside in `packages/shared`.

```mermaid
graph TD
  subgraph packages["Monorepo Packages"]
    Shared["packages/shared\n(Pure Domain Logic, Types, Schemas, Zod, HLC, i18n Locales)"]
  end

  subgraph apps["Monorepo Applications"]
    Web["apps/web\n(React 18 PWA, Dexie, Tailwind, TanStack Query)"]
    Hub["apps/hub\n(Node 20 Express, better-sqlite3, Hub Sync Engine)"]
    Api["apps/api\n(Node 20 Express, Prisma, BullMQ, Redis, PostgreSQL)"]
  end

  Web -->|imports| Shared
  Hub -->|imports| Shared
  Api -->|imports| Shared

  style Shared fill:#fef3c7,stroke:#d97706,stroke-width:2px;
  style Web fill:#dbeafe,stroke:#2563eb,stroke-width:2px;
  style Hub fill:#dcfce7,stroke:#16a34a,stroke-width:2px;
  style Api fill:#f3e8ff,stroke:#9333ea,stroke-width:2px;
```

**Layering Principles Enforced in Code:**
1. **Controllers** never interact directly with database models or query builders; they validate input with Zod and delegate to Services.
2. **Services** contain business logic (e.g., 7-day attendance edit window, TaRL staircase calculation, at-risk triggers) and invoke Repositories.
3. **Repositories** encapsulate raw ORM and SQL queries (Prisma for Cloud, `better-sqlite3` for Hub, Dexie for Web).
4. **Shared Package** contains zero external infrastructure dependencies (no database drivers, no DOM dependencies, 100% pure TypeScript).

---

### 3.4. Component Diagram

```mermaid
graph TB
  subgraph Client_App["Tier 1: Client Application (apps/web)"]
    UI["React UI (Screens & Components)"]
    AuthZ["useAuthStore (Zustand)"]
    SyncZ["useSyncStore (Zustand)"]
    SyncMgr["ClientSyncManager"]
    LocalDB[("Dexie.js IndexedDB")]

    UI --> AuthZ
    UI --> SyncZ
    UI --> SyncMgr
    SyncMgr --> LocalDB
    UI --> LocalDB
  end

  subgraph Hub_App["Tier 2: School Hub (apps/hub)"]
    HubRouter["Express Router (/api/v1)"]
    HubSyncSvc["HubSyncService"]
    HubDB[("better-sqlite3 WAL")]
    StreamController["Video Streaming Controller (HTTP Range)"]

    HubRouter --> HubSyncSvc
    HubRouter --> StreamController
    HubSyncSvc --> HubDB
  end

  subgraph Cloud_App["Tier 3: Cloud API (apps/api)"]
    CloudRouter["Express Router (/api/v1)"]
    AuthCtrl["Auth Controller (Argon2id + JWT)"]
    SyncCtrl["Sync Controller (/sync/push, /sync/pull)"]
    DistrictCtrl["District & Analytics Controller"]
    NotifCtrl["Notification Controller"]

    SyncEngine["Sync Service (Conflict Resolvers)"]
    BullWorker["BullMQ Worker (Video Transcoder)"]
    CloudDB[("PostgreSQL 16")]
    RedisCache[("Redis 7")]
    S3Storage[("MinIO / S3 Storage")]

    CloudRouter --> AuthCtrl
    CloudRouter --> SyncCtrl
    CloudRouter --> DistrictCtrl
    CloudRouter --> NotifCtrl

    SyncCtrl --> SyncEngine
    SyncEngine --> CloudDB
    DistrictCtrl --> CloudDB
    BullWorker --> RedisCache
    BullWorker --> S3Storage
  end

  SyncMgr -- "Push Batches & Pull Feed\n(Local Wi-Fi HTTP)" --> HubRouter
  HubSyncSvc -- "Outbox Push & Pull Feed\n(WAN HTTPS)" --> CloudRouter
  SyncMgr -. "Direct Fallback Sync\n(WAN HTTPS)" .-> CloudRouter
```

---

### 3.5. Composite Structure Diagram: School Hub Internal Architecture

The School Hub is an autonomous appliance designed to operate without internet supervision.

```mermaid
graph LR
  subgraph Hub_Appliance["School Hub Process (Node 20 / Termux)"]
    direction TB
    
    Port["Port 3002 Listener\n(Zero-config mDNS / Local IP)"]
    
    subgraph Core_Services["Core Services"]
      HS["HubSyncService\n(Server to Tablets, Client to Cloud)"]
      CM["ConnectivityMonitor\n(Active Heartbeat to Cloud)"]
      FS["FileStreamer\n(Chunked HTTP Range Requests)"]
    end

    subgraph Storage_Subsystem["Local Storage Subsystem"]
      SQLiteEngine["SQLite Engine (WAL Mode, Busy Timeout 5000ms)"]
      OutboxTable["hub_outbox (Priority Queue)"]
      ChangeLogTable["hub_change_log (Seq Increments)"]
      StaticMedia["Local Cache Directory (/media/content_packs)"]
    end

    Port --> HS
    Port --> FS
    HS --> SQLiteEngine
    HS --> OutboxTable
    HS --> ChangeLogTable
    CM --> HS
    FS --> StaticMedia
  end
```

**Key Operational Properties:**
- **Crash Resistance**: SQLite in `WAL` (Write-Ahead Logging) mode ensures immediate durability during sudden rural power cuts.
- **Dual Personality**: Acts as a **Server** when receiving tablet pushes, and as a **Client** when pushing outbox batches to the cloud.

---

### 3.6. Deployment Diagram

```mermaid
flowchart TB
  subgraph Rural_School["Physical Rural School Site (Offline Mesh Wi-Fi)"]
    Router["Low-cost Wi-Fi Router / Hotspot\n(No Internet Connection Required)"]
    
    PC["School Hub Machine\n(Refurbished PC / Laptop / Android Termux)\nNode 20 + SQLite WAL"]
    Tablet1["Student Tablet 1\n(Android 10+, 2GB RAM)\nChromium PWA"]
    Tablet2["Student Tablet 2\n(Android 10+, 2GB RAM)\nChromium PWA"]
    TeacherPhone["Teacher Smartphone\n(Android / iOS)\nChromium / Safari PWA"]

    Tablet1 <-->|Wi-Fi 802.11n HTTP| Router
    Tablet2 <-->|Wi-Fi 802.11n HTTP| Router
    TeacherPhone <-->|Wi-Fi 802.11n HTTP| Router
    Router <-->|Ethernet / Wi-Fi| PC
  end

  subgraph Cellular_Opportunity["Opportunistic WAN (When Cell Tower Available)"]
    Tower["2G / 3G / 4G Cellular Link\n(Intermittent, e.g. 1 hour / day)"]
  end

  subgraph Cloud_Datacenter["Cloud Production Infrastructure"]
    LB["Nginx Reverse Proxy / Load Balancer (HTTPS 443)"]
    AppAPI["Vidya Setu API Cluster (Docker Compose / K8s)"]
    PGNode[("PostgreSQL 16 Cluster")]
    RedisNode[("Redis 7 Queue Cluster")]
    MinIONode[("MinIO S3 Object Storage Cluster")]

    LB --> AppAPI
    AppAPI --> PGNode
    AppAPI --> RedisNode
    AppAPI --> MinIONode
  end

  PC -. "Opportunistic Encrypted Sync\n(JSON Batches <= 200)" .-> Tower
  Tower -.-> LB
```

---

### 3.7. State Transition Diagrams

#### 3.7.1. Student Adaptive Assessment Progression (TaRL staircase)

```mermaid
stateDiagram-v2
  [*] --> Level3_Start: Initialize Assessment (Default Level 3)
  
  Level3_Start --> Level4: Answer Correct
  Level3_Start --> Level2: Answer Incorrect

  Level4 --> Level5: Answer Correct
  Level4 --> Level3_Start: Answer Incorrect

  Level5 --> Level5: Answer Correct (Max Level Reached)
  Level5 --> Level4: Answer Incorrect

  Level2 --> Level3_Start: Answer Correct
  Level2 --> Level1: Answer Incorrect

  Level1 --> Level2: Answer Correct
  Level1 --> Level1: Answer Incorrect (Min Level Reached)

  Level1 --> Complete: 2 Consecutive Agree OR 8 Questions Reached
  Level2 --> Complete: 2 Consecutive Agree OR 8 Questions Reached
  Level3_Start --> Complete: 2 Consecutive Agree OR 8 Questions Reached
  Level4 --> Complete: 2 Consecutive Agree OR 8 Questions Reached
  Level5 --> Complete: 2 Consecutive Agree OR 8 Questions Reached

  Complete --> [*]: Persist Student AssessedLevel & Unlock Quizzes
```

#### 3.7.2. Outbox Mutation Lifecycle (Zero Data Loss)

```mermaid
stateDiagram-v2
  [*] --> PENDING: Mutation Written Locally (IndexedDB / SQLite)

  PENDING --> SYNCING: Sync Triggered (Online / Wi-Fi Hub detected)
  
  SYNCING --> APPLIED: Server Returns Status 'applied' or 'duplicate'
  SYNCING --> CONFLICT: Server Resolves Conflict via HLC / Policy
  SYNCING --> RETRY: Network Timeout or Hub Unreachable

  CONFLICT --> APPLIED: Winning State Reconciled & Applied
  RETRY --> PENDING: Exponential Backoff with Jitter
  
  APPLIED --> [*]: Delete from Outbox (Storage Reclaimed)
```

#### 3.7.3. Video Transcoding Lifecycle

```mermaid
stateDiagram-v2
  [*] --> UPLOADED: Admin Uploads Raw Video (MP4/MOV)
  
  UPLOADED --> QUEUED: BullMQ Job Dispatched to Redis
  
  QUEUED --> PROCESSING: Worker Spawns FFmpeg Process
  
  PROCESSING --> READY: 240p/360p H.264+AAC Produced (< 400 kbps), Thumbnail & SHA-256 Generated
  PROCESSING --> FAILED: Invalid Codec or Transcode Crash

  READY --> [*]: Packaged into Versioned Content Pack
  FAILED --> [*]: Log Error & Notify Admin
```

---

### 3.8. Activity Diagram: Offline Attendance to Cloud At-Risk Evaluation

This sequence illustrates how a teacher marks attendance without internet, how the outbox guarantees delivery, and how the cloud evaluates retention triggers.

```mermaid
flowchart TD
  Start([Teacher opens Attendance Screen on Tablet]) --> Step1[Load cached student list from IndexedDB]
  Step1 --> Step2[All students default to PRESENT in UI]
  Step2 --> Step3[Teacher taps to mark 3 absent students]
  Step3 --> Step4[Validate 7-day retrospective edit window]
  
  Step4 --> Step5[Generate RFC 9562 UUIDv7 and Hybrid Logical Clock timestamp]
  Step5 --> Step6[Atomic Dexie Transaction:\n1. Update local attendance table\n2. Enqueue OutboxItem with Priority 1]
  Step6 --> Step7[UI updates instantly with green 'Saved on Device' chip]
  
  Step7 --> Step8{Local Wi-Fi Hub\nReachable?}
  Step8 -- No --> WaitLocal[Keep in Outbox. Tablet operational offline]
  Step8 -- Yes --> Step9[Push batch to School Hub POST /sync/push]
  
  Step9 --> Step10[School Hub applies change to local SQLite\nand enqueues in hub_outbox]
  Step10 --> Step11{WAN Internet\nAvailable at Hub?}
  
  Step11 -- No --> WaitHub[Store in Hub SQLite. Available for local reports]
  Step11 -- Yes --> Step12[School Hub pushes batch to Cloud POST /sync/push]
  
  Step12 --> Step13[Cloud Sync Service applies Conflict Resolution Rules:\n- Teacher edit beats automated mark\n- HLC timestamp tie-breaker]
  Step13 --> Step14[Cloud commits to PostgreSQL change_logs and attendance table]
  
  Step14 --> Step15[Trigger At-Risk Rule Evaluator:\n- Check 30-day attendance < 75%\n- Check consecutive absences >= 5]
  
  Step15 --> Step16{Is Student At-Risk?}
  Step16 -- No --> Done([Sync Complete])
  Step16 -- Yes --> Step17[Create AtRiskFlag record & suggest Girl-Child Retention Schemes]
  Step17 --> Step18[Dispatch Multi-Tier Parent Notification:\n1. On-Device Alert\n2. Printable Slip\n3. SMS / Voice\n4. Community Notice Board]
  Step18 --> Done
```

---

## 4. Privacy, Security & DPDP Act 2023 Compliance

Vidya Setu strictly adheres to India's **Digital Personal Data Protection Act (2023)** and digital safety standards for minors:
1. **Zero Government ID Storage**: The platform **never collects, stores, transmits, or asks for** Aadhaar numbers, PAN numbers, or bank account numbers. Government welfare scheme eligibility helpers track only *document checklist readiness* (e.g., `["Aadhaar Card", "Ration Card", "Bank Passbook"]` with boolean checkmarks), storing no sensitive identifier strings.
2. **Local Multi-Student PIN Isolation**: Shared classroom tablets protect student accounts using a friendly visual avatar + 4-digit PIN verified against local salted credentials.
3. **Tenant & School Scoping**: All API queries, SQLite tables, and PostgreSQL relations enforce explicit `schoolId` scoping. Data cannot bleed across schools or administrative districts.
4. **Data Minimization & Right to Erasure**: Dedicated REST endpoints (`DELETE /api/v1/students/:id`, `GET /api/v1/students/:id/export`) allow immediate erasure of pupil records or machine-readable export upon guardian request.
