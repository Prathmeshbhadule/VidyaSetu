import Database from 'better-sqlite3';
import { getHubDb } from '../db/sqlite.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import {
  SyncPushPayload,
  SyncPushResponse,
  SyncPullQuery,
  SyncPullResponse,
  SyncItemResult,
  CURRENT_SYNC_SCHEMA_VERSION,
  resolveAttendanceConflict,
  resolveQuizResultConflict,
  resolveProfileFieldsConflict,
  resolveAtRiskFlagConflict,
  resolveContentConflict,
  generateUuidV7,
} from '@vidya-setu/shared';

export class HubSyncService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || getHubDb();
  }

  // 1. Tablet -> Hub (Hub as Server)
  public handleTabletPush(payload: SyncPushPayload): SyncPushResponse {
    const results: SyncItemResult[] = [];
    let appliedCount = 0;
    let duplicateCount = 0;
    let rejectedCount = 0;
    let conflictCount = 0;

    const insertChangeLogStmt = this.db.prepare(`
      INSERT INTO change_log (id, entity, entity_id, op, school_id, device_id, payload, hlc, received_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertOutboxStmt = this.db.prepare(`
      INSERT OR REPLACE INTO outbox (id, entity, entity_id, op, school_id, device_id, payload, hlc, priority, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const checkChangeStmt = this.db.prepare('SELECT seq FROM change_log WHERE id = ?');

    const transaction = this.db.transaction((changes: any[]) => {
      for (const change of changes) {
        // Idempotency check
        const existingChange = checkChangeStmt.get(change.id) as { seq: number } | undefined;
        if (existingChange) {
          duplicateCount++;
          results.push({
            id: change.id,
            entity: change.entity,
            entityId: change.entityId,
            status: 'duplicate',
            serverSeq: existingChange.seq,
          });
          continue;
        }

        const decision = this.applyLocalMutation(change);

        if (decision.status === 'applied') {
          appliedCount++;
          const nowIso = new Date().toISOString();

          // 1. Write to local ChangeLog
          const logInfo = insertChangeLogStmt.run(
            change.id,
            change.entity,
            change.entityId,
            change.op,
            change.schoolId,
            change.deviceId,
            JSON.stringify(change.payload),
            change.hlc,
            nowIso
          );

          // 2. Queue into Hub Outbox for cloud sync
          insertOutboxStmt.run(
            change.id,
            change.entity,
            change.entityId,
            change.op,
            change.schoolId,
            change.deviceId,
            JSON.stringify(change.payload),
            change.hlc,
            change.priority || 1,
            nowIso
          );

          results.push({
            id: change.id,
            entity: change.entity,
            entityId: change.entityId,
            status: 'applied',
            serverSeq: Number(logInfo.lastInsertRowid),
          });
        } else if (decision.status === 'duplicate') {
          duplicateCount++;
          results.push({
            id: change.id,
            entity: change.entity,
            entityId: change.entityId,
            status: 'duplicate',
            details: decision.details,
          });
        } else {
          rejectedCount++;
          results.push({
            id: change.id,
            entity: change.entity,
            entityId: change.entityId,
            status: 'rejected',
            details: decision.details,
          });
        }
      }
    });

    transaction(payload.changes);

    return {
      schemaVersion: CURRENT_SYNC_SCHEMA_VERSION,
      batchId: payload.batchId,
      receivedAt: new Date().toISOString(),
      results,
      appliedCount,
      duplicateCount,
      rejectedCount,
      conflictCount,
    };
  }

  private applyLocalMutation(change: any): { status: 'applied' | 'duplicate' | 'rejected'; details?: string } {
    const { entity, entityId, payload } = change;

    switch (entity) {
      case 'Attendance': {
        const existingRow = this.db.prepare('SELECT * FROM attendance WHERE student_id = ? AND date = ?').get(payload.studentId, payload.date) as any;
        const decision = resolveAttendanceConflict(existingRow, payload);

        if (decision.applied) {
          this.db.prepare(`
            INSERT INTO attendance (id, school_id, student_id, date, status, marked_by, source, note, version, device_id, hlc, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(student_id, date) DO UPDATE SET
              status = excluded.status,
              marked_by = excluded.marked_by,
              source = excluded.source,
              note = excluded.note,
              version = attendance.version + 1,
              device_id = excluded.device_id,
              hlc = excluded.hlc,
              updated_at = excluded.updated_at
          `).run(
            entityId,
            change.schoolId,
            payload.studentId,
            payload.date,
            payload.status,
            payload.markedBy,
            payload.source || 'TEACHER',
            payload.note || null,
            payload.version || 1,
            change.deviceId,
            change.hlc,
            new Date().toISOString(),
            new Date().toISOString()
          );
          return { status: 'applied' };
        }
        return { status: decision.status as any, details: decision.details };
      }

      case 'QuizResult': {
        const existing = this.db.prepare('SELECT id FROM quiz_results WHERE id = ?').get(entityId);
        const decision = resolveQuizResultConflict(existing as any, payload);

        if (decision.applied) {
          this.db.prepare(`
            INSERT INTO quiz_results (id, school_id, student_id, quiz_id, mode, answers, score, max_score, assessed_level, started_at, submitted_at, version, device_id, hlc, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            entityId,
            change.schoolId,
            payload.studentId,
            payload.quizId,
            payload.mode || 'QUIZ',
            JSON.stringify(payload.answers),
            payload.score,
            payload.maxScore,
            payload.assessedLevel || 1,
            payload.startedAt,
            payload.submittedAt,
            1,
            change.deviceId,
            change.hlc,
            new Date().toISOString(),
            new Date().toISOString()
          );
          return { status: 'applied' };
        }
        return { status: decision.status as any, details: decision.details };
      }

      case 'StudentProfile': {
        const existing = this.db.prepare('SELECT * FROM students WHERE id = ?').get(entityId) as any;
        const decision = resolveProfileFieldsConflict(existing, payload);

        if (decision.applied) {
          this.db.prepare(`
            INSERT INTO students (id, school_id, name, prn, grade, gender, assessed_level, avatar_id, pin_hash, parental_consent, version, device_id, hlc, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              grade = excluded.grade,
              assessed_level = excluded.assessed_level,
              avatar_id = excluded.avatar_id,
              version = students.version + 1,
              updated_at = excluded.updated_at
          `).run(
            entityId,
            change.schoolId,
            payload.name,
            payload.prn,
            payload.grade,
            payload.gender,
            payload.assessedLevel || 1,
            payload.avatarId || 'avatar-1',
            payload.pinHash || '1234',
            payload.parentalConsent ? 1 : 0,
            payload.version || 1,
            change.deviceId,
            change.hlc,
            new Date().toISOString(),
            new Date().toISOString()
          );
          return { status: 'applied' };
        }
        return { status: decision.status as any, details: decision.details };
      }

      case 'SchemeChecklistProgress': {
        this.db.prepare(`
          INSERT INTO scheme_checklists (id, school_id, student_id, scheme_id, checked_docs, completed, version, device_id, hlc, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(student_id, scheme_id) DO UPDATE SET
            checked_docs = excluded.checked_docs,
            completed = excluded.completed,
            version = scheme_checklists.version + 1,
            updated_at = excluded.updated_at
        `).run(
          entityId,
          change.schoolId,
          payload.studentId,
          payload.schemeId,
          JSON.stringify(payload.checkedDocs || []),
          payload.completed ? 1 : 0,
          1,
          change.deviceId,
          change.hlc,
          new Date().toISOString(),
          new Date().toISOString()
        );
        return { status: 'applied' };
      }

      default:
        return { status: 'rejected', details: `Entity type ${entity} not handled on hub` };
    }
  }

  public handleTabletPull(query: SyncPullQuery): SyncPullResponse {
    const limit = Math.min(query.limit || 100, 500);
    const since = query.since || 0;

    const rows = this.db.prepare(`
      SELECT * FROM change_log
      WHERE seq > ?
      ORDER BY seq ASC
      LIMIT ?
    `).all(since, limit + 1) as any[];

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    const currentSeq = items.length > 0 ? items[items.length - 1].seq : since;

    const changes = items.map((r) => ({
      seq: r.seq,
      entity: r.entity,
      entityId: r.entity_id,
      op: r.op as any,
      schoolId: r.school_id,
      payload: JSON.parse(r.payload),
      hlc: r.hlc,
      receivedAt: r.received_at,
      deletedAt: null,
    }));

    return {
      schemaVersion: CURRENT_SYNC_SCHEMA_VERSION,
      currentSeq,
      hasMore,
      changes,
      serverTime: new Date().toISOString(),
    };
  }

  // 2. Hub -> Cloud Synchronization (Hub as Client)
  public async syncWithCloud(): Promise<{
    pushedCount: number;
    pulledCount: number;
    cloudReachable: boolean;
    error?: string;
  }> {
    // Check outbox
    const pendingOutbox = this.db.prepare(`
      SELECT * FROM outbox
      ORDER BY priority ASC, created_at ASC
      LIMIT 200
    `).all() as any[];

    let pushedCount = 0;
    let pulledCount = 0;

    try {
      // 1. Push pending changes to Cloud API
      if (pendingOutbox.length > 0) {
        const batchId = generateUuidV7();
        const changes = pendingOutbox.map((r) => ({
          id: r.id,
          entity: r.entity,
          entityId: r.entity_id,
          op: r.op,
          schoolId: r.school_id,
          deviceId: r.device_id,
          payload: JSON.parse(r.payload),
          hlc: r.hlc,
          priority: r.priority,
        }));

        const pushUrl = `${env.CLOUD_SYNC_URL}/push`;
        const pushRes: any = await fetch(pushUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Token': env.DEVICE_TOKEN,
            'X-Device-Id': env.HUB_DEVICE_ID,
            'X-School-Id': env.SCHOOL_ID,
          },
          body: JSON.stringify({
            schemaVersion: CURRENT_SYNC_SCHEMA_VERSION,
            deviceId: env.HUB_DEVICE_ID,
            schoolId: env.SCHOOL_ID,
            batchId,
            changes,
          }),
        });

        if (pushRes.ok) {
          const pushData = (await pushRes.json()) as SyncPushResponse;
          // Delete acknowledged items from outbox
          const deleteStmt = this.db.prepare('DELETE FROM outbox WHERE id = ?');
          const deleteTx = this.db.transaction((results: any[]) => {
            for (const item of results) {
              if (item.status === 'applied' || item.status === 'duplicate') {
                deleteStmt.run(item.id);
                pushedCount++;
              }
            }
          });
          deleteTx(pushData.results);
        } else {
          logger.warn({ status: pushRes.status }, 'Cloud sync push failed');
        }
      }

      // 2. Pull server updates from Cloud API
      const lastSeqRow = this.db.prepare("SELECT value FROM hub_metadata WHERE key = 'last_cloud_seq'").get() as any;
      const lastSeq = lastSeqRow ? parseInt(lastSeqRow.value, 10) : 0;

      const pullUrl = `${env.CLOUD_SYNC_URL}/pull?since=${lastSeq}&limit=100&schoolId=${env.SCHOOL_ID}`;
      const pullRes: any = await fetch(pullUrl, {
        headers: {
          'X-Device-Token': env.DEVICE_TOKEN,
          'X-Device-Id': env.HUB_DEVICE_ID,
          'X-School-Id': env.SCHOOL_ID,
        },
      });

      if (pullRes.ok) {
        const pullData = (await pullRes.json()) as SyncPullResponse;
        pulledCount = pullData.changes.length;

        // Apply pulled changes locally
        for (const change of pullData.changes) {
          this.applyLocalMutation(change);
        }

        // Update last cloud sequence and sync timestamp
        this.db.prepare(`
          INSERT INTO hub_metadata (key, value) VALUES ('last_cloud_seq', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).run(pullData.currentSeq.toString());

        this.db.prepare(`
          INSERT INTO hub_metadata (key, value) VALUES ('last_cloud_sync', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).run(new Date().toISOString());
      }

      return {
        pushedCount,
        pulledCount,
        cloudReachable: true,
      };
    } catch (err: any) {
      logger.info({ err: err.message }, 'Cloud API unreachable (offline school mode active)');
      return {
        pushedCount: 0,
        pulledCount: 0,
        cloudReachable: false,
        error: err.message,
      };
    }
  }

  public getHubStatus() {
    const queueSizeRow = this.db.prepare('SELECT COUNT(*) as count FROM outbox').get() as any;
    const lastSyncRow = this.db.prepare("SELECT value FROM hub_metadata WHERE key = 'last_cloud_sync'").get() as any;
    const devices = this.db.prepare('SELECT id, name, type, last_seen_at FROM devices').all();
    const studentsCount = (this.db.prepare('SELECT COUNT(*) as count FROM students').get() as any).count;
    const attendanceCount = (this.db.prepare('SELECT COUNT(*) as count FROM attendance').get() as any).count;

    return {
      schoolId: env.SCHOOL_ID,
      hubDeviceId: env.HUB_DEVICE_ID,
      pendingOutboxCount: queueSizeRow.count,
      lastCloudSync: lastSyncRow ? lastSyncRow.value : null,
      connectedDevices: devices,
      totalStudents: studentsCount,
      totalAttendanceRecords: attendanceCount,
      cloudSyncUrl: env.CLOUD_SYNC_URL,
    };
  }
}
