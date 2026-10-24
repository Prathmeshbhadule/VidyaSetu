# Vidya Setu - Architectural & Product Assumptions

This document records architectural, design, and domain assumptions made during the design and implementation of **Vidya Setu**, as instructed by the execution guidelines.

---

## 1. Domain & Architecture Assumptions

1. **Three-Tier Hierarchy & Offline Continuity**:
   - **Tier 1 (Student / Teacher PWA)**: Runs in browser/Android WebView with Dexie.js (IndexedDB). All mutations write to IndexedDB and an outbox queue atomically. The PWA assumes zero internet connectivity by default and will operate autonomously for at least 30 consecutive days without cloud connectivity.
   - **Tier 2 (School Hub)**: Node.js service running on a low-spec PC or Android via Termux on school LAN. Acts as an offline gateway, local content cache, and sync bridge using `better-sqlite3`. Exposes the exact same sync protocol as the Cloud API.
   - **Tier 3 (Cloud API)**: Express API backed by PostgreSQL, Redis (BullMQ), and MinIO/S3. Hub and high-privilege portals (District Admin, Content Admin, Parent Portal) synchronize with the Cloud.

2. **Entity Identity and Hybrid Logical Clocks (HLC)**:
   - Every synchronized record uses a client-generated UUIDv7 (`id`) to preserve chronological locality without central server coordination.
   - Because device wall clocks in rural areas are notoriously unreliable (e.g. flat RTC batteries, manual clock tampering), we use Hybrid Logical Clocks (`hlc` string format: `<physical_ms>:<counter>:<nodeId>`) to order changes deterministically across devices.
   - The Hub and Cloud both stamp `receivedAt` (server-side wall clock ISO timestamp) upon ingestion.

3. **Multi-Tenant Isolation**:
   - All school-level entities carry a mandatory `schoolId`. All database queries and repositories enforce tenant filtering.
   - District Administrators have access to schools within their assigned `districtId`.
   - Content Administrators have global content curation scope.

4. **Security & Privacy (DPDP Act 2023 Compliance)**:
   - In compliance with the Digital Personal Data Protection Act 2023 (India), no biometric data, national ID numbers (such as Aadhaar), or ad trackers are ever accepted or stored.
   - Government scheme checklists only store boolean check states for document readiness (e.g., `aadhaarCardReady: true`), never document numbers or scanned attachments.
   - Student profiles include explicit `parentalConsent` flags, export functionality (`/api/v1/students/:id/export`), and verifiable data purge (`/api/v1/students/:id`).
   - LAN communication between PWA devices and the Hub uses HMAC-SHA256 batch request signing with paired device tokens to prevent unauthorized data tampering on open Wi-Fi.

5. **Notification Delivery Tiers**:
   - In rural areas where mobile network penetration is inconsistent and guardian phone numbers are frequently outdated or unavailable, notifications use a 4-tier fallback:
     1. On-device in-app notification when the student logs into the shared tablet.
     2. Printable physical slip (PDF) for teachers to hand to students.
     3. SMS / Voice IVR via provider-agnostic adapter (MSG91, Twilio, or Mock/Console default).
     4. Weekly community notice-board consolidated PDF.
   - Failure of SMS delivery does not block execution; all attempted channels and ultimate delivery channel are audited.

6. **Teaching at the Right Level (TaRL) Adaptive Assessment**:
   - Assessment engine utilizes a pure function implementing an accelerated adaptive testing staircase (Levels 1 to 5):
     - Starts at Level 3.
     - Advances +1 level on correct response, drops -1 level on incorrect response.
     - Terminates after 8 questions or when two consecutive estimates coincide.
   - Pure domain logic resides in `packages/shared` with zero UI/DB dependencies, enabling identical evaluation on devices, hub, and cloud.

7. **Storage & Content Quota Management**:
   - Devices maintain content quotas via `navigator.storage.estimate()`. Content packs are versioned, SHA-256 hashed, and downloaded selectively. Users have a dedicated offline storage management interface to evict cached lessons/videos when storage runs low.
