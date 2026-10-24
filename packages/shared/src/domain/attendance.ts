import { AttendanceRecord, AttendanceStatus } from '../types/index.js';

export interface AttendanceSummary {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  attendancePercent: number; // 0 to 100
  consecutiveAbsences: number; // Most recent streak of consecutive absences
}

/**
 * Calculates attendance metrics for a student from a set of attendance records.
 * Sorts records chronologically by date ascending before processing.
 */
export function calculateAttendanceMetrics(
  records: AttendanceRecord[],
  totalSchoolDays?: number
): AttendanceSummary {
  if (!records || records.length === 0) {
    return {
      totalRecords: 0,
      presentCount: 0,
      absentCount: 0,
      leaveCount: 0,
      attendancePercent: 0,
      consecutiveAbsences: 0,
    };
  }

  // Sort by date ascending
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;

  for (const r of sorted) {
    if (r.status === 'PRESENT') {
      presentCount++;
    } else if (r.status === 'ABSENT') {
      absentCount++;
    } else if (r.status === 'LEAVE') {
      leaveCount++;
    }
  }

  // Effective days: totalSchoolDays if provided, else length of records
  const effectiveDays = totalSchoolDays && totalSchoolDays > 0 ? totalSchoolDays : records.length;
  const attendancePercent = effectiveDays > 0 ? Math.round((presentCount / effectiveDays) * 100) : 0;

  // Compute consecutive absences ending at the most recent record
  let consecutiveAbsences = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].status === 'ABSENT') {
      consecutiveAbsences++;
    } else {
      break;
    }
  }

  return {
    totalRecords: records.length,
    presentCount,
    absentCount,
    leaveCount,
    attendancePercent,
    consecutiveAbsences,
  };
}

/**
 * Filters attendance records within a given number of calendar days prior to a reference date.
 */
export function filterAttendanceWindow(
  records: AttendanceRecord[],
  days: number,
  referenceDateIso: string = new Date().toISOString()
): AttendanceRecord[] {
  const refDate = new Date(referenceDateIso);
  const cutoffTime = refDate.getTime() - days * 24 * 60 * 60 * 1000;

  return records.filter((r) => {
    const recordTime = new Date(r.date).getTime();
    return recordTime >= cutoffTime && recordTime <= refDate.getTime();
  });
}

/**
 * Checks if a student's attendance percentage meets a scheme's threshold.
 */
export function meetsAttendanceThreshold(
  attendancePercent: number,
  requiredThreshold: number = 75
): boolean {
  return attendancePercent >= requiredThreshold;
}
