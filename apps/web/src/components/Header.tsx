import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore.js';
import { SyncStatusChip } from './SyncStatusChip.js';
import { SupportedLanguage } from '@vidya-setu/shared';
import {
  Flame,
  Target,
  LogOut,
  LogIn,
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

  const getUserBadge = () => {
    if (!role) return null;

    if (role === 'STUDENT') {
      if (classMode?.isClassMode) {
        return {
          icon: <School className="w-3.5 h-3.5 text-amber-500" />,
          title: `Class ${classMode.grade} Mode`,
          subtitle: 'Classroom',
          color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
        };
      }
      return {
        icon: <GraduationCap className="w-3.5 h-3.5 text-blue-500" />,
        title: currentStudent ? currentStudent.name.split(' ')[0] : 'Student',
        subtitle: currentStudent ? `Grade ${currentStudent.grade}` : 'Student',
        color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
      };
    }

    if (role === 'TEACHER') {
      return {
        icon: <Users className="w-3.5 h-3.5 text-blue-500" />,
        title: teacherProfile?.name.split(' ')[0] || 'Teacher',
        subtitle: 'Educator',
        color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
      };
    }

    if (role === 'GUARDIAN') {
      return {
        icon: <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />,
        title: guardianProfile?.name.split(' ')[0] || 'Parent',
        subtitle: 'Guardian',
        color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      };
    }

    if (role === 'DISTRICT_ADMIN') {
      return {
        icon: <Building2 className="w-3.5 h-3.5 text-blue-500" />,
        title: 'District Admin',
        subtitle: 'DEO Pune',
        color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
      };
    }

    if (role === 'CONTENT_ADMIN') {
      return {
        icon: <BookOpen className="w-3.5 h-3.5 text-purple-500" />,
        title: 'Studio Admin',
        subtitle: 'Curriculum',
        color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
      };
    }

    return null;
  };

  const userBadge = getUserBadge();

  return (
    <header className="sticky top-0 z-50 apple-glass transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Name Only - Symbol Removed */}
        <div className="flex items-center gap-3">
          <div
            onClick={handleBrandClick}
            className="cursor-pointer group focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Vidya Setu
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal hidden sm:block leading-none mt-0.5">
              Bharat's Rural Digital Learning Mesh
            </p>
          </div>

          {/* Active Batch Indicator (Student) */}
          {role === 'STUDENT' && currentStudent && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              <Target className="w-3 h-3 text-blue-500" />
              <span>
                {classMode?.isClassMode
                  ? `Class ${classMode.grade} Mode`
                  : `Class ${currentStudent.grade} Cohort`}
              </span>
            </div>
          )}
        </div>

        {/* Center: Sync & Streak */}
        <div className="flex items-center gap-2">
          {role === 'STUDENT' && (
            <div
              title={t('streak.studyStreak', 'Daily Study Streak')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{t('streak.daysCount', { days: 4 })}</span>
            </div>
          )}

          <SyncStatusChip />
        </div>

        {/* Right: Controls & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="apple-press p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Language Switcher */}
          <div className="inline-flex p-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            {(['hi', 'mr', 'en'] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`apple-segment-item px-2 py-0.5 text-[11px] font-semibold rounded-full transition-all ${
                  language === lang
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {lang === 'hi' ? 'हि' : lang === 'mr' ? 'म' : 'EN'}
              </button>
            ))}
          </div>

          {/* User Profile Capsule / Login Buttons */}
          {isAuthenticated && userBadge ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200/60 dark:border-slate-800">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${userBadge.color}`}
              >
                {userBadge.icon}
                <span className="font-semibold max-w-[80px] sm:max-w-[110px] truncate">
                  {userBadge.title}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="apple-press p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => navigate('/login')}
                className="apple-press inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
