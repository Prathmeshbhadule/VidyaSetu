# ADR 004: Monorepo Architecture with pnpm Workspaces

## Status
Accepted

## Context
Vidya Setu consists of three distinct deployment targets: a browser/mobile PWA (`apps/web`), an offline Node.js server (`apps/hub`), and a cloud backend (`apps/api`). Multiple core domain calculations (such as TaRL adaptive testing, grading formulas, attendance statistics, HLC clocks, RFC 7807 error formats, and i18n translation dictionaries) must behave identically across all three tiers.

Duplicating these algorithms across separate repositories leads to protocol drift, diverging test criteria, and high maintenance overhead.

## Decision
We organize the codebase into a single repository using **pnpm workspaces**:
- `packages/shared`: Pure TypeScript library containing all shared schemas, Zod validators, domain engines, and localization dictionaries.
- `apps/web`: Vite + React 18 Progressive Web Application.
- `apps/hub`: Node.js Express service backed by `better-sqlite3`.
- `apps/api`: Node.js Express service backed by Prisma, PostgreSQL 16, BullMQ, and Redis.

TypeScript strict mode (`"strict": true`) is enforced universally across all apps and packages via a shared root `tsconfig.base.json`.

## Consequences

### Positive
- **Single Source of Truth**: All Zod schemas and sync types are defined once in `packages/shared` and consumed across client, hub, and cloud.
- **Atomic Refactoring**: Protocol or domain rule changes are verified in a single git commit across all three tiers simultaneously.
- **Efficient Disk Usage**: pnpm hardlinks dependencies across packages, minimizing build time and node_modules footprint.

### Negative / Trade-offs
- Requires monorepo tooling awareness (e.g. workspace dependencies, build ordering, and path resolution).
