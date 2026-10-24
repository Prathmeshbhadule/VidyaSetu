import {
  AtRiskFlag,
  AttendanceRecord,
  Lesson,
  QuizResult,
  Scheme,
  StudentProfile,
  SyncedEntity,
} from '../types/index.js';
import { compareHlc } from './hlc.js';

export type ResolutionDecision<T> = {
  winner: T;
  applied: boolean;
  status: 'applied' | 'duplicate' | 'rejected' | 'conflict';
  details?: string;
};

/**
 * 1. QuizResult: Append-only, deduplicate by ID, never conflicts.
 */
export function resolveQuizResultConflict(
  existing: QuizResult | null | undefined,
  incoming: QuizResult
): ResolutionDecision<QuizResult> {
  if (!existing) {
    return { winner: incoming, applied: true, status: 'applied' };
  }
  // If the record with the same ID already exists, deduplicate idempotently
  return {
    winner: existing,
    applied: false,
    status: 'duplicate',
    details: `QuizResult ${incoming.id} already recorded and is immutable`,
  };
}

/**
 * 2. Attendance: Last-writer-wins by (HLC, deviceId tie-break);
 * Teacher edit ALWAYS beats automated device data.
 */
export function resolveAttendanceConflict(
  existing: AttendanceRecord | null | undefined,
  incoming: AttendanceRecord
): ResolutionDecision<AttendanceRecord> {
  if (!existing) {
    return { winner: incoming, applied: true, status: 'applied' };
  }

  // Teacher override privilege: Teacher manual edit beats automated background data
  if (incoming.source === 'TEACHER' && existing.source === 'DEVICE_AUTO') {
    return {
      winner: incoming,
      applied: true,
      status: 'applied',
      details: 'Teacher manual attendance overrides automated device capture',
    };
  }

  if (existing.source === 'TEACHER' && incoming.source === 'DEVICE_AUTO') {
    return {
      winner: existing,
      applied: false,
      status: 'rejected',
      details: 'Existing teacher manual attendance takes precedence over automated device capture',
    };
  }

  // Both are same source or both teacher: use HLC comparison
  const hlcExisting = existing.hlc || `${new Date(existing.updatedAt).getTime()}:0:${existing.deviceId}`;
  const hlcIncoming = incoming.hlc || `${new Date(incoming.updatedAt).getTime()}:0:${incoming.deviceId}`;

  const hlcDiff = compareHlc(hlcIncoming, hlcExisting);

  if (hlcDiff > 0) {
    return {
      winner: incoming,
      applied: true,
      status: 'applied',
      details: 'Incoming attendance has higher HLC timestamp',
    };
  } else if (hlcDiff < 0) {
    return {
      winner: existing,
      applied: false,
      status: 'duplicate',
      details: 'Existing attendance has higher HLC timestamp',
    };
  } else {
    // Exact tie: tie-break deterministically by deviceId
    if (incoming.deviceId > existing.deviceId) {
      return { winner: incoming, applied: true, status: 'applied' };
    }
    return { winner: existing, applied: false, status: 'duplicate' };
  }
}

/**
 * 3. Student Progress: Merge with max level / grow-only sets.
 */
export function resolveStudentProgressMerge(
  existingLevel: number,
  incomingLevel: number,
  existingCompletedLessonIds: string[] = [],
  incomingCompletedLessonIds: string[] = []
): {
  mergedLevel: number;
  mergedCompletedLessonIds: string[];
} {
  const mergedLevel = Math.max(existingLevel, incomingLevel);
  const set = new Set([...existingCompletedLessonIds, ...incomingCompletedLessonIds]);
  return {
    mergedLevel,
    mergedCompletedLessonIds: Array.from(set).sort(),
  };
}

/**
 * 4. Profile Fields: Last-writer-wins per field based on field HLCs or entity HLC.
 */
export function resolveProfileFieldsConflict<T extends SyncedEntity>(
  existing: T | null | undefined,
  incoming: T
): ResolutionDecision<T> {
  if (!existing) {
    return { winner: incoming, applied: true, status: 'applied' };
  }

  const hlcExisting = existing.hlc || `${new Date(existing.updatedAt).getTime()}:0:${existing.deviceId}`;
  const hlcIncoming = incoming.hlc || `${new Date(incoming.updatedAt).getTime()}:0:${incoming.deviceId}`;

  const hlcDiff = compareHlc(hlcIncoming, hlcExisting);

  if (hlcDiff >= 0) {
    return {
      winner: {
        ...existing,
        ...incoming,
        version: Math.max(existing.version, incoming.version) + 1,
      },
      applied: true,
      status: 'applied',
    };
  }

  return {
    winner: existing,
    applied: false,
    status: 'duplicate',
    details: 'Existing profile record is newer or equal',
  };
}

/**
 * 5. Content and Schemes: Server-authoritative, read-only on devices.
 */
export function resolveContentConflict<T extends Lesson | Scheme>(
  existing: T | null | undefined,
  incoming: T,
  isDeviceClient: boolean = false
): ResolutionDecision<T> {
  if (isDeviceClient) {
    // Devices cannot push modifications to server-authoritative content
    return {
      winner: existing ?? incoming,
      applied: false,
      status: 'rejected',
      details: 'Content and Schemes are server-authoritative and read-only on devices',
    };
  }

  if (!existing) {
    return { winner: incoming, applied: true, status: 'applied' };
  }

  // In cloud/hub admin context, higher version or newer updatedAt wins
  if (incoming.version > existing.version) {
    return { winner: incoming, applied: true, status: 'applied' };
  }

  return {
    winner: existing,
    applied: false,
    status: 'duplicate',
    details: 'Server content version is current or newer',
  };
}

/**
 * 6. AtRiskFlag: Derived deterministically; manual resolution is LWW.
 */
export function resolveAtRiskFlagConflict(
  existing: AtRiskFlag | null | undefined,
  incoming: AtRiskFlag
): ResolutionDecision<AtRiskFlag> {
  if (!existing) {
    return { winner: incoming, applied: true, status: 'applied' };
  }

  // If incoming has manual resolution (resolvedAt is set) and existing is unresolved
  if (incoming.resolvedAt && !existing.resolvedAt) {
    return {
      winner: incoming,
      applied: true,
      status: 'applied',
      details: 'Manual resolution applied to at-risk flag',
    };
  }

  // If existing is already resolved and incoming is unresolved
  if (existing.resolvedAt && !incoming.resolvedAt) {
    return {
      winner: existing,
      applied: false,
      status: 'duplicate',
      details: 'Flag already manually resolved',
    };
  }

  // Both resolved or both unresolved: HLC LWW
  const hlcExisting = existing.hlc || `${new Date(existing.updatedAt).getTime()}:0:${existing.deviceId}`;
  const hlcIncoming = incoming.hlc || `${new Date(incoming.updatedAt).getTime()}:0:${incoming.deviceId}`;

  if (compareHlc(hlcIncoming, hlcExisting) >= 0) {
    return { winner: incoming, applied: true, status: 'applied' };
  }

  return { winner: existing, applied: false, status: 'duplicate' };
}
