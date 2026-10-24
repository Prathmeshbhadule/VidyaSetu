import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSyncStore } from '../store/useSyncStore.js';
import { CheckCircle2, RefreshCw, Clock, AlertCircle } from 'lucide-react';

export const SyncStatusChip: React.FC = () => {
  const { t } = useTranslation();
  const { state, pendingCount, triggerSync } = useSyncStore();

  const getStatusContent = () => {
    switch (state) {
      case 'syncing':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />,
          label: t('common.syncing'),
          bg: 'bg-amber-100/80 text-amber-900 border-amber-300',
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4 text-orange-600" />,
          label: `${t('common.savedOnDevice')} (${pendingCount} ${t('common.syncPending')})`,
          bg: 'bg-orange-100/80 text-orange-900 border-orange-300',
        };
      case 'failed':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
          label: t('common.syncFailed'),
          bg: 'bg-rose-100/80 text-rose-900 border-rose-300',
        };
      case 'synced':
      default:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          label: `${t('common.savedOnDevice')} • ${t('common.synced')}`,
          bg: 'bg-emerald-100/80 text-emerald-900 border-emerald-300',
        };
    }
  };

  const status = getStatusContent();

  return (
    <button
      onClick={() => triggerSync()}
      title="Tap to trigger immediate synchronization"
      aria-label={status.label}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shadow-sm active:scale-95 min-h-[36px] ${status.bg}`}
    >
      {status.icon}
      <span>{status.label}</span>
    </button>
  );
};
