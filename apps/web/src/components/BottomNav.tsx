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
  FileText,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const { role, isSimpleMode } = useAuthStore();

  const getLinks = () => {
    switch (role) {
      case 'TEACHER':
        return [
          { to: '/teacher/attendance', icon: <CheckSquare className="w-5 h-5" />, label: t('nav.attendance', 'Attendance') },
          { to: '/teacher/grouping', icon: <Layers className="w-5 h-5" />, label: t('nav.grouping', 'TaRL') },
          { to: '/teacher/at-risk', icon: <HeartHandshake className="w-5 h-5" />, label: t('nav.retention', 'Retention') },
          { to: '/admin/content', icon: <BookOpen className="w-5 h-5" />, label: t('nav.studio', 'Studio') },
          { to: '/teacher/hub-status', icon: <Server className="w-5 h-5" />, label: t('nav.hub', 'Hub') },
        ];
      case 'GUARDIAN':
        return [
          { to: '/parent', icon: <Users className="w-5 h-5" />, label: t('nav.child', 'My Child') },
          { to: '/schemes', icon: <Award className="w-5 h-5" />, label: t('nav.schemes', 'Schemes') },
          { to: '/parent/notifications', icon: <Bell className="w-5 h-5" />, label: t('nav.notices', 'Notices') },
        ];
      case 'DISTRICT_ADMIN':
        return [
          { to: '/district/dashboard', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
          { to: '/schemes', icon: <Award className="w-5 h-5" />, label: t('nav.schemes', 'Schemes') },
        ];
      case 'CONTENT_ADMIN':
        return [
          { to: '/admin/content', icon: <BookOpen className="w-5 h-5" />, label: t('nav.studio', 'Studio') },
          { to: '/schemes', icon: <Award className="w-5 h-5" />, label: t('nav.schemes', 'Schemes') },
        ];
      case 'STUDENT':
      default:
        return [
          { to: '/student/home', icon: <Home className="w-5 h-5" />, label: t('nav.home', 'Home') },
          { to: '/student/lessons', icon: <BookOpen className="w-5 h-5" />, label: t('nav.batches', 'Batches') },
          { to: '/student/videos', icon: <VideoIcon className="w-5 h-5" />, label: t('nav.videos', 'Lectures') },
          { to: '/student/quizzes', icon: <CheckSquare className="w-5 h-5" />, label: t('nav.tests', 'Tests') },
          { to: '/schemes', icon: <Award className="w-5 h-5" />, label: t('nav.schemes', 'Schemes') },
        ];
    }
  };

  const links = getLinks();

  return (
    <nav
      role="navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 sm:px-4 py-2 shadow-2xl safe-area-bottom"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2.5 py-1.5 rounded-2xl transition-all duration-200 select-none active:scale-95 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 font-black shadow-inner ring-1 ring-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <div className="relative">
              {link.icon}
            </div>
            <span
              className={`text-[11px] mt-1 font-bold tracking-tight text-center truncate max-w-[70px] ${
                isSimpleMode ? 'text-xs' : ''
              }`}
            >
              {link.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
