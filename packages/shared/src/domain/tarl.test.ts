import { describe, it, expect } from 'vitest';
import { computeTaRLGroups, TARL_ACTIVITIES } from './tarl.js';
import { StudentProfile } from '../types/index.js';

describe('Teaching at the Right Level (TaRL) Grouping', () => {
  const students: StudentProfile[] = [
    { id: 's1', schoolId: 'sch1', name: 'Raju', prn: 'P1', grade: 3, gender: 'MALE', assessedLevel: 1, avatarId: 'a1', pinHash: '1111', parentalConsent: true, version: 1, deviceId: 'd1', createdAt: '', updatedAt: '', deletedAt: null },
    { id: 's2', schoolId: 'sch1', name: 'Pooja', prn: 'P2', grade: 3, gender: 'FEMALE', assessedLevel: 2, avatarId: 'a2', pinHash: '2222', parentalConsent: true, version: 1, deviceId: 'd1', createdAt: '', updatedAt: '', deletedAt: null },
    { id: 's3', schoolId: 'sch1', name: 'Amit', prn: 'P3', grade: 4, gender: 'MALE', assessedLevel: 3, avatarId: 'a3', pinHash: '3333', parentalConsent: true, version: 1, deviceId: 'd1', createdAt: '', updatedAt: '', deletedAt: null },
    { id: 's4', schoolId: 'sch1', name: 'Geeta', prn: 'P4', grade: 4, gender: 'FEMALE', assessedLevel: 5, avatarId: 'a4', pinHash: '4444', parentalConsent: true, version: 1, deviceId: 'd1', createdAt: '', updatedAt: '', deletedAt: null },
  ];

  it('groups students strictly into 5 TaRL levels with pedagogical activities', () => {
    const groups = computeTaRLGroups(students);

    expect(groups.length).toBe(5);
    expect(groups[0].studentIds).toContain('s1'); // Level 1
    expect(groups[1].studentIds).toContain('s2'); // Level 2
    expect(groups[2].studentIds).toContain('s3'); // Level 3
    expect(groups[3].studentIds).toHaveLength(0); // Level 4
    expect(groups[4].studentIds).toContain('s4'); // Level 5

    // Verify activities are populated
    expect(groups[0].recommendedActivities.length).toBeGreaterThan(0);
    expect(groups[0].recommendedActivities[0].subject).toBeDefined();
  });

  it('honors teacher manual override for a student level', () => {
    // Teacher overrides s1 (Raju) from Level 1 to Level 2
    const overrides = { s1: 2 };
    const groups = computeTaRLGroups(students, overrides);

    expect(groups[0].studentIds).not.toContain('s1');
    expect(groups[1].studentIds).toContain('s1');
    expect(groups[1].studentIds).toContain('s2');
  });
});
