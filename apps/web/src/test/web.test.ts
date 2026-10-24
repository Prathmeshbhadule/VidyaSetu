const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => storageMap.get(k) ?? null,
  setItem: (k: string, v: string) => storageMap.set(k, String(v)),
  removeItem: (k: string) => storageMap.delete(k),
  clear: () => storageMap.clear(),
  key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
  length: 0,
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { offlineDb } from '../db/offline-db.js';
import { syncManager } from '../services/sync-manager.js';
import { speakText, stopSpeaking } from '../services/speech.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { useSyncStore } from '../store/useSyncStore.js';
import { translations, SupportedLanguage, StudentProfile } from '@vidya-setu/shared';
import i18n from '../i18n/index.js';

describe('Vidya Setu Web - Offline-First PWA Tests', () => {
  beforeEach(async () => {
    // Clear in-memory IndexedDB tables before each test
    await offlineDb.students.clear();
    await offlineDb.attendance.clear();
    await offlineDb.lessons.clear();
    await offlineDb.quizzes.clear();
    await offlineDb.quizResults.clear();
    await offlineDb.outbox.clear();
  });

  afterEach(() => {
    useAuthStore.getState().logout();
  });

  describe('Offline Database (Dexie IndexedDB)', () => {
    it('initializes tables and allows offline CRUD without network', async () => {
      const student = {
        id: '018f679a-st01-7000-8000-000000000001',
        schoolId: '018f679a-1111-7000-8000-000000000001',
        name: 'Aarav Patil (आरव पाटील)',
        prn: 'PRN-2026-001',
        grade: 3,
        assessedLevel: 2,
        avatarId: 'lion',
        pinHash: '1234',
        parentalConsent: true,
        gender: 'MALE' as const,
        version: 1,
        deviceId: 'device-test-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };

      await offlineDb.students.put(student);
      const retrieved = await offlineDb.students.get(student.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Aarav Patil (आरव पाटील)');
      expect(retrieved?.pinHash).toBe('1234');
      expect(retrieved?.grade).toBe(3);
    });

    it('stores attendance records locally with composite queryability', async () => {
      const attendanceRecord = {
        id: '018f679a-at01-7000-8000-000000000001',
        studentId: '018f679a-st01-7000-8000-000000000001',
        schoolId: '018f679a-1111-7000-8000-000000000001',
        date: '2026-10-24',
        status: 'PRESENT' as const,
        markedBy: 'teacher-uuid',
        source: 'TEACHER' as const,
        hlc: '2026-10-24T00:00:00.000Z-0000-node1',
        version: 1,
        deviceId: 'device-test-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };

      await offlineDb.attendance.put(attendanceRecord);
      const found = await offlineDb.attendance.where('studentId').equals(attendanceRecord.studentId).toArray();

      expect(found).toHaveLength(1);
      expect(found[0].status).toBe('PRESENT');
      expect(found[0].date).toBe('2026-10-24');
    });
  });

  describe('Outbox Pattern & Sync Manager', () => {
    it('atomically mutates local table and registers an OutboxItem with HLC clock and priority', async () => {
      const attendance = {
        id: '018f679a-at02-7000-8000-000000000002',
        studentId: '018f679a-st02-7000-8000-000000000002',
        schoolId: '018f679a-1111-7000-8000-000000000001',
        date: '2026-10-24',
        status: 'ABSENT' as const,
        markedBy: 'teacher-offline',
        source: 'TEACHER' as const,
        hlc: '',
        version: 1,
        deviceId: 'device-test-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };

      const result = await syncManager.mutate(
        'Attendance',
        offlineDb.attendance,
        attendance,
        'INSERT',
        1 // high priority
      );

      expect(result.id).toBe(attendance.id);

      // Verify written to local table
      const stored = await offlineDb.attendance.get(attendance.id);
      expect(stored).toBeDefined();
      expect(stored?.status).toBe('ABSENT');

      // Verify written to outbox table
      const outboxItems = await offlineDb.outbox.toArray();
      expect(outboxItems).toHaveLength(1);
      expect(outboxItems[0].entity).toBe('Attendance');
      expect(outboxItems[0].entityId).toBe(attendance.id);
      expect(outboxItems[0].op).toBe('INSERT');
      expect(outboxItems[0].priority).toBe(1);
      expect(outboxItems[0].hlc).toBeDefined();
      expect(outboxItems[0].status).toBe('PENDING');
    });
  });

  describe('Internationalization & Multi-language Support', () => {
    it('contains comprehensive translation bundles for en, hi, and mr', () => {
      const languages: SupportedLanguage[] = ['en', 'hi', 'mr'];

      for (const lang of languages) {
        const bundle = translations[lang];
        expect(bundle).toBeDefined();
        expect(bundle.common.appName).toBeDefined();
        expect(bundle.common.student).toBeDefined();
        expect(bundle.common.teacher).toBeDefined();
        expect(bundle.teacher.markPresent).toBeDefined();
        expect(bundle.teacher.markAbsent).toBeDefined();
        expect(bundle.schemes.title).toBeDefined();
      }
    });

    it('switches languages dynamically in i18next', async () => {
      await i18n.changeLanguage('hi');
      expect(i18n.language).toBe('hi');
      expect(i18n.t('common.appName')).toBe('विद्या सेतु');

      await i18n.changeLanguage('mr');
      expect(i18n.language).toBe('mr');
      expect(i18n.t('common.appName')).toBe('विद्या सेतू');

      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
      expect(i18n.t('common.appName')).toBe('Vidya Setu');
    });
  });

  describe('Auth Store (Zustand)', () => {
    it('handles student PIN authentication and switching modes', () => {
      const store = useAuthStore.getState();
      expect(store.isAuthenticated).toBe(false);
      expect(store.currentStudent).toBeNull();

      const mockStudent: StudentProfile = {
        id: '018f679a-st01-7000-8000-000000000001',
        schoolId: '018f679a-1111-7000-8000-000000000001',
        name: 'Priya Sharma (प्रिया शर्मा)',
        prn: 'PRN-2026-002',
        grade: 4,
        assessedLevel: 3,
        avatarId: 'elephant',
        pinHash: '5678',
        parentalConsent: true,
        gender: 'FEMALE' as const,
        version: 1,
        deviceId: 'hub',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };

      store.loginStudent(mockStudent);
      const afterLogin = useAuthStore.getState();
      expect(afterLogin.isAuthenticated).toBe(true);
      expect(afterLogin.role).toBe('STUDENT');
      expect(afterLogin.currentStudent?.name).toBe('Priya Sharma (प्रिया शर्मा)');

      // Toggle simple UI mode for low-literacy students
      store.toggleSimpleMode();
      expect(useAuthStore.getState().isSimpleMode).toBe(true);

      store.logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().currentStudent).toBeNull();
    });
  });

  describe('Speech Service & TTS Fallback', () => {
    it('handles speech execution safely in headless/offline environments', () => {
      expect(() => speakText('नमस्ते', 'hi')).not.toThrow();
      expect(() => stopSpeaking()).not.toThrow();
    });
  });
});
