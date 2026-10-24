/**
 * RFC 9562 compliant UUIDv7 generator and utilities.
 * Client-generated time-ordered IDs for offline-first synchronisation.
 */

let lastTimestamp = -1;
let sequenceCounter = 0;

/**
 * Generates a UUIDv7 string.
 * Structure:
 * - 48 bits unix epoch ms
 * - 4 bits version (0111)
 * - 12 bits sequence counter/rand_a
 * - 2 bits variant (10)
 * - 62 bits random bytes
 */
export function generateUuidV7(timeMs: number = Date.now()): string {
  if (timeMs === lastTimestamp) {
    sequenceCounter = (sequenceCounter + 1) & 0xfff;
  } else {
    lastTimestamp = timeMs;
    sequenceCounter = Math.floor(Math.random() * 0x1000);
  }

  // 48-bit timestamp in hex (12 hex digits)
  const timeHex = timeMs.toString(16).padStart(12, '0');

  // version 7 (4 bits) + 12 bits sequence (3 hex digits)
  const verAndSeq = (0x7000 | (sequenceCounter & 0x0fff)).toString(16).padStart(4, '0');

  // variant (2 bits: 10) + 14 bits random
  const randA = (0x8000 | Math.floor(Math.random() * 0x4000)).toString(16).padStart(4, '0');

  // 48 bits random
  const randB = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-${verAndSeq}-${randA}-${randB}`;
}

export function isValidUuidV7(id: string): boolean {
  if (typeof id !== 'string') return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(id);
}

export function getTimestampFromUuidV7(uuid: string): number {
  if (!isValidUuidV7(uuid)) {
    throw new Error(`Invalid UUIDv7: ${uuid}`);
  }
  const clean = uuid.replace(/-/g, '');
  const timeHex = clean.slice(0, 12);
  return parseInt(timeHex, 16);
}
