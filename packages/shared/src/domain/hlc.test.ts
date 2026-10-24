import { describe, it, expect } from 'vitest';
import { HlcClock, compareHlc, formatHlc, parseHlc } from './hlc.js';

describe('Hybrid Logical Clock (HLC)', () => {
  it('parses and formats HLC timestamps correctly', () => {
    const raw = '1716000000000:42:device-tablet-01';
    const parsed = parseHlc(raw);

    expect(parsed.physical).toBe(1716000000000);
    expect(parsed.counter).toBe(42);
    expect(parsed.nodeId).toBe('device-tablet-01');

    expect(formatHlc(parsed)).toBe(raw);
  });

  it('throws on invalid HLC strings', () => {
    expect(() => parseHlc('invalid')).toThrow();
    expect(() => parseHlc('abc:def:node')).toThrow();
    expect(() => parseHlc('')).toThrow();
  });

  it('compares HLC timestamps accurately', () => {
    // Physical difference
    expect(compareHlc('1000:0:nodeA', '2000:0:nodeA')).toBeLessThan(0);
    expect(compareHlc('2000:0:nodeA', '1000:0:nodeA')).toBeGreaterThan(0);

    // Counter difference on same physical time
    expect(compareHlc('1000:1:nodeA', '1000:2:nodeA')).toBeLessThan(0);
    expect(compareHlc('1000:5:nodeA', '1000:2:nodeA')).toBeGreaterThan(0);

    // NodeId tie break on identical physical and counter
    expect(compareHlc('1000:1:nodeA', '1000:1:nodeB')).toBeLessThan(0);
    expect(compareHlc('1000:1:nodeB', '1000:1:nodeA')).toBeGreaterThan(0);
    expect(compareHlc('1000:1:nodeA', '1000:1:nodeA')).toBe(0);
  });

  it('guarantees monotonic increment under wall clock backwards jump', () => {
    const clock = new HlcClock('device-01', 1000, 0);

    const t1 = clock.now(1000); // 1000:1:device-01
    expect(t1).toBe('1000:1:device-01');

    // Wall clock jumps backwards to 900
    const t2 = clock.now(900); // physical remains 1000, counter increments to 2
    expect(t2).toBe('1000:2:device-01');

    // Wall clock moves forward to 1500
    const t3 = clock.now(1500);
    expect(t3).toBe('1500:0:device-01');
  });

  it('updates local clock on receiving higher remote HLC', () => {
    const clock = new HlcClock('device-01', 1000, 0);
    const remoteHlc = '2000:5:device-hub';

    const updated = clock.update(remoteHlc, 1050);
    const parsed = parseHlc(updated);

    expect(parsed.physical).toBe(2000);
    expect(parsed.counter).toBe(6);
    expect(parsed.nodeId).toBe('device-01');
  });

  it('provides nodeId and getTimestamp', () => {
    const clock = new HlcClock('device-01', 1000, 3);
    expect(clock.getNodeId()).toBe('device-01');
    const ts = clock.getTimestamp();
    expect(ts.physical).toBe(1000);
    expect(ts.counter).toBe(3);
    expect(ts.nodeId).toBe('device-01');
  });

  it('updates local clock when remote physical time matches current physical', () => {
    const clock = new HlcClock('device-01', 2000, 3);
    const remoteHlc = '2000:7:device-hub';

    const updated = clock.update(remoteHlc, 1999);
    const parsed = parseHlc(updated);

    expect(parsed.physical).toBe(2000);
    expect(parsed.counter).toBe(8); // max(3, 7) + 1
  });
});
