import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore.js';
import {
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
  Home,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const { role, isSimpleMode } = useAuthStore();

  const getLinks = () => {
    switch (role) {
      case 'TEACHER':
        return [
          { to: '/teacher/attendance', icon: <CheckSquare className="w-6 h-6" />, label: 'Attendance' },
          { to: '/teacher/grouping', icon: <Layers className="w-6 h-6" />, label: 'TaRL Groups' },
          { to: '/teacher/at-risk', icon: <HeartHandshake className="w-6 h-6" />, label: 'At-Risk & Retention' },
          { to: '/teacher/hub-status', icon: <Server className="w-6 h-6" />, label: 'Hub Status' },
        ];
      case 'GUARDIAN':
        return [
          { to: '/parent', icon: <Users className="w-6 h-6" />, label: 'My Child' },
          { to: '/schemes', icon: <Award className="w-6 h-6" />, label: 'Schemes' },
          { to: '/parent/notifications', icon: <Bell className="w-6 h-6" />, label: 'Notices' },
        ];
      case 'DISTRICT_ADMIN':
        return [
          { to: '/district/dashboard', icon: <BarChart3 className="w-6 h-6" />, label: 'District Analytics' },
          { to: '/schemes', icon: <Award className="w-6 h-6" />, label: 'Schemes' },
        ];
      case 'CONTENT_ADMIN':
        return [
          { to: '/admin/content', icon: <BookOpen className="w-6 h-6" />, label: 'Lessons & Quizzes' },
          { to: '/schemes', icon: <Award className="w-6 h-6" />, label: 'Schemes' },
        ];
      case 'STUDENT':
      default:
        return [
          { to: '/student/home', icon: <Home className="w-6 h-6" />, label: 'Home' },
          { to: '/student/videos', icon: <VideoIcon className="w-6 h-6" />, label: 'Videos' },
          { to: '/student/quizzes', icon: <CheckSquare className="w-6 h-6" />, label: 'Quizzes & Results' },
          { to: '/student/adaptive', icon: <GraduationCap className="w-6 h-6" />, label: 'Level Check' },
          { to: '/schemes', icon: <Award className="w-6 h-6" />, label: 'Schemes' },
        ];
    }
  };

  const links = getLinks();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200 px-2 py-1 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-orange-600 font-bold scale-105'
                  : 'text-amber-800 hover:text-orange-700'
              }`
            }
          >
            {link.icon}
            <span className={`text-[11px] mt-0.5 tracking-tight text-center ${isSimpleMode ? 'text-xs font-bold' : ''}`}>
              {link.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
