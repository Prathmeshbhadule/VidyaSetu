import { Scheme, SchemeRule, StudentProfile } from '../types/index.js';

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  missingCriteria: string[];
}

export interface ChecklistSummary {
  totalDocs: number;
  readyDocsCount: number;
  percentage: number;
  isComplete: boolean;
  missingDocs: string[];
}

/**
 * Evaluates whether a student is eligible for a given government scheme
 * based on its JSON eligibility rules.
 */
export function evaluateSchemeEligibility(
  scheme: Scheme,
  student: StudentProfile,
  attendancePercent: number = 100,
  studentAgeYears?: number
): EligibilityResult {
  const rules = scheme.eligibilityRules || {};
  const reasons: string[] = [];
  const missingCriteria: string[] = [];

  // 1. Gender check
  if (scheme.girlSpecific || (rules.gender && rules.gender === 'FEMALE')) {
    if (student.gender !== 'FEMALE') {
      missingCriteria.push('Scheme is exclusively for girl students');
    } else {
      reasons.push('Meets girl-child eligibility criterion');
    }
  }

  // 2. Grade check
  if (rules.minGrade !== undefined && student.grade < rules.minGrade) {
    missingCriteria.push(`Minimum grade required is Grade ${rules.minGrade} (student is Grade ${student.grade})`);
  } else if (rules.maxGrade !== undefined && student.grade > rules.maxGrade) {
    missingCriteria.push(`Maximum grade allowed is Grade ${rules.maxGrade} (student is Grade ${student.grade})`);
  } else if (rules.minGrade !== undefined || rules.maxGrade !== undefined) {
    reasons.push(`Student grade (${student.grade}) is within eligible range`);
  }

  // 3. Age check (if student age provided)
  if (studentAgeYears !== undefined) {
    if (rules.minAge !== undefined && studentAgeYears < rules.minAge) {
      missingCriteria.push(`Minimum age required is ${rules.minAge} years`);
    } else if (rules.maxAge !== undefined && studentAgeYears > rules.maxAge) {
      missingCriteria.push(`Maximum age allowed is ${rules.maxAge} years`);
    } else if (rules.minAge !== undefined || rules.maxAge !== undefined) {
      reasons.push(`Student age (${studentAgeYears} yrs) meets criterion`);
    }
  }

  // 4. Attendance threshold check
  const threshold = scheme.attendanceThreshold ?? rules.minAttendancePercent;
  if (threshold !== undefined) {
    if (attendancePercent < threshold) {
      missingCriteria.push(`Requires at least ${threshold}% attendance (current: ${attendancePercent}%)`);
    } else {
      reasons.push(`Attendance (${attendancePercent}%) meets requirement (>= ${threshold}%)`);
    }
  }

  const eligible = missingCriteria.length === 0;

  return {
    eligible,
    reasons,
    missingCriteria,
  };
}

/**
 * Calculates offline document checklist progress for a scheme.
 * Crucially: NEVER collects or stores ID numbers, only tracks document readiness checkboxes.
 */
export function computeChecklistProgress(
  requiredDocuments: string[],
  checkedDocs: string[] = []
): ChecklistSummary {
  if (!requiredDocuments || requiredDocuments.length === 0) {
    return {
      totalDocs: 0,
      readyDocsCount: 0,
      percentage: 100,
      isComplete: true,
      missingDocs: [],
    };
  }

  const checkedSet = new Set(checkedDocs);
  const readyDocs = requiredDocuments.filter((doc) => checkedSet.has(doc));
  const missingDocs = requiredDocuments.filter((doc) => !checkedSet.has(doc));

  const totalDocs = requiredDocuments.length;
  const readyDocsCount = readyDocs.length;
  const percentage = Math.round((readyDocsCount / totalDocs) * 100);

  return {
    totalDocs,
    readyDocsCount,
    percentage,
    isComplete: readyDocsCount === totalDocs,
    missingDocs,
  };
}
