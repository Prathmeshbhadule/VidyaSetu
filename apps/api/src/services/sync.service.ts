import { changeLogRepository, ChangeLogRepository } from '../repositories/changelog.repository.js';
import { studentRepository, StudentRepository } from '../repositories/student.repository.js';
import { attendanceRepository, AttendanceRepository } from '../repositories/attendance.repository.js';
import { quizResultRepository, QuizResultRepository } from '../repositories/quiz-result.repository.js';
import { schemeRepository, SchemeRepository } from '../repositories/scheme.repository.js';
import { atRiskRepository, AtRiskRepository } from '../repositories/at-risk.repository.js';
import { prisma } from '../db/prisma.js';
import {
  CURRENT_SYNC_SCHEMA_VERSION,
  SyncPushPayload,
  SyncPushResponse,
  SyncPullQuery,
  SyncPullResponse,
  SyncItemResult,
  resolveAttendanceConflict,
  resolveQuizResultConflict,
  resolveAtRiskFlagConflict,
  resolveProfileFieldsConflict,
  resolveContentConflict,
  StandardProblems,
  ProblemError,
} from '@vidya-setu/shared';

export class SyncService {
  constructor(
    private changeLog: ChangeLogRepository = changeLogRepository,
    private students: StudentRepository = studentRepository,
    private attendance: AttendanceRepository = attendanceRepository,
    private quizResults: QuizResultRepository = quizResultRepository,
    private schemes: SchemeRepository = schemeRepository,
    private atRisk: AtRiskRepository = atRiskRepository
  ) {}

  async pushChanges(payload: SyncPushPayload): Promise<SyncPushResponse> {
    if (payload.changes.length > 200) {
      throw new ProblemError(
        StandardProblems.badRequest('Sync batch exceeds maximum limit of 200 mutations')
      );
    }

    const results: SyncItemResult[] = [];
    let appliedCount = 0;
    let duplicateCount = 0;
    let rejectedCount = 0;
    let conflictCount = 0;

    for (const change of payload.changes) {
      try {
        // Idempotency check: Has this exact change ID already been processed?
        const existingChange = await prisma.changeLog.findUnique({
          where: { id: change.id },
        });

        if (existingChange) {
          duplicateCount++;
          results.push({
            id: change.id,
            entity: change.entity,
            entityId: change.entityId,
            status: 'duplicate',
            details: 'Change mutation already processed and recorded',
            serverSeq: existingChange.seq,
          });
          continue;
        }

        // Apply entity-specific mutation & conflict resolution
        const decision = await this.applyEntityMutation(change);

        if (decision.status === 'applied') {
          appliedCount++;
          // Record mutation in server ChangeLog feed
          const logEntry = await this.changeLog.create({
            id: change.id,
            entity: change.entity,
            entityId: change.entityId,
            op: change.op,
            schoolId: change.schoolId,
            deviceId: change.deviceId,
            payload: change.payload,
            hlc: change.hlc,
          });

          results.push({
            id: change.id,
            entity: change.entity,
            entityId: change.entityId,
            status: 'applied',
            serverSeq: logEntry.seq,
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
        } else if (decision.status === 'conflict') {
          conflictCount++;
          results.push({
            id: change.id,
            entity: change.entity,
            entityId: change.entityId,
            status: 'conflict',
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
      } catch (err: any) {
        rejectedCount++;
        results.push({
          id: change.id,
          entity: change.entity,
          entityId: change.entityId,
          status: 'rejected',
          details: err.message || 'Error executing mutation',
        });
      }
    }

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

  private async applyEntityMutation(change: any): Promise<{ status: any; details?: string }> {
    const { entity, entityId, payload, op } = change;

    switch (entity) {
      case 'Attendance': {
        const existing = await this.attendance.findByStudentAndDate(payload.studentId, payload.date);
        const decision = resolveAttendanceConflict(existing as any, payload as any);

        if (decision.applied) {
          await this.attendance.upsert({
            id: entityId,
            schoolId: change.schoolId,
            studentId: payload.studentId,
            date: payload.date,
            status: payload.status,
            markedBy: payload.markedBy,
            source: payload.source || 'TEACHER',
            note: payload.note,
            deviceId: change.deviceId,
            hlc: change.hlc,
            version: payload.version || 1,
          });
          return { status: 'applied' };
        }
        return { status: decision.status, details: decision.details };
      }

      case 'QuizResult': {
        const existing = await this.quizResults.findById(entityId);
        const decision = resolveQuizResultConflict(existing as any, payload as any);

        if (decision.applied) {
          await this.quizResults.create({
            id: entityId,
            schoolId: change.schoolId,
            studentId: payload.studentId,
            quizId: payload.quizId,
            mode: payload.mode || 'QUIZ',
            answers: payload.answers,
            score: payload.score,
            maxScore: payload.maxScore,
            assessedLevel: payload.assessedLevel || 1,
            startedAt: new Date(payload.startedAt),
            submittedAt: new Date(payload.submittedAt),
            deviceId: change.deviceId,
            hlc: change.hlc,
            version: 1,
          });
          return { status: 'applied' };
        }
        return { status: decision.status, details: decision.details };
      }

      case 'StudentProfile': {
        const existing = await this.students.findById(entityId);
        const decision = resolveProfileFieldsConflict(existing as any, payload as any);

        if (decision.applied) {
          await this.students.upsert({
            ...payload,
            id: entityId,
            schoolId: change.schoolId,
            deviceId: change.deviceId,
            hlc: change.hlc,
          });
          return { status: 'applied' };
        }
        return { status: decision.status, details: decision.details };
      }

      case 'AtRiskFlag': {
        const existing = await this.atRisk.findById(entityId);
        const decision = resolveAtRiskFlagConflict(existing as any, payload as any);

        if (decision.applied) {
          await this.atRisk.upsert({
            ...payload,
            id: entityId,
            schoolId: change.schoolId,
            deviceId: change.deviceId,
            hlc: change.hlc,
          });
          return { status: 'applied' };
        }
        return { status: decision.status, details: decision.details };
      }

      case 'SchemeChecklistProgress': {
        await this.schemes.upsertChecklistProgress({
          ...payload,
          id: entityId,
          schoolId: change.schoolId,
          deviceId: change.deviceId,
          hlc: change.hlc,
        });
        return { status: 'applied' };
      }

      case 'Lesson':
      case 'Scheme': {
        // Content pushed from client devices is rejected as server-authoritative
        const decision = resolveContentConflict(null, payload, true /* isDeviceClient */);
        return { status: decision.status, details: decision.details };
      }

      default:
        return { status: 'rejected', details: `Unsupported entity type "${entity}"` };
    }
  }

  async pullChanges(query: SyncPullQuery): Promise<SyncPullResponse> {
    const limit = Math.min(query.limit ?? 100, 500);
    const since = query.since ?? 0;

    const entries = await this.changeLog.findSince(since, limit + 1, query.schoolId);
    const hasMore = entries.length > limit;
    const returnEntries = hasMore ? entries.slice(0, limit) : entries;

    const currentSeq = returnEntries.length > 0
      ? returnEntries[returnEntries.length - 1].seq
      : since;

    const changes = returnEntries.map((e) => ({
      seq: e.seq,
      entity: e.entity,
      entityId: e.entityId,
      op: e.op as any,
      schoolId: e.schoolId,
      payload: e.payload as any,
      hlc: e.hlc,
      receivedAt: e.receivedAt.toISOString(),
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
}

export const syncService = new SyncService();
