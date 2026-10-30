import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore.js';
import {
  Home,
  BookOpen,
  GraduationCap,
  Award,
  Users,
  CheckSquare,
  BarChart3,
  Server,
  Layers,
  HeartHandshake,
  Bell,
  Video as VideoIcon,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const { role, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !role) {
    return null;
  }

  const getLinks = () => {
    switch (role) {
      case 'TEACHER':
        return [
          { to: '/teacher/attendance', icon: <CheckSquare className="w-4 h-4" />, label: t('nav.attendance', 'Attendance') },
          { to: '/teacher/grouping', icon: <Layers className="w-4 h-4" />, label: t('nav.grouping', 'TaRL') },
          { to: '/teacher/at-risk', icon: <HeartHandshake className="w-4 h-4" />, label: t('nav.retention', 'At-Risk') },
          { to: '/admin/content', icon: <BookOpen className="w-4 h-4" />, label: t('nav.studio', 'Studio') },
          { to: '/teacher/hub-status', icon: <Server className="w-4 h-4" />, label: t('nav.hub', 'Hub') },
        ];
      case 'GUARDIAN':
        return [
          { to: '/parent', icon: <Users className="w-4 h-4" />, label: t('nav.child', 'Child') },
          { to: '/schemes', icon: <Award className="w-4 h-4" />, label: t('nav.schemes', 'Schemes') },
          { to: '/parent/notifications', icon: <Bell className="w-4 h-4" />, label: t('nav.notices', 'Notices') },
        ];
      case 'DISTRICT_ADMIN':
        return [
          { to: '/district/dashboard', icon: <BarChart3 className="w-4 h-4" />, label: 'Analytics' },
          { to: '/schemes', icon: <Award className="w-4 h-4" />, label: t('nav.schemes', 'Schemes') },
        ];
      case 'CONTENT_ADMIN':
        return [
          { to: '/admin/content', icon: <BookOpen className="w-4 h-4" />, label: t('nav.studio', 'Studio') },
          { to: '/schemes', icon: <Award className="w-4 h-4" />, label: t('nav.schemes', 'Schemes') },
        ];
      case 'STUDENT':
      default:
        return [
          { to: '/student/home', icon: <Home className="w-4 h-4" />, label: t('nav.home', 'Home') },
          { to: '/student/lessons', icon: <BookOpen className="w-4 h-4" />, label: t('nav.batches', 'Lessons') },
          { to: '/student/videos', icon: <VideoIcon className="w-4 h-4" />, label: t('nav.videos', 'Videos') },
          { to: '/student/quizzes', icon: <CheckSquare className="w-4 h-4" />, label: t('nav.tests', 'Quizzes') },
          { to: '/schemes', icon: <Award className="w-4 h-4" />, label: t('nav.schemes', 'Schemes') },
        ];
    }
  };

  const links = getLinks();

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav
        role="navigation"
        aria-label="Bottom Navigation"
        className="pointer-events-auto apple-glass rounded-full px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-w-md w-full flex items-center justify-around gap-1"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `apple-press flex flex-col items-center justify-center min-h-[44px] min-w-[54px] px-3 py-1 rounded-full transition-all duration-200 select-none ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'
              }`
            }
          >
            <div className="relative mb-0.5">
              {link.icon}
            </div>
            <span className="text-[10px] leading-none tracking-tight">
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
