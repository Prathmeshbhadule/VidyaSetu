import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore.js';
import { SyncStatusChip } from './SyncStatusChip.js';
import { SupportedLanguage, UserRole } from '@vidya-setu/shared';
import { BookOpen, Sparkles, Globe, UserCheck, Accessibility } from 'lucide-react';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const {
    role,
    setRole,
    language,
    setLanguage,
    isSimpleMode,
    toggleSimpleMode,
    currentStudent,
  } = useAuthStore();

  const roles: Array<{ id: UserRole; label: string }> = [
    { id: 'STUDENT', label: 'Student (विद्यार्थी)' },
    { id: 'TEACHER', label: 'Teacher (शिक्षक)' },
    { id: 'GUARDIAN', label: 'Parent (पालक)' },
    { id: 'DISTRICT_ADMIN', label: 'District Admin' },
    { id: 'CONTENT_ADMIN', label: 'Content Admin' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl text-amber-950 tracking-tight leading-tight flex items-center gap-1.5">
              {t('common.appName')}
              <Sparkles className="w-4 h-4 text-orange-500" />
            </h1>
            <p className="text-[11px] text-amber-800 font-medium hidden sm:block">
              {t('common.tagline')}
            </p>
          </div>
        </div>

        {/* Persistent Sync Status Chip */}
        <div className="flex items-center gap-2">
          <SyncStatusChip />
        </div>

        {/* Actions / Switches */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Simple Mode Toggle */}
          <button
            onClick={toggleSimpleMode}
            title="Toggle Simple / Standard Mode"
            aria-pressed={isSimpleMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all min-h-[38px] ${
              isSimpleMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <Accessibility className="w-4 h-4" />
            <span>{isSimpleMode ? t('common.simpleMode') : t('common.standardMode')}</span>
          </button>

          {/* Language Switcher */}
          <div className="inline-flex items-center rounded-lg border border-amber-300 bg-amber-50 p-0.5">
            <Globe className="w-4 h-4 ml-2 mr-1 text-amber-700" />
            {(['hi', 'mr', 'en'] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all min-h-[32px] ${
                  language === lang
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-amber-900 hover:bg-amber-200/60'
                }`}
              >
                {lang === 'hi' ? 'हिन्दी' : lang === 'mr' ? 'मराठी' : 'EN'}
              </button>
            ))}
          </div>

          {/* Role Selector */}
          <div className="relative inline-flex items-center">
            <UserCheck className="w-4 h-4 absolute left-2.5 text-amber-700 pointer-events-none" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              aria-label="Switch User Role"
              className="pl-8 pr-3 py-1.5 bg-amber-50 text-amber-950 font-semibold text-xs border border-amber-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 min-h-[38px]"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
