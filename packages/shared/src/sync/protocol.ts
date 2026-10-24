import { z } from 'zod';

export const CURRENT_SYNC_SCHEMA_VERSION = 1;

export const SyncOpSchema = z.enum(['INSERT', 'UPDATE', 'DELETE']);

export const SyncItemStatusSchema = z.enum(['applied', 'duplicate', 'rejected', 'conflict']);

export const ChangeItemSchema = z.object({
  id: z.string().describe('Idempotency key and unique ID of the change mutation (UUIDv7)'),
  entity: z.string().describe('Target entity type, e.g. Attendance, QuizResult, StudentProfile'),
  entityId: z.string().describe('ID of the entity being mutated (UUIDv7)'),
  op: SyncOpSchema,
  schoolId: z.string(),
  deviceId: z.string(),
  payload: z.record(z.unknown()).describe('Full entity data for INSERT/UPDATE or tombstone info for DELETE'),
  hlc: z.string().describe('Hybrid Logical Clock timestamp format physical:counter:nodeId'),
  clientTimestamp: z.string().datetime().optional(),
  priority: z.number().int().default(1).describe('1: High (attendance/results), 2: Normal, 3: Low'),
});

export type ChangeItem = z.infer<typeof ChangeItemSchema>;

export const SyncPushPayloadSchema = z.object({
  schemaVersion: z.number().int().default(CURRENT_SYNC_SCHEMA_VERSION),
  deviceId: z.string(),
  schoolId: z.string(),
  batchId: z.string(),
  changes: z.array(ChangeItemSchema).max(200, 'Batch size must not exceed 200 items'),
  signature: z.string().optional().describe('HMAC-SHA256 signature for LAN device authentication'),
});

export type SyncPushPayload = z.infer<typeof SyncPushPayloadSchema>;

export const SyncItemResultSchema = z.object({
  id: z.string().describe('Mutation change ID'),
  entity: z.string(),
  entityId: z.string(),
  status: SyncItemStatusSchema,
  details: z.string().optional(),
  serverSeq: z.number().int().optional(),
});

export type SyncItemResult = z.infer<typeof SyncItemResultSchema>;

export const SyncPushResponseSchema = z.object({
  schemaVersion: z.number().int(),
  batchId: z.string(),
  receivedAt: z.string().datetime(),
  results: z.array(SyncItemResultSchema),
  appliedCount: z.number().int(),
  duplicateCount: z.number().int(),
  rejectedCount: z.number().int(),
  conflictCount: z.number().int(),
});

export type SyncPushResponse = z.infer<typeof SyncPushResponseSchema>;

export const SyncPullQuerySchema = z.object({
  schemaVersion: z.coerce.number().int().default(CURRENT_SYNC_SCHEMA_VERSION),
  since: z.coerce.number().int().default(0).describe('Sequence cursor, 0 to fetch all initial data'),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  schoolId: z.string().optional(),
  entities: z.string().optional().describe('Comma-separated list of entities to filter, or empty for all'),
});

export type SyncPullQuery = z.infer<typeof SyncPullQuerySchema>;

export const PulledChangeEntrySchema = z.object({
  seq: z.number().int(),
  entity: z.string(),
  entityId: z.string(),
  op: SyncOpSchema,
  schoolId: z.string(),
  payload: z.record(z.unknown()),
  hlc: z.string(),
  receivedAt: z.string().datetime(),
  deletedAt: z.string().nullable().optional(),
});

export type PulledChangeEntry = z.infer<typeof PulledChangeEntrySchema>;

export const SyncPullResponseSchema = z.object({
  schemaVersion: z.number().int(),
  currentSeq: z.number().int(),
  hasMore: z.boolean(),
  changes: z.array(PulledChangeEntrySchema),
  serverTime: z.string().datetime(),
});

export type SyncPullResponse = z.infer<typeof SyncPullResponseSchema>;
