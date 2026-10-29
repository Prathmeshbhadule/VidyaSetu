import { create } from 'zustand';
import { UserRole, StudentProfile, SupportedLanguage } from '@vidya-setu/shared';
import { setLanguage as updateI18nLanguage } from '../i18n/index.js';

function getStorage(key: string): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

function setStorage(key: string, value: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

function removeStorage(key: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
}

export interface ClassModeInfo {
  isClassMode: boolean;
  grade: number;
  className: string;
}

export interface TeacherAuthProfile {
  teacherId: string;
  name: string;
  schoolId: string;
  phone?: string;
  assignedGrades?: number[];
}

export interface GuardianAuthProfile {
  id: string;
  name: string;
  phone: string;
  wardPrn: string;
  wardName?: string;
}

export interface AdminAuthProfile {
  id: string;
  name: string;
  scope: 'CONTENT' | 'DISTRICT';
  district?: string;
}

interface AuthState {
  role: UserRole | null;
  isAuthenticated: boolean;
  currentStudent: StudentProfile | null;
  classMode: ClassModeInfo | null;
  teacherProfile: TeacherAuthProfile | null;
  guardianProfile: GuardianAuthProfile | null;
  adminProfile: AdminAuthProfile | null;
  teacherName: string;
  language: SupportedLanguage;
  isSimpleMode: boolean;
  schoolId: string;

  // Actions
  setLanguage: (lang: SupportedLanguage) => void;
  toggleSimpleMode: () => void;
  setSchoolId: (id: string) => void;

  // Role Login Actions
  loginStudent: (student: StudentProfile) => void;
  loginAsClass: (grade: number) => void;
  loginAsTeacher: (teacher: TeacherAuthProfile) => void;
  loginAsGuardian: (guardian: GuardianAuthProfile) => void;
  loginAsDistrictAdmin: (admin: AdminAuthProfile) => void;
  loginAsContentAdmin: (admin: AdminAuthProfile) => void;

  // Legacy setters preserved for compatibility
  setRole: (role: UserRole) => void;
  setCurrentStudent: (student: StudentProfile | null) => void;
  setTeacherName: (name: string) => void;

  logout: () => void;
}

function getInitialStudent(): StudentProfile | null {
  const raw = getStorage('vidya_current_student');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

function getInitialClassMode(): ClassModeInfo | null {
  const raw = getStorage('vidya_class_mode');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

function getInitialTeacher(): TeacherAuthProfile | null {
  const raw = getStorage('vidya_teacher_profile');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

function getInitialGuardian(): GuardianAuthProfile | null {
  const raw = getStorage('vidya_guardian_profile');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

function getInitialAdmin(): AdminAuthProfile | null {
  const raw = getStorage('vidya_admin_profile');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

function getInitialRole(): UserRole | null {
  const savedRole = getStorage('vidya_role') as UserRole | null;
  // If we have saved student or class mode, default role is STUDENT
  if (getInitialStudent() || getInitialClassMode()) return 'STUDENT';
  if (getInitialTeacher()) return 'TEACHER';
  if (getInitialGuardian()) return 'GUARDIAN';
  if (getInitialAdmin()) {
    return getInitialAdmin()?.scope === 'DISTRICT' ? 'DISTRICT_ADMIN' : 'CONTENT_ADMIN';
  }
  return savedRole || null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  role: getInitialRole(),
  isAuthenticated: !!getInitialRole(),
  currentStudent: getInitialStudent(),
  classMode: getInitialClassMode(),
  teacherProfile: getInitialTeacher(),
  guardianProfile: getInitialGuardian(),
  adminProfile: getInitialAdmin(),
  teacherName: getStorage('vidya_teacher_name') || 'Sunil Patil Sir (शिक्षक)',
  language: (getStorage('vidya_language') as SupportedLanguage) || 'hi',
  isSimpleMode: getStorage('vidya_simple_mode') === 'true',
  schoolId: getStorage('vidya_school_id') || '018f679a-1111-7000-8000-000000000001',

  setLanguage: (lang) => {
    updateI18nLanguage(lang);
    setStorage('vidya_language', lang);
    set({ language: lang });
  },

  toggleSimpleMode: () =>
    set((state) => {
      const next = !state.isSimpleMode;
      setStorage('vidya_simple_mode', String(next));
      return { isSimpleMode: next };
    }),

  setSchoolId: (schoolId) => {
    setStorage('vidya_school_id', schoolId);
    set({ schoolId });
  },

  // 1. Individual Student Login
  loginStudent: (student) => {
    setStorage('vidya_role', 'STUDENT');
    setStorage('vidya_current_student', JSON.stringify(student));
    removeStorage('vidya_class_mode');
    removeStorage('vidya_teacher_profile');
    removeStorage('vidya_guardian_profile');
    removeStorage('vidya_admin_profile');

    set({
      role: 'STUDENT',
      currentStudent: student,
      classMode: null,
      teacherProfile: null,
      guardianProfile: null,
      adminProfile: null,
      isAuthenticated: true,
    });
  },

  // 2. Whole Class / Group Classroom Mode Login
  loginAsClass: (grade: number) => {
    const classModeData: ClassModeInfo = {
      isClassMode: true,
      grade,
      className: `Class ${grade} (इयत्ता ${grade === 1 ? 'पहिली' : grade === 2 ? 'दुसरी' : grade === 3 ? 'तिसरी' : grade === 4 ? 'चौथी' : 'पाचवी'})`,
    };

    // Virtual shared classroom student profile for Dexie queries
    const sharedStudent: StudentProfile = {
      id: `class-${grade}-classroom-session`,
      schoolId: get().schoolId,
      name: `Class ${grade} Classroom Mode (सामूहिक वर्ग तासिका)`,
      prn: `CLASS-0${grade}-SHARED`,
      grade,
      gender: 'OTHER',
      assessedLevel: grade,
      avatarId: `class-${grade}-avatar`,
      pinHash: '0000',
      parentalConsent: true,
      version: 1,
      deviceId: 'dev-tablet-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    setStorage('vidya_role', 'STUDENT');
    setStorage('vidya_current_student', JSON.stringify(sharedStudent));
    setStorage('vidya_class_mode', JSON.stringify(classModeData));
    removeStorage('vidya_teacher_profile');
    removeStorage('vidya_guardian_profile');
    removeStorage('vidya_admin_profile');

    set({
      role: 'STUDENT',
      currentStudent: sharedStudent,
      classMode: classModeData,
      teacherProfile: null,
      guardianProfile: null,
      adminProfile: null,
      isAuthenticated: true,
    });
  },

  // 3. Teacher Login
  loginAsTeacher: (teacher) => {
    setStorage('vidya_role', 'TEACHER');
    setStorage('vidya_teacher_profile', JSON.stringify(teacher));
    setStorage('vidya_teacher_name', teacher.name);
    removeStorage('vidya_current_student');
    removeStorage('vidya_class_mode');
    removeStorage('vidya_guardian_profile');
    removeStorage('vidya_admin_profile');

    set({
      role: 'TEACHER',
      teacherProfile: teacher,
      teacherName: teacher.name,
      currentStudent: null,
      classMode: null,
      guardianProfile: null,
      adminProfile: null,
      isAuthenticated: true,
    });
  },

  // 4. Guardian / Parent Login
  loginAsGuardian: (guardian) => {
    setStorage('vidya_role', 'GUARDIAN');
    setStorage('vidya_guardian_profile', JSON.stringify(guardian));
    removeStorage('vidya_current_student');
    removeStorage('vidya_class_mode');
    removeStorage('vidya_teacher_profile');
    removeStorage('vidya_admin_profile');

    set({
      role: 'GUARDIAN',
      guardianProfile: guardian,
      currentStudent: null,
      classMode: null,
      teacherProfile: null,
      adminProfile: null,
      isAuthenticated: true,
    });
  },

  // 5. District Admin Login
  loginAsDistrictAdmin: (admin) => {
    setStorage('vidya_role', 'DISTRICT_ADMIN');
    setStorage('vidya_admin_profile', JSON.stringify(admin));
    removeStorage('vidya_current_student');
    removeStorage('vidya_class_mode');
    removeStorage('vidya_teacher_profile');
    removeStorage('vidya_guardian_profile');

    set({
      role: 'DISTRICT_ADMIN',
      adminProfile: admin,
      currentStudent: null,
      classMode: null,
      teacherProfile: null,
      guardianProfile: null,
      isAuthenticated: true,
    });
  },

  // 6. Content Admin Login
  loginAsContentAdmin: (admin) => {
    setStorage('vidya_role', 'CONTENT_ADMIN');
    setStorage('vidya_admin_profile', JSON.stringify(admin));
    removeStorage('vidya_current_student');
    removeStorage('vidya_class_mode');
    removeStorage('vidya_teacher_profile');
    removeStorage('vidya_guardian_profile');

    set({
      role: 'CONTENT_ADMIN',
      adminProfile: admin,
      currentStudent: null,
      classMode: null,
      teacherProfile: null,
      guardianProfile: null,
      isAuthenticated: true,
    });
  },

  // Compatibility helpers
  setRole: (role) => {
    setStorage('vidya_role', role);
    set({ role });
  },

  setCurrentStudent: (currentStudent) => {
    if (currentStudent) {
      setStorage('vidya_current_student', JSON.stringify(currentStudent));
    } else {
      removeStorage('vidya_current_student');
    }
    set({ currentStudent, isAuthenticated: !!currentStudent });
  },

  setTeacherName: (teacherName) => {
    setStorage('vidya_teacher_name', teacherName);
    set({ teacherName });
  },

  // Logout clears all stored session data completely
  logout: () => {
    removeStorage('vidya_role');
    removeStorage('vidya_current_student');
    removeStorage('vidya_class_mode');
    removeStorage('vidya_teacher_profile');
    removeStorage('vidya_guardian_profile');
    removeStorage('vidya_admin_profile');

    set({
      role: null,
      currentStudent: null,
      classMode: null,
      teacherProfile: null,
      guardianProfile: null,
      adminProfile: null,
      isAuthenticated: false,
    });
  },
}));
