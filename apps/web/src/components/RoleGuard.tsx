import React from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '@vidya-setu/shared';
import { useAuthStore } from '../store/useAuthStore.js';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { role, isAuthenticated, logout, currentStudent } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // If not logged in at all, redirect to login page specifying the requested role
  if (!isAuthenticated || !role) {
    const defaultRole = allowedRoles[0] || 'STUDENT';
    return <Navigate to={`/login?role=${defaultRole}&returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If logged in as student, ensure student profile or class mode is active
  if (role === 'STUDENT' && !currentStudent) {
    return <Navigate to="/login?role=STUDENT" replace />;
  }

  // If logged in with an unauthorized role (e.g. Student trying to open Teacher Attendance)
  if (!allowedRoles.includes(role)) {
    const roleLabels: Record<UserRole, string> = {
      STUDENT: 'Student (विद्यार्थी)',
      TEACHER: 'Teacher (शिक्षक)',
      GUARDIAN: 'Parent / Guardian (पालक)',
      DISTRICT_ADMIN: 'District Administrator (जिल्हा प्रशासन)',
      CONTENT_ADMIN: 'Content Studio Administrator (कंटेंट व्यवस्थापक)',
    };

    const targetRoleLabel = roleLabels[allowedRoles[0]] || allowedRoles[0];
    const currentRoleLabel = roleLabels[role] || role;

    const handleReturnToOwnDashboard = () => {
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

    const handleLogoutAndSwitch = () => {
      logout();
      navigate(`/login?role=${allowedRoles[0]}`);
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
              Access Restricted • प्रवेश मर्यादित
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Unauthorized Portal Access
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
              You are currently signed in as <strong className="text-slate-900">{currentRoleLabel}</strong>. This section is restricted to <strong className="text-blue-700">{targetRoleLabel}</strong> accounts only.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700">🔒 Account Isolation Security Rule:</p>
            <p className="text-[11px]">
              Direct account switching is disabled for data integrity. Please log out first before signing in as a different user.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={handleReturnToOwnDashboard}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to My Dashboard (माझ्या डॅशबोर्डवर जा)</span>
            </button>

            <button
              onClick={handleLogoutAndSwitch}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 font-bold text-xs transition-all min-h-[40px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out & Switch to {targetRoleLabel}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
