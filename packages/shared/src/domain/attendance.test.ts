import { describe, it, expect } from 'vitest';
import { calculateAttendanceMetrics, filterAttendanceWindow, meetsAttendanceThreshold } from './attendance.js';
import { AttendanceRecord } from '../types/index.js';

describe('Attendance Domain Calculations', () => {
  const records: AttendanceRecord[] = [
    { id: '1', schoolId: 's1', studentId: 'stu1', date: '2026-03-01', status: 'PRESENT', markedBy: 't1', source: 'TEACHER', version: 1, deviceId: 'd1', createdAt: '', updatedAt: '', deletedAt: null },
    { id: '2', schoolId: 's1', studentId: 'stu1', date: '2026-03-02', status: 'PRESENT', markedBy: 't1', source: 'TEACHER', version: 1, deviceId: 'd1', createdAt: '', updatedAt: '', deletedAt: null },
    { id: '3', schoolId: 's1', studentId: 'stu1', date: '2026-03-03', status: 'LEAVE', markedBy: 't1', source: 'TEACHER', version: 1, deviceId: 'd1', createdAt: '', updatedAt: '', deletedAt: null },
    { id: '4', schoolId: 's1', studentId: 'stu1', date: '2026-03-04', status: 'ABSENT', markedBy: 't1', source: 'TEACHER', version: 1, deviceId: 'd1', createdAt: '', updatedAt: '', deletedAt: null },
    { id: '5', schoolId: 's1', studentId: 'stu1', date: '2026-03-05', status: 'ABSENT', markedBy: 't1', source: 'TEACHER', version: 1, deviceId: 'd1', createdAt: '', updatedAt: '', deletedAt: null },
  ];

  it('calculates metrics and consecutive absences ending at latest date', () => {
    const metrics = calculateAttendanceMetrics(records, 10 /* totalSchoolDays */);
    expect(metrics.totalRecords).toBe(5);
    expect(metrics.presentCount).toBe(2);
    expect(metrics.absentCount).toBe(2);
    expect(metrics.leaveCount).toBe(1);
    expect(metrics.attendancePercent).toBe(20); // 2/10 = 20%
    expect(metrics.consecutiveAbsences).toBe(2); // ends with 2 consecutive absences
  });

  it('handles empty records cleanly', () => {
    const emptyMetrics = calculateAttendanceMetrics([]);
    expect(emptyMetrics.totalRecords).toBe(0);
    expect(emptyMetrics.attendancePercent).toBe(0);
    expect(emptyMetrics.consecutiveAbsences).toBe(0);
  });

  it('checks threshold satisfaction', () => {
    expect(meetsAttendanceThreshold(75, 75)).toBe(true);
    expect(meetsAttendanceThreshold(74, 75)).toBe(false);
    expect(meetsAttendanceThreshold(85, 75)).toBe(true);
  });

  it('filters window accurately based on reference date', () => {
    const filtered = filterAttendanceWindow(records, 2, '2026-03-05T00:00:00.000Z');
    expect(filtered.length).toBeGreaterThan(0);
  });
});
