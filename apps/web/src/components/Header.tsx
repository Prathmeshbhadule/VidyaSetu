import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore.js';
import { SyncStatusChip } from './SyncStatusChip.js';
import { SupportedLanguage } from '@vidya-setu/shared';
import {
  Globe,
  Accessibility,
  Flame,
  Target,
  LogOut,
  LogIn,
  UserPlus,
  School,
  GraduationCap,
  Users,
  HeartHandshake,
  Building2,
  BookOpen,
  Sun,
  Moon,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    role,
    isAuthenticated,
    language,
    setLanguage,
    isSimpleMode,
    toggleSimpleMode,
    theme,
    toggleTheme,
    currentStudent,
    classMode,
    teacherProfile,
    guardianProfile,
    logout,
  } = useAuthStore();

  const isDark = theme === 'dark';

  const handleBrandClick = () => {
    if (!isAuthenticated || !role) {
      navigate('/login');
      return;
    }
    switch (role) {
      case 'STUDENT':
        navigate('/student/home');
        break;
      case 'TEACHER':
        navigate('/teacher/attendance');
        break;
      case 'GUARDIAN':
        navigate('/parent');
        break;
      case 'DISTRICT_ADMIN':
        navigate('/district/dashboard');
        break;
      case 'CONTENT_ADMIN':
        navigate('/admin/content');
        break;
      default:
        navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build active user badge label
  const getUserBadge = () => {
    if (!role) return null;

    if (role === 'STUDENT') {
      if (classMode?.isClassMode) {
        return {
          icon: <School className="w-3.5 h-3.5 text-amber-500" />,
          title: `Class ${classMode.grade} Mode`,
          subtitle: 'सामूहिक वर्ग अभ्यास',
          color: isDark
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : 'bg-amber-50 text-amber-800 border-amber-200',
        };
      }
      return {
        icon: <GraduationCap className="w-3.5 h-3.5 text-blue-500" />,
        title: currentStudent ? currentStudent.name.split(' ')[0] : 'Student',
        subtitle: currentStudent ? `Grade ${currentStudent.grade}` : 'Student',
        color: isDark
          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
          : 'bg-blue-50 text-blue-800 border-blue-200',
      };
    }

    if (role === 'TEACHER') {
      return {
        icon: <Users className="w-3.5 h-3.5 text-blue-500" />,
        title: teacherProfile?.name.split(' ')[0] || 'Teacher',
        subtitle: 'शिक्षक (Teacher)',
        color: isDark
          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
          : 'bg-blue-50 text-blue-800 border-blue-200',
      };
    }

    if (role === 'GUARDIAN') {
      return {
        icon: <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />,
        title: guardianProfile?.name.split(' ')[0] || 'Parent',
        subtitle: 'पालक (Parent)',
        color: isDark
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }

    if (role === 'DISTRICT_ADMIN') {
      return {
        icon: <Building2 className="w-3.5 h-3.5 text-amber-500" />,
        title: 'District Admin',
        subtitle: 'जिल्हा प्रशासन',
        color: isDark
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          : 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }

    if (role === 'CONTENT_ADMIN') {
      return {
        icon: <BookOpen className="w-3.5 h-3.5 text-purple-500" />,
        title: 'Studio Admin',
        subtitle: 'कंटेंट व्यवस्थापक',
        color: isDark
          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
          : 'bg-purple-50 text-purple-800 border-purple-200',
      };
    }

    return null;
  };

  const userBadge = getUserBadge();

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-colors ${
        isDark
          ? 'bg-slate-900/95 border-b border-slate-800 text-white shadow-md'
          : 'bg-white/95 border-b border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl p-1"
          >
            {/* Bold Logo Mark */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 flex items-center justify-center font-black text-lg text-white shadow-md shadow-blue-600/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              VS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-black text-base sm:text-lg tracking-tight transition-colors ${
                    isDark ? 'text-white group-hover:text-blue-300' : 'text-slate-900 group-hover:text-blue-600'
                  }`}
                >
                  VIDYA SETU
                </span>
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
                  OFFLINE
                </span>
              </div>
              <p className={`text-[10px] font-medium hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Bharat's Offline Learning Platform
              </p>
            </div>
          </div>

          {/* Target Batch / Class Indicator (when logged in as student) */}
          {role === 'STUDENT' && currentStudent && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                isDark
                  ? 'bg-slate-800/90 border border-slate-700 text-slate-200'
                  : 'bg-slate-100 border border-slate-200 text-slate-700'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-blue-500" />
              <span>
                {classMode?.isClassMode
                  ? `Class ${classMode.grade} Shared Classroom`
                  : `Class ${currentStudent.grade} • Target Batch`}
              </span>
            </div>
          )}
        </div>

        {/* Center: Offline Sync & Study Streak */}
        <div className="flex items-center gap-2.5">
          {/* Daily Streak Pill (Active Student) */}
          {role === 'STUDENT' && (
            <div
              title={t('streak.studyStreak', 'Daily Study Streak')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${
                isDark
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                  : 'bg-amber-50 border border-amber-300 text-amber-800'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{t('streak.daysCount', { days: 4 })}</span>
            </div>
          )}

          {/* Sync Status Chip */}
          <SyncStatusChip />
        </div>

        {/* Right: Actions, Language, Theme & Authenticated User Capsule */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Theme Switcher Button (Light / Dark Option) */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme (लाइट थीम)' : 'Switch to Dark Theme (डार्क थीम)'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all min-h-[34px] ${
              isDark
                ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 shadow-sm'
            }`}
            aria-label="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
            <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Accessibility Simple Mode Toggle */}
          <button
            onClick={toggleSimpleMode}
            title={t('common.simpleMode', 'Toggle Accessibility Mode')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all min-h-[34px] ${
              isSimpleMode
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSimpleMode ? 'Simple' : 'Standard'}</span>
          </button>

          {/* Language Switcher */}
          <div
            className={`inline-flex items-center rounded-xl border p-0.5 shadow-inner ${
              isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-100'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ml-1.5 mr-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            {(['hi', 'mr', 'en'] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-all min-h-[28px] ${
                  language === lang
                    ? 'bg-blue-600 text-white shadow-sm font-black'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {lang === 'hi' ? 'हिन्दी' : lang === 'mr' ? 'मराठी' : 'EN'}
              </button>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* AUTHENTICATED USER CAPSULE */}
          {/* ========================================================================= */}
          {isAuthenticated && userBadge ? (
            <div className={`flex items-center gap-2 pl-1 border-l ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              {/* User Profile Capsule */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border shadow-sm ${userBadge.color}`}
              >
                {userBadge.icon}
                <div className="text-left">
                  <span className="text-xs font-black block leading-none max-w-[100px] truncate">
                    {userBadge.title}
                  </span>
                  <span className="text-[10px] font-semibold opacity-85 block leading-tight">
                    {userBadge.subtitle}
                  </span>
                </div>
              </div>

              {/* Secure Log Out Button */}
              <button
                onClick={handleLogout}
                title="Log Out (सुरक्षित बाहेर पडा)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600 text-rose-600 dark:text-rose-300 hover:text-white text-xs font-black border border-rose-500/30 transition-all min-h-[34px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            /* Logged Out Buttons */
            <div className={`flex items-center gap-1.5 pl-1 border-l ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all min-h-[34px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>

              <button
                onClick={() => navigate('/register')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all min-h-[34px] ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
