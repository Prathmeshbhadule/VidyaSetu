import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import request from 'supertest';
import { runMigrations } from '../db/migrator.js';
import { HubSyncService } from '../services/hub-sync.service.js';
import { app } from '../app.js';
import { SyncPushPayload } from '@vidya-setu/shared';

describe('School Hub (Tier 2) SQLite & Sync Tests', () => {
  let memDb: Database.Database;
  let hubSync: HubSyncService;

  beforeEach(() => {
    memDb = new Database(':memory:');
    const migrationsDir = path.join(__dirname, '../../migrations');
    runMigrations(memDb, migrationsDir);
    hubSync = new HubSyncService(memDb);
  });

  afterEach(() => {
    memDb.close();
  });

  it('runs versioned migrations and initializes schema tables', () => {
    const migrations = memDb.prepare('SELECT version, name FROM schema_migrations ORDER BY version ASC').all() as any[];
    expect(migrations.length).toBeGreaterThanOrEqual(2);
    expect(migrations[0].version).toBe(1);
    expect(migrations[1].version).toBe(2);

    // Verify critical tables exist
    const tables = memDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[];
    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain('attendance');
    expect(tableNames).toContain('students');
    expect(tableNames).toContain('change_log');
    expect(tableNames).toContain('outbox');
  });

  it('handles tablet push, updates local tables, and queues into outbox', () => {
    const payload: SyncPushPayload = {
      schemaVersion: 1,
      deviceId: 'dev-tablet-01',
      schoolId: 'school-01',
      batchId: 'batch-001',
      changes: [
        {
          id: '018f679a-1111-7000-8000-000000000001',
          entity: 'Attendance',
          entityId: '018f679a-att1-7000-8000-000000000001',
          op: 'INSERT',
          schoolId: 'school-01',
          deviceId: 'dev-tablet-01',
          payload: {
            studentId: 'stu-101',
            date: '2026-03-01',
            status: 'PRESENT',
            markedBy: 'teacher-01',
            source: 'TEACHER',
          },
          hlc: '1716000000000:0:dev-tablet-01',
          priority: 1,
        },
      ],
    };

    const pushResult = hubSync.handleTabletPush(payload);
    expect(pushResult.appliedCount).toBe(1);
    expect(pushResult.results[0].status).toBe('applied');

    // Verify row in attendance table
    const attRow = memDb.prepare('SELECT * FROM attendance WHERE student_id = ?').get('stu-101') as any;
    expect(attRow).toBeDefined();
    expect(attRow.status).toBe('PRESENT');

    // Verify row queued into outbox
    const outboxRow = memDb.prepare('SELECT * FROM outbox WHERE id = ?').get(payload.changes[0].id) as any;
    expect(outboxRow).toBeDefined();
    expect(outboxRow.entity).toBe('Attendance');

    // Verify row in change_log
    const changeLogRow = memDb.prepare('SELECT * FROM change_log WHERE id = ?').get(payload.changes[0].id) as any;
    expect(changeLogRow).toBeDefined();
  });

  it('handles duplicate delivery idempotently without creating multiple records', () => {
    const payload: SyncPushPayload = {
      schemaVersion: 1,
      deviceId: 'dev-tablet-01',
      schoolId: 'school-01',
      batchId: 'batch-dup',
      changes: [
        {
          id: '018f679a-dup1-7000-8000-000000000001',
          entity: 'Attendance',
          entityId: '018f679a-att2-7000-8000-000000000002',
          op: 'INSERT',
          schoolId: 'school-01',
          deviceId: 'dev-tablet-01',
          payload: {
            studentId: 'stu-dup',
            date: '2026-03-02',
            status: 'ABSENT',
            markedBy: 'teacher-01',
          },
          hlc: '1716000000000:0:dev-tablet-01',
        },
      ],
    };

    // First push -> applied
    const res1 = hubSync.handleTabletPush(payload);
    expect(res1.appliedCount).toBe(1);

    // Second push with same change ID -> duplicate
    const res2 = hubSync.handleTabletPush(payload);
    expect(res2.duplicateCount).toBe(1);
    expect(res2.appliedCount).toBe(0);
    expect(res2.results[0].status).toBe('duplicate');
  });

  it('serves delta changes on tablet pull', () => {
    // Insert 2 changes into change_log
    memDb.prepare(`
      INSERT INTO change_log (id, entity, entity_id, op, school_id, device_id, payload, hlc, received_at)
      VALUES 
        ('chg-1', 'Attendance', 'att-1', 'INSERT', 'sch-1', 'dev-1', '{"status":"PRESENT"}', '1000:0:dev-1', '2026-03-01T10:00:00Z'),
        ('chg-2', 'Attendance', 'att-2', 'INSERT', 'sch-1', 'dev-1', '{"status":"ABSENT"}', '2000:0:dev-1', '2026-03-01T10:05:00Z')
    `).run();

    const pullResult = hubSync.handleTabletPull({
      schemaVersion: 1,
      since: 0,
      limit: 10,
    });

    expect(pullResult.changes.length).toBe(2);
    expect(pullResult.changes[0].entityId).toBe('att-1');
    expect(pullResult.changes[1].entityId).toBe('att-2');
    expect(pullResult.currentSeq).toBe(2);
  });

  describe('Hub HTTP Endpoints', () => {
    it('GET /healthz returns 200 with tier school-hub', async () => {
      const res = await request(app).get('/healthz');
      expect(res.status).toBe(200);
      expect(res.body.tier).toBe('school-hub');
    });

    it('GET /api/v1/hub/status returns queue count and connectivity details', async () => {
      const res = await request(app).get('/api/v1/hub/status');
      expect(res.status).toBe(200);
      expect(res.body.hubDeviceId).toBeDefined();
      expect(typeof res.body.pendingOutboxCount).toBe('number');
    });

    it('GET /api/v1/content/videos/mock-id/stream handles range requests', async () => {
      const res = await request(app)
        .get('/api/v1/content/videos/test-vid/stream')
        .set('Range', 'bytes=0-10');

      expect([200, 206]).toContain(res.status);
    });
  });
});
