import Dexie, { type EntityTable } from 'dexie';
import {
  StudentProfile,
  AttendanceRecord,
  Lesson,
  Video,
  Quiz,
  QuizResult,
  Scheme,
  SchemeChecklistProgress,
  NotificationRecord,
  AtRiskFlag,
  StudyMaterial,
  ChangeItem,
} from '@vidya-setu/shared';

export interface OutboxItem extends ChangeItem {
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  createdAt: string;
  attempts: number;
  lastError?: string;
}

export interface AppMetadata {
  key: string;
  value: string;
}

export class VidyaSetuOfflineDb extends Dexie {
  students!: EntityTable<StudentProfile, 'id'>;
  attendance!: EntityTable<AttendanceRecord, 'id'>;
  lessons!: EntityTable<Lesson, 'id'>;
  videos!: EntityTable<Video, 'id'>;
  quizzes!: EntityTable<Quiz, 'id'>;
  quizResults!: EntityTable<QuizResult, 'id'>;
  studyMaterials!: EntityTable<StudyMaterial, 'id'>;
  schemes!: EntityTable<Scheme, 'id'>;
  checklists!: EntityTable<SchemeChecklistProgress, 'id'>;
  notifications!: EntityTable<NotificationRecord, 'id'>;
  atRiskFlags!: EntityTable<AtRiskFlag, 'id'>;
  outbox!: EntityTable<OutboxItem, 'id'>;
  metadata!: EntityTable<AppMetadata, 'key'>;

  constructor() {
    super('VidyaSetuOfflineDB');

    this.version(1).stores({
      students: 'id, prn, grade, schoolId, assessedLevel',
      attendance: 'id, [studentId+date], studentId, date, schoolId, status',
      lessons: 'id, subject, grade, level, status',
      quizzes: 'id, lessonId, subject, grade',
      quizResults: 'id, studentId, quizId, submittedAt',
      schemes: 'id, girlSpecific',
      checklists: 'id, [studentId+schemeId], studentId, schemeId',
      notifications: 'id, recipientId, schoolId, status',
      atRiskFlags: 'id, studentId, schoolId, ruleId, resolvedAt',
      outbox: 'id, priority, status, createdAt',
      metadata: 'key',
    });

    this.version(2).stores({
      videos: 'id, lessonId, subject',
      studyMaterials: 'id, subject, grade, type',
    });
  }
}

export const offlineDb = new VidyaSetuOfflineDb();
