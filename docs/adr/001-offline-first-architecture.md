# ADR 001: Offline-First Architecture for Rural School Connectivity

## Status
Accepted

## Context
Rural schools across India frequently experience complete network blackouts lasting days or weeks. Furthermore, cellular connections in remote villages are often 2G/3G speeds with high latency and packet loss. Classroom devices are typically shared low-spec Android tablets (2 GB RAM) or teacher smartphones.

If an application depends on online roundtrips to render screens, submit attendance, or start lessons, classroom learning halts whenever the network drops. In rural environments, network availability is an exception, not the baseline.

## Decision
We adopt an **Offline-First Architecture** across all tiers:
1. **Tier 1 (Client PWA)**: All user reads and writes hit local client storage (IndexedDB via Dexie.js) first. UI updates optimistically with zero network delay. Network connectivity is merely an opportunistic background synchronization trigger.
2. **Tier 2 (School Hub)**: A lightweight Node.js service running on a local classroom PC or low-power hardware with `better-sqlite3` in WAL mode provides an offline LAN server. Devices communicate with the School Hub over local Wi-Fi without internet connectivity.
3. **Tier 3 (Cloud API)**: The cloud acts as a downstream aggregator and authoritative distributor for curricula and district reports.

## Consequences

### Positive
- **100% Student Continuity**: Lessons, quizzes, adaptive assessments, and progress tracking succeed with zero internet connection.
- **Instantaneous UI**: Attendance marking takes under 60 seconds because writes are instant local IndexedDB transactions.
- **Battery & Bandwidth Efficiency**: Radios only spin up when connectivity is present; bulk data transfer is deferred.

### Negative / Trade-offs
- Increased client-side architectural complexity (client-side state machines, outbox queues, conflict handling).
- Storage quota limits on mobile devices require explicit storage monitoring (`navigator.storage.estimate`) and media cleanup tools.
