# ADR 002: Transactional Outbox and Cursor-Based Sync Protocol

## Status
Accepted

## Context
When classroom devices operate disconnected for days, they accumulate mutations: attendance marks, quiz attempts, checklist updates, and profile edits. When connectivity returns (either to the local School Hub or cloud), these mutations must be reliably synced without data loss, duplicate execution, or locking the user interface.

## Decision
We implement a **Transactional Outbox Pattern** paired with an **Idempotent Cursor-Based Delta Feed**:
1. **Atomic Mutation + Outbox Enqueue**: In Tier 1 (Dexie) and Tier 2 (SQLite), every entity write executes inside a single atomic database transaction with an Outbox record (`OutboxItem`). The outbox stores the mutation operation (`INSERT`, `UPDATE`, `DELETE`), target entity, payload, and priority.
2. **Push Protocol (`POST /sync/push`)**:
   - Pushes mutations in bounded batches of at most 200 items.
   - Every mutation is identified by an immutable client-generated UUIDv7 `changeId`, which acts as an idempotency key.
   - The server returns per-item statuses: `applied`, `duplicate`, `conflict`, or `rejected`.
   - Only successfully applied or duplicate items are removed from the local outbox.
3. **Pull Protocol (`GET /sync/pull?since=<seq>`)**:
   - Clients pull a delta feed using a monotonically increasing sequence cursor `seq` stamped by the server's ChangeLog.
   - Deleted items are represented as tombstones (`op: DELETE`).
4. **Prioritized Retries with Jitter**: Attendance records and quiz submissions are assigned Priority 1 (high) and push first; large media records and telemetry use lower priority. Network failures trigger exponential backoff with randomized jitter.

## Consequences

### Positive
- **Guaranteed At-Least-Once Delivery**: Mutations cannot be lost due to app crashes or sudden power losses mid-flight.
- **Strict Idempotency**: Resent packets or duplicate network transmissions do not duplicate quiz attempts or attendance marks.
- **Symmetric Architecture**: The School Hub speaks the exact same sync contract as the cloud. The PWA code does not need to know whether it is communicating with a laptop or an AWS instance.

### Negative / Trade-offs
- ChangeLog tables on the Hub and Cloud grow monotonically and require periodic archival/vacuuming.
