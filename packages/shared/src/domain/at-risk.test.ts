import { describe, it, expect } from 'vitest';
import { evaluateStudentAtRisk, createAtRiskEntities } from './at-risk.js';
import { AttendanceRecord, Scheme, StudentProfile } from '../types/index.js';

describe('At-Risk & Girl-Child Retention Engine', () => {
  const baseStudent: StudentProfile = {
    id: 'stu-1',
    schoolId: 'sch-1',
    name: 'Sunita Sharma',
    prn: 'PRN1001',
    grade: 5,
    gender: 'FEMALE',
    assessedLevel: 3,
    avatarId: 'avatar-1',
    pinHash: '1234',
    parentalConsent: true,
    version: 1,
    deviceId: 'dev-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  const sampleSchemes: Scheme[] = [
    {
      id: 'sch-girl-1',
      schoolId: 'sch-1',
      name: 'Kasturba Balika Support',
      description: 'Stipend for rural girl education',
      girlSpecific: true,
      eligibilityRules: { gender: 'FEMALE', minGrade: 5 },
      requiredDocuments: ['School Bonafide Certificate'],
      applicationSteps: ['Submit form to headmaster'],
      whereToApply: 'School Office',
      sourceUrl: 'https://example.gov.in',
      lastVerifiedAt: '2026-01-01',
      version: 1,
      deviceId: 'dev-1',
      createdAt: '',
      updatedAt: '',
      deletedAt: null,
    },
    {
      id: 'sch-gen-1',
      schoolId: 'sch-1',
      name: 'Mid Day Meal',
      description: 'Nutritional meal',
      girlSpecific: false,
      eligibilityRules: {},
      requiredDocuments: [],
      applicationSteps: [],
      whereToApply: 'School',
      sourceUrl: 'https://example.gov.in',
      lastVerifiedAt: '2026-01-01',
      version: 1,
      deviceId: 'dev-1',
      createdAt: '',
      updatedAt: '',
      deletedAt: null,
    },
  ];

  it('triggers RULE_ATTENDANCE_LOW when attendance drops below 75% over 30 days', () => {
    const records: AttendanceRecord[] = [];
    const baseDate = new Date('2026-03-01T00:00:00.000Z');

    for (let i = 0; i < 20; i++) {
      const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      records.push({
        id: `att-${i}`,
        schoolId: 'sch-1',
        studentId: 'stu-1',
        date: d,
        status: i < 10 ? 'PRESENT' : 'ABSENT',
        markedBy: 'teacher-1',
        source: 'TEACHER',
        version: 1,
        deviceId: 'dev-1',
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
      });
    }

    const evaluation = evaluateStudentAtRisk(baseStudent, records, sampleSchemes, undefined, '2026-03-22T00:00:00.000Z');
    expect(evaluation.isAtRisk).toBe(true);
    expect(evaluation.flags.some((f) => f.ruleId === 'RULE_ATTENDANCE_LOW')).toBe(true);
    const lowAttFlag = evaluation.flags.find((f) => f.ruleId === 'RULE_ATTENDANCE_LOW');
    expect(lowAttFlag?.suggestedSchemeIds).toContain('sch-girl-1');

    // Test createAtRiskEntities
    const entities = createAtRiskEntities(baseStudent, evaluation, 'dev-1');
    expect(entities.length).toBe(evaluation.flags.length);
    expect(entities[0].studentId).toBe('stu-1');
    expect(entities[0].resolvedAt).toBeNull();
  });

  it('triggers RULE_CONSECUTIVE_ABSENCE when 5 or more consecutive absences occur', () => {
    const records: AttendanceRecord[] = [];
    const baseDate = new Date('2026-03-01T00:00:00.000Z');

    for (let i = 0; i < 6; i++) {
      const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      records.push({
        id: `att-${i}`,
        schoolId: 'sch-1',
        studentId: 'stu-1',
        date: d,
        status: 'ABSENT',
        markedBy: 'teacher-1',
        source: 'TEACHER',
        version: 1,
        deviceId: 'dev-1',
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
      });
    }

    const evaluation = evaluateStudentAtRisk(baseStudent, records, sampleSchemes, undefined, '2026-03-08T00:00:00.000Z');
    expect(evaluation.isAtRisk).toBe(true);
    expect(evaluation.flags.some((f) => f.ruleId === 'RULE_CONSECUTIVE_ABSENCE')).toBe(true);
  });

  it('triggers RULE_GIRL_CHILD_RETENTION when attendance is 78% (below 80% girl-child threshold)', () => {
    // 10 records: 8 present, 2 absent -> 80% attendance is target, let's do 18 present, 5 absent out of 23 -> 78%
    const records: AttendanceRecord[] = [];
    const baseDate = new Date('2026-03-01T00:00:00.000Z');

    for (let i = 0; i < 23; i++) {
      const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      records.push({
        id: `att-${i}`,
        schoolId: 'sch-1',
        studentId: 'stu-1',
        date: d,
        status: i < 18 ? 'PRESENT' : 'ABSENT', // 18 / 23 = 78.2% -> >= 75% so not low attendance, but < 80% girl retention!
        markedBy: 'teacher-1',
        source: 'TEACHER',
        version: 1,
        deviceId: 'dev-1',
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
      });
    }

    const evaluation = evaluateStudentAtRisk(baseStudent, records, sampleSchemes, undefined, '2026-03-24T00:00:00.000Z');
    expect(evaluation.isAtRisk).toBe(true);
    expect(evaluation.flags.some((f) => f.ruleId === 'RULE_GIRL_CHILD_RETENTION')).toBe(true);
  });
});
