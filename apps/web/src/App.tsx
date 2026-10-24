import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header.js';
import { BottomNav } from './components/BottomNav.js';
import { useAuthStore } from './store/useAuthStore.js';
import { StudentProfilePicker } from './screens/student/StudentProfilePicker.js';
import { StudentHome } from './screens/student/StudentHome.js';
import { LessonListScreen } from './screens/student/LessonListScreen.js';
import { LessonReaderScreen } from './screens/student/LessonReaderScreen.js';
import { QuizRunnerScreen } from './screens/student/QuizRunnerScreen.js';
import { AdaptiveAssessmentScreen } from './screens/student/AdaptiveAssessmentScreen.js';
import { StudentProgressScreen } from './screens/student/StudentProgressScreen.js';
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
  const { role, currentStudent } = useAuthStore();
  const location = useLocation();

  const isPicker = location.pathname === '/student/picker';

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-slate-900">
      <Header />

      <main className="flex-1">
        <Routes>
          {/* Default redirect according to active user role */}
          <Route
            path="/"
            element={
              role === 'TEACHER' ? (
                <Navigate to="/teacher/attendance" replace />
              ) : role === 'GUARDIAN' ? (
                <Navigate to="/parent" replace />
              ) : role === 'DISTRICT_ADMIN' ? (
                <Navigate to="/district/dashboard" replace />
              ) : role === 'CONTENT_ADMIN' ? (
                <Navigate to="/admin/content" replace />
              ) : !currentStudent ? (
                <Navigate to="/student/picker" replace />
              ) : (
                <Navigate to="/student/home" replace />
              )
            }
          />

          {/* Student Routes */}
          <Route path="/student/picker" element={<StudentProfilePicker />} />
          <Route path="/student/home" element={<StudentHome />} />
          <Route path="/student/lessons" element={<LessonListScreen />} />
          <Route path="/student/lessons/:id" element={<LessonReaderScreen />} />
          <Route path="/student/quizzes/:id" element={<QuizRunnerScreen />} />
          <Route path="/student/adaptive" element={<AdaptiveAssessmentScreen />} />
          <Route path="/student/progress" element={<StudentProgressScreen />} />

          {/* Schemes & Welfare Routes */}
          <Route path="/schemes" element={<SchemesBrowserScreen />} />

          {/* Teacher Routes */}
          <Route path="/teacher/attendance" element={<TeacherAttendanceScreen />} />
          <Route path="/teacher/grouping" element={<TeacherTaRLScreen />} />
          <Route path="/teacher/at-risk" element={<TeacherAtRiskScreen />} />
          <Route path="/teacher/hub-status" element={<TeacherHubStatusScreen />} />

          {/* Parent Portal */}
          <Route path="/parent" element={<ParentDashboardScreen />} />
          <Route path="/parent/notifications" element={<ParentDashboardScreen />} />

          {/* District Admin Portal */}
          <Route path="/district/dashboard" element={<DistrictDashboardScreen />} />

          {/* Content Admin Portal */}
          <Route path="/admin/content" element={<ContentAdminScreen />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isPicker && <BottomNav />}
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
