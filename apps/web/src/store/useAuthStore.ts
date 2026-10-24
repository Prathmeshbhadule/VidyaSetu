import { create } from 'zustand';
import { UserRole, StudentProfile, SupportedLanguage } from '@vidya-setu/shared';
import { setLanguage } from '../i18n/index.js';

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

interface AuthState {
  role: UserRole;
  currentStudent: StudentProfile | null;
  teacherName: string;
  language: SupportedLanguage;
  isSimpleMode: boolean;
  schoolId: string;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  setCurrentStudent: (student: StudentProfile | null) => void;
  setTeacherName: (name: string) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleSimpleMode: () => void;
  loginStudent: (student: StudentProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: (getStorage('vidya_role') as UserRole) || 'STUDENT',
  currentStudent: null,
  teacherName: getStorage('vidya_teacher_name') || 'Sunil Patil (शिक्षक)',
  language: (getStorage('vidya_language') as SupportedLanguage) || 'hi',
  isSimpleMode: getStorage('vidya_simple_mode') === 'true',
  schoolId: getStorage('vidya_school_id') || '018f679a-1111-7000-8000-000000000001',
  isAuthenticated: false,

  setRole: (role) => {
    setStorage('vidya_role', role);
    set({ role });
  },

  setCurrentStudent: (currentStudent) =>
    set({ currentStudent, isAuthenticated: !!currentStudent }),

  setTeacherName: (teacherName) => {
    setStorage('vidya_teacher_name', teacherName);
    set({ teacherName });
  },

  setLanguage: (lang) => {
    setLanguage(lang);
    set({ language: lang });
  },

  toggleSimpleMode: () =>
    set((state) => {
      const next = !state.isSimpleMode;
      setStorage('vidya_simple_mode', String(next));
      return { isSimpleMode: next };
    }),

  loginStudent: (student) => {
    set({ role: 'STUDENT', currentStudent: student, isAuthenticated: true });
  },

  logout: () => {
    set({ currentStudent: null, isAuthenticated: false });
  },
}));
