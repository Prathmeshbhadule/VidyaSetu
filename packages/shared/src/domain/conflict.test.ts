import { describe, it, expect } from 'vitest';
import {
  resolveQuizResultConflict,
  resolveAttendanceConflict,
  resolveStudentProgressMerge,
  resolveProfileFieldsConflict,
  resolveContentConflict,
  resolveAtRiskFlagConflict,
} from './conflict.js';
import { AttendanceRecord, QuizResult, AtRiskFlag, Lesson, StudentProfile } from '../types/index.js';

describe('Offline Sync Conflict Resolution Rules', () => {
  it('QuizResult: handles null existing record and duplicates', () => {
    const incoming: QuizResult = {
      id: 'res-1',
      schoolId: 's1',
      studentId: 'stu-1',
      quizId: 'q-1',
      mode: 'QUIZ',
      answers: [],
      score: 10,
      maxScore: 10,
      assessedLevel: 3,
      startedAt: '2026-03-01T10:00:00Z',
      submittedAt: '2026-03-01T10:10:00Z',
      version: 1,
      deviceId: 'dev-1',
      createdAt: '2026-03-01T10:10:00Z',
      updatedAt: '2026-03-01T10:10:00Z',
      deletedAt: null,
    };

    const firstDecision = resolveQuizResultConflict(null, incoming);
    expect(firstDecision.applied).toBe(true);
    expect(firstDecision.status).toBe('applied');

    const dupDecision = resolveQuizResultConflict(incoming, incoming);
    expect(dupDecision.applied).toBe(false);
    expect(dupDecision.status).toBe('duplicate');
  });

  it('Attendance: handles null existing, teacher precedence, and deviceId tie-breaking', () => {
    const rec1: AttendanceRecord = {
      id: 'att-1',
      schoolId: 's1',
      studentId: 'stu-1',
      date: '2026-03-01',
      status: 'ABSENT',
      markedBy: 'system',
      source: 'DEVICE_AUTO',
      hlc: '5000:0:hub-sensor',
      version: 2,
      deviceId: 'dev-hub',
      createdAt: '',
      updatedAt: '2026-03-01T12:00:00Z',
      deletedAt: null,
    };

    const recTeacher: AttendanceRecord = {
      id: 'att-1',
      schoolId: 's1',
      studentId: 'stu-1',
      date: '2026-03-01',
      status: 'PRESENT',
      markedBy: 'teacher',
      source: 'TEACHER',
      hlc: '4000:0:tablet-01',
      version: 1,
      deviceId: 'dev-tablet-01',
      createdAt: '',
      updatedAt: '2026-03-01T11:00:00Z',
      deletedAt: null,
    };

    // null existing
    expect(resolveAttendanceConflict(null, rec1).applied).toBe(true);

    // Teacher edit beats auto
    expect(resolveAttendanceConflict(rec1, recTeacher).applied).toBe(true);
    // Auto edit rejected when existing is teacher
    expect(resolveAttendanceConflict(recTeacher, rec1).applied).toBe(false);

    // Older HLC rejected
    const older: AttendanceRecord = { ...recTeacher, hlc: '1000:0:tab' };
    const newer: AttendanceRecord = { ...recTeacher, hlc: '2000:0:tab' };
    expect(resolveAttendanceConflict(newer, older).applied).toBe(false);

    // Exact HLC tie broken by deviceId
    const tie1: AttendanceRecord = { ...recTeacher, hlc: '2000:0:nodeA', deviceId: 'nodeA' };
    const tie2: AttendanceRecord = { ...recTeacher, hlc: '2000:0:nodeA', deviceId: 'nodeB' };
    expect(resolveAttendanceConflict(tie1, tie2).applied).toBe(true);
    expect(resolveAttendanceConflict(tie2, tie1).applied).toBe(false);
  });

  it('Student Progress: merges using max level and union of completed lessons', () => {
    const merged = resolveStudentProgressMerge(
      3,
      4,
      ['lesson-1', 'lesson-2'],
      ['lesson-2', 'lesson-3']
    );

    expect(merged.mergedLevel).toBe(4);
    expect(merged.mergedCompletedLessonIds).toEqual(['lesson-1', 'lesson-2', 'lesson-3']);
  });

  it('Profile Fields: resolves via HLC LWW', () => {
    const p1: StudentProfile = {
      id: 'p1',
      schoolId: 's1',
      name: 'Rohan Old',
      prn: 'PRN1',
      grade: 3,
      gender: 'MALE',
      assessedLevel: 2,
      avatarId: 'av1',
      pinHash: '1234',
      parentalConsent: true,
      hlc: '1000:0:dev1',
      version: 1,
      deviceId: 'dev1',
      createdAt: '',
      updatedAt: '',
      deletedAt: null,
    };

    const p2: StudentProfile = {
      ...p1,
      name: 'Rohan New',
      hlc: '2000:0:dev1',
      version: 2,
    };

    expect(resolveProfileFieldsConflict(null, p1).applied).toBe(true);

    const decisionNew = resolveProfileFieldsConflict(p1, p2);
    expect(decisionNew.applied).toBe(true);
    expect(decisionNew.winner.name).toBe('Rohan New');

    const decisionOld = resolveProfileFieldsConflict(p2, p1);
    expect(decisionOld.applied).toBe(false);
  });

  it('Content: handles server admin updates and device rejections', () => {
    const l1: Lesson = {
      id: 'l1',
      schoolId: 's1',
      title: 'Science v1',
      subject: 'SCIENCE',
      grade: 4,
      level: 3,
      contentBlocks: [],
      status: 'PUBLISHED',
      estimatedMinutes: 15,
      version: 1,
      deviceId: 'cloud',
      createdAt: '',
      updatedAt: '',
      deletedAt: null,
    };

    const l2: Lesson = { ...l1, title: 'Science v2', version: 2 };

    // Device rejection
    expect(resolveContentConflict(l1, l2, true).applied).toBe(false);

    // Server update with higher version applied
    expect(resolveContentConflict(l1, l2, false).applied).toBe(true);

    // Server update with same/lower version duplicate
    expect(resolveContentConflict(l2, l1, false).applied).toBe(false);

    // null existing
    expect(resolveContentConflict(null, l1, false).applied).toBe(true);
  });

  it('AtRiskFlag: handles null, manual resolution, and HLC fallback', () => {
    const unresolved: AtRiskFlag = {
      id: 'flag-1',
      schoolId: 's1',
      studentId: 'stu-1',
      ruleId: 'RULE_ATTENDANCE_LOW',
      reason: 'Low attendance',
      raisedAt: '2026-03-01T10:00:00Z',
      resolvedAt: null,
      resolvedBy: null,
      version: 1,
      deviceId: 'dev-1',
      hlc: '1000:0:dev-1',
      createdAt: '',
      updatedAt: '2026-03-01T10:00:00Z',
      deletedAt: null,
    };

    const resolved: AtRiskFlag = {
      ...unresolved,
      resolvedAt: '2026-03-02T10:00:00Z',
      resolvedBy: 'teacher-01',
      note: 'Home visit completed',
      hlc: '3000:0:dev-1',
    };

    // null existing
    expect(resolveAtRiskFlagConflict(null, unresolved).applied).toBe(true);

    // Incoming resolved beats unresolved
    expect(resolveAtRiskFlagConflict(unresolved, resolved).applied).toBe(true);

    // Existing resolved resists unresolved
    expect(resolveAtRiskFlagConflict(resolved, unresolved).applied).toBe(false);

    // Both unresolved: higher HLC wins
    const unresolved2 = { ...unresolved, hlc: '2000:0:dev-1' };
    expect(resolveAtRiskFlagConflict(unresolved, unresolved2).applied).toBe(true);
    expect(resolveAtRiskFlagConflict(unresolved2, unresolved).applied).toBe(false);
  });
});
