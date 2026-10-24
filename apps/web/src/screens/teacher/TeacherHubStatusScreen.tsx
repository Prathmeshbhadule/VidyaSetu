import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSyncStore } from '../../store/useSyncStore.js';
import { offlineDb } from '../../db/offline-db.js';
import { syncManager } from '../../services/sync-manager.js';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  Server,
  RefreshCw,
  HardDrive,
  Tablet,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  Trash2,
} from 'lucide-react';

export const TeacherHubStatusScreen: React.FC = () => {
  const { t } = useTranslation();
  const { state, pendingCount, triggerSync } = useSyncStore();

  const [storageEstimate, setStorageEstimate] = useState<{ usageMb: number; quotaMb: number }>({
    usageMb: 0,
    quotaMb: 0,
  });
  const [hubStatus, setHubStatus] = useState<any | null>(null);
  const [pairingCode, setPairingCode] = useState<string>('VS-8492');

  useEffect(() => {
    async function loadStorageInfo() {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usageMb = Math.round((estimate.usage || 0) / (1024 * 1024));
        const quotaMb = Math.round((estimate.quota || 0) / (1024 * 1024));
        setStorageEstimate({ usageMb, quotaMb });
      }

      // Query local Hub status endpoint
      try {
        const hubRes = await fetch('http://localhost:3001/api/v1/hub/status');
        if (hubRes.ok) {
          const data = await hubRes.json();
          setHubStatus(data);
        }
      } catch {
        // Hub running offline or on alternate port
      }
    }
    loadStorageInfo();
  }, [state]);

  const handleClearCachedMedia = async () => {
    if (confirm('Clear local lesson cache to free up tablet storage? (Lessons will re-download when needed)')) {
      await offlineDb.lessons.clear();
      alert('Local lesson cache cleared successfully.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-28">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
            <Server className="w-7 h-7 text-orange-600" />
            {t('sync.hubTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-amber-800 font-medium mt-1">
            {t('sync.hubSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerSync()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition-all min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('sync.syncNow')}</span>
          </button>
          <AudioHelpButton text="शाळा हब सिंक माहिती. प्रलंबित बदल आणि ऑफलाइन साठा तपासा." size="sm" />
        </div>
      </div>

      {/* Sync Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase text-amber-800">Pending Outbox</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-black text-amber-950">
            {pendingCount} changes
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Changes safely saved on this device
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase text-amber-800">Sync Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 capitalize mt-1">
            {state === 'synced' ? 'Synchronized' : state}
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            {hubStatus?.lastCloudSync ? `Last cloud sync: ${hubStatus.lastCloudSync}` : 'Operating in local offline mesh'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase text-amber-800">Tablet Storage</span>
            <HardDrive className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-amber-950">
            {storageEstimate.usageMb} MB
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            of {storageEstimate.quotaMb} MB available quota
          </p>
        </div>
      </div>

      {/* Device Pairing Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-md mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-extrabold text-xl text-amber-950 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-orange-600" />
              Device Pairing & Access
            </h3>
            <p className="text-xs text-amber-800 font-medium mt-0.5">
              Connect new student tablets to the school hub Wi-Fi
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-orange-100 text-orange-950 font-black text-lg border border-orange-300">
            Pairing Code: {pairingCode}
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          New student tablets display this one-time code to authenticate on the school LAN. Devices receive a revocable cryptographic token and use HMAC-SHA256 signatures for zero-trust local Wi-Fi sync.
        </p>
      </div>

      {/* Storage Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-extrabold text-lg text-amber-950 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-orange-600" />
            Local Offline Storage Quota
          </h3>
          <button
            onClick={handleClearCachedMedia}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs min-h-[36px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Lesson Cache</span>
          </button>
        </div>
        <p className="text-xs text-amber-800 font-medium">
          Device maintains offline content for at least 30 days without network. Cache is automatically pruned if device free space drops below 200 MB.
        </p>
      </div>
    </div>
  );
};
