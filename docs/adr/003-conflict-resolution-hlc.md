# ADR 003: Conflict Resolution and Hybrid Logical Clocks (HLC)

## Status
Accepted

## Context
In rural schools, physical device clocks on tablets cannot be trusted. Tablet RTC batteries drain, manual time settings drift, or devices remain without NTP synchronization for months. If standard wall-clock timestamps (`new Date()`) are used to order concurrent edits, a device with a clock set in 2020 could have its updates perpetually discarded, while a device set in 2030 would overwrite everything.

Furthermore, different entities require different semantic reconciliation policies (e.g., student quiz results cannot be overwritten by attendance updates).

## Decision
We introduce a two-fold solution:
1. **Hybrid Logical Clocks (HLC)**:
   - Implemented as a pure domain engine in `packages/shared/src/domain/hlc.ts`.
   - Combines physical monotonic time with a logical counter and node ID: `<physical>-<counter>-<nodeId>`.
   - Guaranteed to strictly order events causally without relying on wall-clock synchrony across distributed nodes.
2. **Entity-Specific Domain Conflict Policies**:
   - **QuizResult**: Append-only and immutable. Deduplicated by `id`. Never conflicts.
   - **Attendance**: Last-Writer-Wins using HLC with deviceId tie-breaking. A manual teacher edit always supersedes automated marks.
   - **Student Learning Progress**: Monotonically increasing merge with `Math.max()` for levels/scores, and set union for completed lessons.
   - **Profile Fields**: Last-Writer-Wins per field ordered by HLC.
   - **Curriculum & Welfare Schemes**: Server-authoritative; client updates are rejected as read-only.
   - **At-Risk Flags**: Derived deterministically on whichever tier evaluates attendance; manual teacher resolutions sync as Last-Writer-Wins.

## Consequences

### Positive
- Robust causality tracking even when tablet clocks are skewed by years.
- Deterministic conflict outcomes on both Hub and Cloud.
- Students never lose earned quiz stars or completed lesson milestones during multi-device synchronization.

### Negative / Trade-offs
- Requires nodes to pass HLC strings across every sync payload.
