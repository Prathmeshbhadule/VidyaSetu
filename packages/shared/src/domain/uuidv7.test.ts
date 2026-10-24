import { describe, it, expect } from 'vitest';
import { generateUuidV7, getTimestampFromUuidV7, isValidUuidV7 } from './uuidv7.js';

describe('UUIDv7 generator and validation', () => {
  it('generates valid RFC 9562 UUIDv7 strings', () => {
    const id = generateUuidV7();
    expect(isValidUuidV7(id)).toBe(true);
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('correctly encodes and extracts timestamp in milliseconds', () => {
    const now = 1716000000000;
    const id = generateUuidV7(now);
    const extracted = getTimestampFromUuidV7(id);
    expect(extracted).toBe(now);
  });

  it('generates unique monotonic values even in tight loops', () => {
    const now = Date.now();
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      const id = generateUuidV7(now);
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }
    expect(ids.size).toBe(1000);
  });

  it('rejects malformed UUIDs', () => {
    expect(isValidUuidV7('')).toBe(false);
    expect(isValidUuidV7('not-a-uuid')).toBe(false);
    // UUIDv4 (version digit 4 instead of 7)
    expect(isValidUuidV7('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d')).toBe(false);
  });
});
