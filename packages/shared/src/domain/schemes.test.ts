import { describe, it, expect } from 'vitest';
import { evaluateSchemeEligibility, computeChecklistProgress } from './schemes.js';
import { Scheme, StudentProfile } from '../types/index.js';

describe('Government Schemes Eligibility and Checklist', () => {
  const studentBoy: StudentProfile = {
    id: 's1',
    schoolId: 'sch1',
    name: 'Aakash',
    prn: 'P1',
    grade: 6,
    gender: 'MALE',
    assessedLevel: 3,
    avatarId: 'a1',
    pinHash: '1111',
    parentalConsent: true,
    version: 1,
    deviceId: 'd1',
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  };

  const studentGirl: StudentProfile = {
    ...studentBoy,
    id: 's2',
    name: 'Priya',
    gender: 'FEMALE',
    grade: 8,
  };

  const girlScheme: Scheme = {
    id: 'sch-girl',
    schoolId: 'sch1',
    name: 'Bicycle Scheme for Girls',
    description: 'Free bicycle for rural girls entering Grade 8',
    girlSpecific: true,
    attendanceThreshold: 75,
    eligibilityRules: {
      gender: 'FEMALE',
      minGrade: 8,
      maxGrade: 8,
      minAge: 13,
      maxAge: 15,
      minAttendancePercent: 75,
    },
    requiredDocuments: ['School Enrollment Certificate', 'BPL Ration Card Copy'],
    applicationSteps: ['Fill form', 'Headmaster verification'],
    whereToApply: 'School Office',
    sourceUrl: 'https://example.gov.in',
    lastVerifiedAt: '2026-01-01',
    version: 1,
    deviceId: 'd1',
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  };

  it('rejects male student for girl-specific scheme', () => {
    const result = evaluateSchemeEligibility(girlScheme, studentBoy, 85);
    expect(result.eligible).toBe(false);
    expect(result.missingCriteria.some((c) => c.includes('girl students'))).toBe(true);
  });

  it('approves eligible girl student meeting grade, age, and attendance threshold', () => {
    const result = evaluateSchemeEligibility(girlScheme, studentGirl, 80, 14 /* age */);
    expect(result.eligible).toBe(true);
    expect(result.missingCriteria).toHaveLength(0);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('rejects girl student when age is outside criteria', () => {
    // Too young (11)
    const tooYoung = evaluateSchemeEligibility(girlScheme, studentGirl, 80, 11);
    expect(tooYoung.eligible).toBe(false);
    expect(tooYoung.missingCriteria.some((c) => c.includes('Minimum age'))).toBe(true);

    // Too old (16)
    const tooOld = evaluateSchemeEligibility(girlScheme, studentGirl, 80, 16);
    expect(tooOld.eligible).toBe(false);
    expect(tooOld.missingCriteria.some((c) => c.includes('Maximum age'))).toBe(true);
  });

  it('rejects girl student when attendance falls below threshold', () => {
    const result = evaluateSchemeEligibility(girlScheme, studentGirl, 70);
    expect(result.eligible).toBe(false);
    expect(result.missingCriteria.some((c) => c.includes('attendance'))).toBe(true);
  });

  it('computes checklist progress cleanly without collecting ID numbers', () => {
    const docs = ['Aadhaar Card Copy', 'BPL Card', 'Bank Passbook Copy'];
    const checked = ['Aadhaar Card Copy', 'Bank Passbook Copy'];

    const progress = computeChecklistProgress(docs, checked);
    expect(progress.totalDocs).toBe(3);
    expect(progress.readyDocsCount).toBe(2);
    expect(progress.percentage).toBe(67);
    expect(progress.isComplete).toBe(false);
    expect(progress.missingDocs).toEqual(['BPL Card']);

    // Empty required docs
    const emptyProgress = computeChecklistProgress([]);
    expect(emptyProgress.isComplete).toBe(true);
    expect(emptyProgress.percentage).toBe(100);
  });
});
