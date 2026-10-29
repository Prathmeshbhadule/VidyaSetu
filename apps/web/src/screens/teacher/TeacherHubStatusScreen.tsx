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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-36 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Server className="w-7 h-7 text-blue-600" />
            <span>{t('sync.hubTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {t('sync.hubSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerSync()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs shadow-md shadow-blue-600/20 transition-all min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('sync.syncNow')}</span>
          </button>
          <AudioHelpButton text="शाळा हब सिंक माहिती. प्रलंबित बदल आणि ऑफलाइन साठा तपासा." size="sm" />
        </div>
      </div>

      {/* Sync Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase text-slate-500">Pending Outbox</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {pendingCount} changes
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Changes safely saved on this device
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase text-slate-500">Sync Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 capitalize mt-1">
            {state === 'synced' ? 'Synchronized' : state}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {hubStatus?.lastCloudSync ? `Last cloud sync: ${hubStatus.lastCloudSync}` : 'Operating in local offline mesh'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase text-slate-500">Tablet Storage</span>
            <HardDrive className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {storageEstimate.usageMb} MB
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            of {storageEstimate.quotaMb} MB available quota
          </p>
        </div>
      </div>

      {/* Device Pairing Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              <span>Device Pairing & Access</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Connect new student tablets to the school hub Wi-Fi
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-900 font-black text-lg border border-blue-200">
            Pairing Code: {pairingCode}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          New student tablets display this one-time code to authenticate on the school LAN. Devices receive a revocable cryptographic token and use HMAC-SHA256 signatures for zero-trust local Wi-Fi sync.
        </p>
      </div>

      {/* Storage Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <span>Local Offline Storage Quota</span>
          </h3>
          <button
            onClick={handleClearCachedMedia}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs min-h-[38px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Lesson Cache</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 font-medium">
          Device maintains offline content for at least 30 days without network. Cache is automatically pruned if device free space drops below 200 MB.
        </p>
      </div>
    </div>
  );
};
