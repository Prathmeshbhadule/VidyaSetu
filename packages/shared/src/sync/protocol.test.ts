import { describe, it, expect } from 'vitest';
import {
  SyncPushPayloadSchema,
  SyncPullQuerySchema,
  SyncPullResponseSchema,
  CURRENT_SYNC_SCHEMA_VERSION,
} from './protocol.js';
import { createProblem, StandardProblems } from '../problem.js';

describe('Sync Protocol Schemas & RFC 7807 Problems', () => {
  it('validates a correct push payload', () => {
    const raw = {
      schemaVersion: CURRENT_SYNC_SCHEMA_VERSION,
      deviceId: 'dev-tablet-01',
      schoolId: 'sch-01',
      batchId: 'batch-101',
      changes: [
        {
          id: '018f679a-1111-7000-8000-000000000001',
          entity: 'Attendance',
          entityId: '018f679a-1111-7000-8000-000000000002',
          op: 'INSERT',
          schoolId: 'sch-01',
          deviceId: 'dev-tablet-01',
          payload: { status: 'PRESENT', date: '2026-03-01' },
          hlc: '1716000000000:0:dev-tablet-01',
          priority: 1,
        },
      ],
    };

    const parsed = SyncPushPayloadSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
  });

  it('rejects batch size exceeding 200 items', () => {
    const changes = Array.from({ length: 201 }, (_, i) => ({
      id: `018f679a-1111-7000-8000-${i.toString().padStart(12, '0')}`,
      entity: 'Attendance',
      entityId: `018f679a-2222-7000-8000-${i.toString().padStart(12, '0')}`,
      op: 'INSERT',
      schoolId: 'sch-01',
      deviceId: 'dev-01',
      payload: {},
      hlc: '1000:0:dev-01',
    }));

    const raw = {
      schemaVersion: 1,
      deviceId: 'dev-01',
      schoolId: 'sch-01',
      batchId: 'b-too-big',
      changes,
    };

    const parsed = SyncPushPayloadSchema.safeParse(raw);
    expect(parsed.success).toBe(false);
  });

  it('parses sync pull query parameters', () => {
    const query = {
      since: '450',
      limit: '50',
      schoolId: 'sch-01',
    };

    const parsed = SyncPullQuerySchema.parse(query);
    expect(parsed.since).toBe(450);
    expect(parsed.limit).toBe(50);
    expect(parsed.schoolId).toBe('sch-01');
  });

  it('creates RFC 7807 problem details objects', () => {
    const notFound = StandardProblems.notFound('Student', 'stu-999');
    expect(notFound.status).toBe(404);
    expect(notFound.title).toBe('Not Found');
    expect(notFound.detail).toContain('stu-999');

    const badRequest = StandardProblems.badRequest('Validation failed', [
      { name: 'pin', reason: 'PIN must be 4 digits' },
    ]);
    expect(badRequest.status).toBe(400);
    expect(badRequest.invalidParams).toHaveLength(1);
  });
});
