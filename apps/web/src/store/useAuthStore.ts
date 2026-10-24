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

export const useAuthStore = create<AuthState>((set) => ({
  role: (getStorage('vidya_role') as UserRole) || 'STUDENT',
  currentStudent: getInitialStudent(),
  teacherName: getStorage('vidya_teacher_name') || 'Sunil Patil (शिक्षक)',
  language: (getStorage('vidya_language') as SupportedLanguage) || 'hi',
  isSimpleMode: getStorage('vidya_simple_mode') === 'true',
  schoolId: getStorage('vidya_school_id') || '018f679a-1111-7000-8000-000000000001',
  isAuthenticated: !!getInitialStudent(),

  setRole: (role) => {
    setStorage('vidya_role', role);
    set({ role });
  },

  setCurrentStudent: (currentStudent) => {
    if (currentStudent) {
      setStorage('vidya_current_student', JSON.stringify(currentStudent));
    } else {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('vidya_current_student');
      }
    }
    set({ currentStudent, isAuthenticated: !!currentStudent });
  },

  setTeacherName: (teacherName) => {
    setStorage('vidya_teacher_name', teacherName);
    set({ teacherName });
  },

  setLanguage: (lang) => {
    updateI18nLanguage(lang);
    set({ language: lang });
  },

  toggleSimpleMode: () =>
    set((state) => {
      const next = !state.isSimpleMode;
      setStorage('vidya_simple_mode', String(next));
      return { isSimpleMode: next };
    }),

  loginStudent: (student) => {
    setStorage('vidya_current_student', JSON.stringify(student));
    set({ role: 'STUDENT', currentStudent: student, isAuthenticated: true });
  },

  logout: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('vidya_current_student');
    }
    set({ currentStudent: null, isAuthenticated: false });
  },
}));
