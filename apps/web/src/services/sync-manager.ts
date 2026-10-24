import { offlineDb, OutboxItem } from '../db/offline-db.js';
import {
  HlcClock,
  generateUuidV7,
  CURRENT_SYNC_SCHEMA_VERSION,
  SyncPushResponse,
  SyncPullResponse,
} from '@vidya-setu/shared';

export type SyncState = 'synced' | 'pending' | 'syncing' | 'failed';

function getStorage(key: string): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

function setStorage(key: string, value: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

export class ClientSyncManager {
  private clock: HlcClock;
  private syncState: SyncState = 'synced';
  private listeners: Array<(state: SyncState, pendingCount: number) => void> = [];
  private isSyncing = false;
  private apiBaseUrl: string;

  constructor() {
    const deviceId = getStorage('vidya_device_id') || generateUuidV7();
    setStorage('vidya_device_id', deviceId);
    this.clock = new HlcClock(deviceId);

    // Default to School Hub LAN URL or Cloud URL
    const metaEnv = (import.meta as any).env;
    this.apiBaseUrl = metaEnv?.VITE_API_URL || 'http://localhost:3001/api/v1';

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.triggerSync());
    }
  }

  public getDeviceId(): string {
    return this.clock.getNodeId();
  }

  public getHlcNow(): string {
    return this.clock.now();
  }

  public subscribe(listener: (state: SyncState, pendingCount: number) => void) {
    this.listeners.push(listener);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async notify() {
    const pendingCount = await offlineDb.outbox.count();
    const effectiveState = this.isSyncing
      ? 'syncing'
      : pendingCount > 0
      ? this.syncState === 'failed'
        ? 'failed'
        : 'pending'
      : 'synced';

    this.syncState = effectiveState;
    for (const l of this.listeners) {
      l(this.syncState, pendingCount);
    }
  }

  /**
   * Outbox pattern: Writes mutation to local Dexie table AND outbox atomically.
   */
  public async mutate<T extends { id: string }>(
    entity: 'Attendance' | 'QuizResult' | 'StudentProfile' | 'SchemeChecklistProgress' | 'AtRiskFlag',
    table: any,
    item: T,
    op: 'INSERT' | 'UPDATE' | 'DELETE' = 'INSERT',
    priority: number = 1
  ): Promise<T> {
    const changeId = generateUuidV7();
    const hlc = this.getHlcNow();
    const deviceId = this.getDeviceId();
    const schoolId = getStorage('vidya_school_id') || '018f679a-1111-7000-8000-000000000001';

    const outboxItem: OutboxItem = {
      id: changeId,
      entity,
      entityId: item.id,
      op,
      schoolId,
      deviceId,
      payload: item as any,
      hlc,
      priority,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      attempts: 0,
    };

    // Atomic Dexie transaction
    await offlineDb.transaction('rw', [table, offlineDb.outbox], async () => {
      if (op === 'DELETE') {
        await table.delete(item.id);
      } else {
        await table.put(item);
      }
      await offlineDb.outbox.add(outboxItem);
    });

    this.notify();

    // Trigger background sync attempt opportunistically (non-blocking)
    this.triggerSync().catch(() => {});

    return item;
  }

  /**
   * Triggers bidirectional synchronization with School Hub or Cloud.
   */
  public async triggerSync(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.notify();

    try {
      const pendingItems = await offlineDb.outbox
        .orderBy('priority')
        .limit(200)
        .toArray();

      const schoolId = getStorage('vidya_school_id') || '018f679a-1111-7000-8000-000000000001';
      const deviceId = this.getDeviceId();

      // 1. Push Phase
      if (pendingItems.length > 0) {
        const batchId = generateUuidV7();
        const changes = pendingItems.map((item) => ({
          id: item.id,
          entity: item.entity,
          entityId: item.entityId,
          op: item.op,
          schoolId: item.schoolId,
          deviceId: item.deviceId,
          payload: item.payload,
          hlc: item.hlc,
          priority: item.priority,
        }));

        const pushUrl = `${this.apiBaseUrl}/sync/push`;
        const pushRes = await fetch(pushUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Id': deviceId,
            'X-School-Id': schoolId,
            'X-Device-Token': getStorage('vidya_device_token') || 'dev-token-default',
          },
          body: JSON.stringify({
            schemaVersion: CURRENT_SYNC_SCHEMA_VERSION,
            deviceId,
            schoolId,
            batchId,
            changes,
          }),
        });

        if (pushRes.ok) {
          const pushData: SyncPushResponse = await pushRes.json();
          // Remove applied and duplicate items from Dexie outbox
          const idsToDelete = pushData.results
            .filter((r) => r.status === 'applied' || r.status === 'duplicate')
            .map((r) => r.id);

          await offlineDb.outbox.bulkDelete(idsToDelete);
          this.syncState = 'synced';
        } else {
          this.syncState = 'failed';
        }
      }

      // 2. Pull Phase
      const lastSeqMeta = await offlineDb.metadata.get('last_pull_seq');
      const lastSeq = lastSeqMeta ? parseInt(lastSeqMeta.value, 10) : 0;

      const pullUrl = `${this.apiBaseUrl}/sync/pull?since=${lastSeq}&limit=100&schoolId=${schoolId}`;
      const pullRes = await fetch(pullUrl, {
        headers: {
          'X-Device-Id': deviceId,
          'X-School-Id': schoolId,
          'X-Device-Token': getStorage('vidya_device_token') || 'dev-token-default',
        },
      });

      if (pullRes.ok) {
        const pullData: SyncPullResponse = await pullRes.json();
        for (const change of pullData.changes) {
          await this.applyIncomingDelta(change);
        }

        await offlineDb.metadata.put({
          key: 'last_pull_seq',
          value: pullData.currentSeq.toString(),
        });
        await offlineDb.metadata.put({
          key: 'last_sync_time',
          value: new Date().toISOString(),
        });
        this.syncState = 'synced';
      }
    } catch (err) {
      // Offline mode: Network request failed, keep pending in outbox
      this.syncState = 'pending';
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  private async applyIncomingDelta(change: any): Promise<void> {
    const { entity, payload, op } = change;
    const tableMap: Record<string, any> = {
      Attendance: offlineDb.attendance,
      QuizResult: offlineDb.quizResults,
      StudentProfile: offlineDb.students,
      SchemeChecklistProgress: offlineDb.checklists,
      Lesson: offlineDb.lessons,
      Scheme: offlineDb.schemes,
    };

    const targetTable = tableMap[entity];
    if (!targetTable) return;

    if (op === 'DELETE') {
      await targetTable.delete(change.entityId);
    } else {
      await targetTable.put(payload);
    }
  }
}

export const syncManager = new ClientSyncManager();
