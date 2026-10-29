import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header.js';
import { BottomNav } from './components/BottomNav.js';
import { RoleGuard } from './components/RoleGuard.js';
import { useAuthStore } from './store/useAuthStore.js';
import { LoginScreen } from './screens/auth/LoginScreen.js';
import { RegisterScreen } from './screens/auth/RegisterScreen.js';
import { StudentProfilePicker } from './screens/student/StudentProfilePicker.js';
import { StudentHome } from './screens/student/StudentHome.js';
import { LessonListScreen } from './screens/student/LessonListScreen.js';
import { LessonReaderScreen } from './screens/student/LessonReaderScreen.js';
import { QuizRunnerScreen } from './screens/student/QuizRunnerScreen.js';
import { AdaptiveAssessmentScreen } from './screens/student/AdaptiveAssessmentScreen.js';
import { StudentProgressScreen } from './screens/student/StudentProgressScreen.js';
import { VideoLecturesScreen } from './screens/student/VideoLecturesScreen.js';
import { QuizResultsScreen } from './screens/student/QuizResultsScreen.js';
import { SchemesBrowserScreen } from './screens/schemes/SchemesBrowserScreen.js';
import { TeacherAttendanceScreen } from './screens/teacher/TeacherAttendanceScreen.js';
import { TeacherTaRLScreen } from './screens/teacher/TeacherTaRLScreen.js';
import { TeacherAtRiskScreen } from './screens/teacher/TeacherAtRiskScreen.js';
import { TeacherHubStatusScreen } from './screens/teacher/TeacherHubStatusScreen.js';
import { ParentDashboardScreen } from './screens/parent/ParentDashboardScreen.js';
import { DistrictDashboardScreen } from './screens/district/DistrictDashboardScreen.js';
import { ContentAdminScreen } from './screens/admin/ContentAdminScreen.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const { role, isAuthenticated, currentStudent } = useAuthStore();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 pb-36">
        <Routes>
          {/* Default Route: Direct to appropriate portal based on authentication */}
          <Route
            path="/"
            element={
              !isAuthenticated || !role ? (
                <Navigate to="/login" replace />
              ) : role === 'TEACHER' ? (
                <Navigate to="/teacher/attendance" replace />
              ) : role === 'GUARDIAN' ? (
                <Navigate to="/parent" replace />
              ) : role === 'DISTRICT_ADMIN' ? (
                <Navigate to="/district/dashboard" replace />
              ) : role === 'CONTENT_ADMIN' ? (
                <Navigate to="/admin/content" replace />
              ) : !currentStudent ? (
                <Navigate to="/login?role=STUDENT" replace />
              ) : (
                <Navigate to="/student/home" replace />
              )
            }
          />

          {/* Authentication & Registration Routes */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/student/picker" element={<Navigate to="/login?role=STUDENT" replace />} />

          {/* Protected Student Routes */}
          <Route
            path="/student/home"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <StudentHome />
              </RoleGuard>
            }
          />
          <Route
            path="/student/lessons"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <LessonListScreen />
              </RoleGuard>
            }
          />
          <Route
            path="/student/lessons/:id"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <LessonReaderScreen />
              </RoleGuard>
            }
          />
          <Route
            path="/student/videos"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <VideoLecturesScreen />
              </RoleGuard>
            }
          />
          <Route
            path="/student/quizzes"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <QuizResultsScreen />
              </RoleGuard>
            }
          />
          <Route
            path="/student/quizzes/:id"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <QuizRunnerScreen />
              </RoleGuard>
            }
          />
          <Route
            path="/student/adaptive"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <AdaptiveAssessmentScreen />
              </RoleGuard>
            }
          />
          <Route
            path="/student/progress"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <StudentProgressScreen />
              </RoleGuard>
            }
          />

          {/* Schemes Portal (Accessible to Student, Teacher, Guardian, Admins) */}
          <Route
            path="/schemes"
            element={
              <RoleGuard allowedRoles={['STUDENT', 'TEACHER', 'GUARDIAN', 'DISTRICT_ADMIN', 'CONTENT_ADMIN']}>
                <SchemesBrowserScreen />
              </RoleGuard>
            }
          />

          {/* Protected Teacher Routes */}
          <Route
            path="/teacher/attendance"
            element={
              <RoleGuard allowedRoles={['TEACHER']}>
                <TeacherAttendanceScreen />
              </RoleGuard>
            }
          />
          <Route
            path="/teacher/grouping"
            element={
              <RoleGuard allowedRoles={['TEACHER']}>
                <TeacherTaRLScreen />
              </RoleGuard>
            }
          />
          <Route
            path="/teacher/at-risk"
            element={
              <RoleGuard allowedRoles={['TEACHER']}>
                <TeacherAtRiskScreen />
              </RoleGuard>
            }
          />
          <Route
            path="/teacher/hub-status"
            element={
              <RoleGuard allowedRoles={['TEACHER']}>
                <TeacherHubStatusScreen />
              </RoleGuard>
            }
          />

          {/* Protected Parent / Guardian Routes */}
          <Route
            path="/parent"
            element={
              <RoleGuard allowedRoles={['GUARDIAN']}>
                <ParentDashboardScreen />
              </RoleGuard>
            }
          />
          <Route
            path="/parent/notifications"
            element={
              <RoleGuard allowedRoles={['GUARDIAN']}>
                <ParentDashboardScreen />
              </RoleGuard>
            }
          />

          {/* Protected District Admin Routes */}
          <Route
            path="/district/dashboard"
            element={
              <RoleGuard allowedRoles={['DISTRICT_ADMIN']}>
                <DistrictDashboardScreen />
              </RoleGuard>
            }
          />

          {/* Protected Content Admin Routes */}
          <Route
            path="/admin/content"
            element={
              <RoleGuard allowedRoles={['CONTENT_ADMIN', 'TEACHER']}>
                <ContentAdminScreen />
              </RoleGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && <BottomNav />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};
