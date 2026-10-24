/**
 * Hybrid Logical Clock (HLC) implementation.
 *
 * Implements Kulkarni et al. "Logical Physical Clocks and Consistent Snapshots in Globally Distributed Databases".
 * Format: `<physical_ms>:<counter>:<nodeId>`
 * Guarantees monotonic ordering even across arbitrary device clock drift, resets, or skew.
 */

export interface HlcTimestamp {
  physical: number; // Milliseconds since Unix epoch
  counter: number;  // Logical counter for ties within the same millisecond
  nodeId: string;   // Device identifier for deterministic tie-breaking
}

export function parseHlc(hlcString: string): HlcTimestamp {
  const parts = hlcString.split(':');
  if (parts.length < 3) {
    throw new Error(`Invalid HLC format: "${hlcString}". Expected "physical:counter:nodeId"`);
  }
  const physical = parseInt(parts[0], 10);
  const counter = parseInt(parts[1], 10);
  const nodeId = parts.slice(2).join(':'); // Support node IDs with colons

  if (isNaN(physical) || isNaN(counter) || !nodeId) {
    throw new Error(`Invalid HLC values in string: "${hlcString}"`);
  }

  return { physical, counter, nodeId };
}

export function formatHlc(hlc: HlcTimestamp): string {
  return `${hlc.physical}:${hlc.counter}:${hlc.nodeId}`;
}

/**
 * Compare two HLC timestamps.
 * Returns:
 *  - negative if a < b
 *  - 0 if a == b
 *  - positive if a > b
 */
export function compareHlc(
  a: HlcTimestamp | string,
  b: HlcTimestamp | string
): number {
  const t1 = typeof a === 'string' ? parseHlc(a) : a;
  const t2 = typeof b === 'string' ? parseHlc(b) : b;

  if (t1.physical !== t2.physical) {
    return t1.physical - t2.physical;
  }
  if (t1.counter !== t2.counter) {
    return t1.counter - t2.counter;
  }
  return t1.nodeId.localeCompare(t2.nodeId);
}

export class HlcClock {
  private physical: number;
  private counter: number;
  private readonly nodeId: string;

  constructor(nodeId: string, initialPhysical: number = Date.now(), initialCounter: number = 0) {
    if (!nodeId) {
      throw new Error('HlcClock requires a non-empty nodeId');
    }
    this.nodeId = nodeId;
    this.physical = initialPhysical;
    this.counter = initialCounter;
  }

  public getNodeId(): string {
    return this.nodeId;
  }

  public getTimestamp(): HlcTimestamp {
    return {
      physical: this.physical,
      counter: this.counter,
      nodeId: this.nodeId,
    };
  }

  public toString(): string {
    return formatHlc(this.getTimestamp());
  }

  /**
   * Generates a new event timestamp locally (send or local write)
   */
  public now(wallClockMs: number = Date.now()): string {
    const lOld = this.physical;
    const cOld = this.counter;

    this.physical = Math.max(lOld, wallClockMs);
    if (this.physical === lOld) {
      this.counter = cOld + 1;
    } else {
      this.counter = 0;
    }

    return this.toString();
  }

  /**
   * Advances local clock upon receiving a remote message/timestamp
   */
  public update(remoteHlcString: string, wallClockMs: number = Date.now()): string {
    const remote = parseHlc(remoteHlcString);
    const lOld = this.physical;
    const cOld = this.counter;

    this.physical = Math.max(lOld, remote.physical, wallClockMs);

    if (this.physical === lOld && this.physical === remote.physical) {
      this.counter = Math.max(cOld, remote.counter) + 1;
    } else if (this.physical === lOld) {
      this.counter = cOld + 1;
    } else if (this.physical === remote.physical) {
      this.counter = remote.counter + 1;
    } else {
      this.counter = 0;
    }

    return this.toString();
  }
}
