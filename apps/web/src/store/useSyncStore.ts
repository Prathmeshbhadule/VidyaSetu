import { create } from 'zustand';
import { SyncState, syncManager } from '../services/sync-manager.js';

interface SyncStoreState {
  state: SyncState;
  pendingCount: number;
  lastSyncTime: string | null;
  triggerSync: () => Promise<void>;
}

export const useSyncStore = create<SyncStoreState>((set) => {
  // Subscribe to real-time client sync events
  syncManager.subscribe((state, pendingCount) => {
    set({
      state,
      pendingCount,
      lastSyncTime: new Date().toLocaleTimeString(),
    });
  });

  return {
    state: 'synced',
    pendingCount: 0,
    lastSyncTime: null,
    triggerSync: async () => {
      await syncManager.triggerSync();
    },
  };
});
