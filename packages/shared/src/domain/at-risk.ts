import { AtRiskFlag, AttendanceRecord, Scheme, StudentProfile } from '../types/index.js';
import { calculateAttendanceMetrics, filterAttendanceWindow } from './attendance.js';
import { generateUuidV7 } from './uuidv7.js';

export interface AtRiskRuleConfig {
  lowAttendanceThresholdPercent: number; // default: 75%
  windowDays: number;                    // default: 30 days
  consecutiveAbsenceThreshold: number;   // default: 5
  girlChildAttendanceThreshold: number;  // default: 80%
}

export const DEFAULT_AT_RISK_CONFIG: AtRiskRuleConfig = {
  lowAttendanceThresholdPercent: 75,
  windowDays: 30,
  consecutiveAbsenceThreshold: 5,
  girlChildAttendanceThreshold: 80,
};

export interface AtRiskEvaluationResult {
  isAtRisk: boolean;
  flags: Array<{
    ruleId: string;
    reason: string;
    attendancePercent: number;
    consecutiveAbsences: number;
    suggestedSchemeIds: string[];
  }>;
}

/**
 * Deterministically evaluates whether a student is at risk of dropout or learning loss.
 */
export function evaluateStudentAtRisk(
  student: StudentProfile,
  allAttendance: AttendanceRecord[],
  availableSchemes: Scheme[] = [],
  config: AtRiskRuleConfig = DEFAULT_AT_RISK_CONFIG,
  referenceDateIso: string = new Date().toISOString()
): AtRiskEvaluationResult {
  const windowRecords = filterAttendanceWindow(allAttendance, config.windowDays, referenceDateIso);
  const metrics = calculateAttendanceMetrics(windowRecords);

  const flags: AtRiskEvaluationResult['flags'] = [];

  // Filter girl-specific schemes if relevant
  const girlSchemes = availableSchemes.filter((s) => s.girlSpecific).map((s) => s.id);
  const generalSchemes = availableSchemes.filter((s) => !s.girlSpecific).map((s) => s.id);

  // Rule 1: Attendance below 75% over 30 school days
  if (metrics.totalRecords >= 5 && metrics.attendancePercent < config.lowAttendanceThresholdPercent) {
    const suggested = student.gender === 'FEMALE' && girlSchemes.length > 0
      ? [...girlSchemes.slice(0, 2), ...generalSchemes.slice(0, 1)]
      : generalSchemes.slice(0, 2);

    flags.push({
      ruleId: 'RULE_ATTENDANCE_LOW',
      reason: `Attendance is ${metrics.attendancePercent}% over the past ${config.windowDays} days (below ${config.lowAttendanceThresholdPercent}% threshold)`,
      attendancePercent: metrics.attendancePercent,
      consecutiveAbsences: metrics.consecutiveAbsences,
      suggestedSchemeIds: suggested,
    });
  }

  // Rule 2: 5 or more consecutive absences
  if (metrics.consecutiveAbsences >= config.consecutiveAbsenceThreshold) {
    flags.push({
      ruleId: 'RULE_CONSECUTIVE_ABSENCE',
      reason: `${metrics.consecutiveAbsences} consecutive unexcused absences recorded`,
      attendancePercent: metrics.attendancePercent,
      consecutiveAbsences: metrics.consecutiveAbsences,
      suggestedSchemeIds: student.gender === 'FEMALE' ? girlSchemes.slice(0, 2) : generalSchemes.slice(0, 2),
    });
  }

  // Rule 3: Special Girl-Child Retention rule for upper primary / secondary (Grade >= 4)
  if (
    student.gender === 'FEMALE' &&
    student.grade >= 4 &&
    metrics.totalRecords >= 5 &&
    metrics.attendancePercent < config.girlChildAttendanceThreshold &&
    !flags.some((f) => f.ruleId === 'RULE_ATTENDANCE_LOW')
  ) {
    flags.push({
      ruleId: 'RULE_GIRL_CHILD_RETENTION',
      reason: `Girl student in Grade ${student.grade} attendance dropped to ${metrics.attendancePercent}% (below retention target ${config.girlChildAttendanceThreshold}%)`,
      attendancePercent: metrics.attendancePercent,
      consecutiveAbsences: metrics.consecutiveAbsences,
      suggestedSchemeIds: girlSchemes.length > 0 ? girlSchemes : generalSchemes.slice(0, 2),
    });
  }

  return {
    isAtRisk: flags.length > 0,
    flags,
  };
}

/**
 * Creates AtRiskFlag domain entities from evaluation flags.
 */
export function createAtRiskEntities(
  student: StudentProfile,
  evaluation: AtRiskEvaluationResult,
  deviceId: string,
  nowIso: string = new Date().toISOString()
): AtRiskFlag[] {
  return evaluation.flags.map((flag) => ({
    id: generateUuidV7(),
    schoolId: student.schoolId,
    studentId: student.id,
    ruleId: flag.ruleId,
    reason: flag.reason,
    attendancePercent: flag.attendancePercent,
    consecutiveAbsences: flag.consecutiveAbsences,
    suggestedSchemeIds: flag.suggestedSchemeIds,
    raisedAt: nowIso,
    resolvedAt: null,
    resolvedBy: null,
    note: undefined,
    createdAt: nowIso,
    updatedAt: nowIso,
    deletedAt: null,
    version: 1,
    deviceId,
  }));
}
