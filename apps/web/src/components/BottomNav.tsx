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
          { to: '/teacher/attendance', icon: <CheckSquare className="w-5 h-5" />, label: 'हजेरी (Attendance)' },
          { to: '/teacher/grouping', icon: <Layers className="w-5 h-5" />, label: 'स्तर गट (TaRL)' },
          { to: '/teacher/at-risk', icon: <HeartHandshake className="w-5 h-5" />, label: 'अडचण (Retention)' },
          { to: '/teacher/hub-status', icon: <Server className="w-5 h-5" />, label: 'हब सिंक (Hub)' },
        ];
      case 'GUARDIAN':
        return [
          { to: '/parent', icon: <Users className="w-5 h-5" />, label: 'माझे मूल (Child)' },
          { to: '/schemes', icon: <Award className="w-5 h-5" />, label: 'योजना (Schemes)' },
          { to: '/parent/notifications', icon: <Bell className="w-5 h-5" />, label: 'सूचना (Notices)' },
        ];
      case 'DISTRICT_ADMIN':
        return [
          { to: '/district/dashboard', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
          { to: '/schemes', icon: <Award className="w-5 h-5" />, label: 'Schemes' },
        ];
      case 'CONTENT_ADMIN':
        return [
          { to: '/admin/content', icon: <BookOpen className="w-5 h-5" />, label: 'Curriculum' },
          { to: '/schemes', icon: <Award className="w-5 h-5" />, label: 'Schemes' },
        ];
      case 'STUDENT':
      default:
        return [
          { to: '/student/home', icon: <Home className="w-5 h-5" />, label: 'होम (Home)' },
          { to: '/student/lessons', icon: <BookOpen className="w-5 h-5" />, label: 'बॅच (Batches)' },
          { to: '/student/videos', icon: <VideoIcon className="w-5 h-5" />, label: 'लेक्चर्स (Videos)' },
          { to: '/student/quizzes', icon: <CheckSquare className="w-5 h-5" />, label: 'टेस्ट सिरीज (Tests)' },
          { to: '/schemes', icon: <Award className="w-5 h-5" />, label: 'योजना (Schemes)' },
        ];
    }
  };

  const links = getLinks();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-400 font-black scale-105 bg-slate-800/80 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {link.icon}
            <span
              className={`text-[10px] mt-1 font-bold tracking-tight text-center ${
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
