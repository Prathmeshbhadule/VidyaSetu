import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore.js';
import { SyncStatusChip } from './SyncStatusChip.js';
import { SupportedLanguage, UserRole } from '@vidya-setu/shared';
import {
  Globe,
  Accessibility,
  Flame,
  Target,
  ChevronDown,
  LogOut,
  Lock,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    role,
    setRole,
    language,
    setLanguage,
    isSimpleMode,
    toggleSimpleMode,
    currentStudent,
    logout,
  } = useAuthStore();

  const roles: Array<{ id: UserRole; label: string }> = [
    { id: 'STUDENT', label: '👨‍🎓 ' + t('common.student', 'Student') },
    { id: 'TEACHER', label: '👨‍🏫 ' + t('common.teacher', 'Teacher') },
    { id: 'GUARDIAN', label: '👨‍👩‍👧 ' + t('common.guardian', 'Parent') },
    { id: 'DISTRICT_ADMIN', label: '🏛️ District Admin' },
    { id: 'CONTENT_ADMIN', label: '✍️ Content Admin' },
  ];

  const studentGrade = currentStudent ? `${t('common.grade')} ${currentStudent.grade}` : 'Class 3';

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-3 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Goal Selector */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate(role === 'STUDENT' ? '/student/home' : '/')}
            className="flex items-center gap-2.5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl p-1"
          >
            {/* Bold Logo Mark */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 flex items-center justify-center font-black text-lg text-white shadow-md shadow-blue-600/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              VS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  VIDYA SETU
                </span>
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
                  OFFLINE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Bharat's Offline Learning Platform
              </p>
            </div>
          </div>

          {/* Goal / Class Selector Badge */}
          {role === 'STUDENT' && currentStudent && (
            <div
              onClick={() => navigate('/student/picker')}
              className="hidden md:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 cursor-pointer transition-all"
            >
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>{studentGrade} • {t('batch.targetBatch', 'Target Batch')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          )}
        </div>

        {/* Center: Offline Sync & Study Streak */}
        <div className="flex items-center gap-2.5">
          {/* Daily Streak Pill */}
          {role === 'STUDENT' && (
            <div
              title={t('streak.studyStreak', 'Daily Study Streak')}
              className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-full text-xs font-black shadow-sm"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{t('streak.daysCount', { days: 4 })}</span>
            </div>
          )}

          {/* Sync Status */}
          <SyncStatusChip />
        </div>

        {/* Right: Actions, Language & Profile Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Simple Mode Toggle */}
          <button
            onClick={toggleSimpleMode}
            title={t('common.simpleMode', 'Toggle Accessibility Mode')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all min-h-[36px] ${
              isSimpleMode
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Accessibility className="w-4 h-4" />
            <span className="hidden sm:inline">{isSimpleMode ? t('common.simpleMode') : t('common.standardMode')}</span>
          </button>

          {/* Language Switcher */}
          <div className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-800 p-0.5 shadow-inner">
            <Globe className="w-3.5 h-3.5 ml-2 mr-1 text-slate-400" />
            {(['hi', 'mr', 'en'] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all min-h-[30px] ${
                  language === lang
                    ? 'bg-blue-600 text-white shadow-sm font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {lang === 'hi' ? 'हिन्दी' : lang === 'mr' ? 'मराठी' : 'EN'}
              </button>
            ))}
          </div>

          {/* Role Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              aria-label="Switch User Role"
              className="pl-3 pr-8 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold text-xs border border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-h-[36px]"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Student Profile & Privacy Session Button */}
          {role === 'STUDENT' && (
            currentStudent ? (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-xl shadow-sm">
                <div
                  onClick={() => navigate('/student/picker')}
                  className="flex items-center gap-2 cursor-pointer"
                  title="View Profile"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
                    {currentStudent.gender === 'FEMALE' ? '👧' : '👦'}
                  </div>
                  <span className="text-xs font-bold text-slate-100 hidden sm:inline max-w-[90px] truncate">
                    {currentStudent.name.split(' ')[0]}
                  </span>
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate('/student/picker');
                  }}
                  title={t('session.switchStudent', 'Switch Student / Lock Session')}
                  className="ml-1 px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] font-black transition-all flex items-center gap-1 min-h-[28px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{t('session.switchStudent', 'Lock')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/student/picker')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all min-h-[36px]"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t('session.loginTitle', 'Login')}</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
