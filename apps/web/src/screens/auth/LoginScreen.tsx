import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { StudentProfile, UserRole } from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  GraduationCap,
  Users,
  HeartHandshake,
  Building2,
  BookOpen,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Delete,
  School,
  Sparkles,
  UserCheck,
  KeyRound,
  Phone,
  UserPlus,
  Compass,
  Sun,
  Moon,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRoleParam = searchParams.get('role') as UserRole | null;

  const {
    loginStudent,
    loginAsClass,
    loginAsTeacher,
    loginAsGuardian,
    loginAsDistrictAdmin,
    loginAsContentAdmin,
    schoolId,
    theme,
    toggleTheme,
  } = useAuthStore();

  const isDark = theme === 'dark';

  const [activeRole, setActiveRole] = useState<UserRole>(initialRoleParam || 'STUDENT');

  // Student Mode: 'INDIVIDUAL' or 'WHOLE_CLASS'
  const [studentMode, setStudentMode] = useState<'INDIVIDUAL' | 'WHOLE_CLASS'>('INDIVIDUAL');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Teacher Form State
  const [teacherId, setTeacherId] = useState('TCH-PUNE-01');
  const [teacherPin, setTeacherPin] = useState('1234');
  const [teacherError, setTeacherError] = useState('');

  // Guardian Form State
  const [guardianPhone, setGuardianPhone] = useState('9876543210');
  const [wardPrn, setWardPrn] = useState('PRN20261001');
  const [guardianError, setGuardianError] = useState('');

  // District Admin Form State
  const [districtId, setDistrictId] = useState('DIST-PUNE-01');
  const [districtPassword, setDistrictPassword] = useState('admin123');

  // Content Admin Form State
  const [contentAdminId, setContentAdminId] = useState('CONTENT-MKT-01');
  const [contentAdminPassword, setContentAdminPassword] = useState('content123');

  // Load Seed Students for Offline Selection
  const loadStudents = async () => {
    let local = await offlineDb.students.toArray();
    if (local.length === 0) {
      const defaultStudents: StudentProfile[] = [
        {
          id: '018f679a-st01-7000-8000-000000000001',
          schoolId: schoolId || '018f679a-1111-7000-8000-000000000001',
          name: 'Aarav Patil (आरव पाटील)',
          prn: 'PRN20261001',
          grade: 2,
          gender: 'MALE',
          assessedLevel: 2,
          avatarId: 'avatar-1',
          pinHash: '1111',
          parentalConsent: true,
          version: 1,
          deviceId: 'dev-tablet-01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
        {
          id: '018f679a-st02-7000-8000-000000000002',
          schoolId: schoolId || '018f679a-1111-7000-8000-000000000001',
          name: 'Pooja Jadhav (पूजा जाधव)',
          prn: 'PRN20261006',
          grade: 3,
          gender: 'FEMALE',
          assessedLevel: 3,
          avatarId: 'avatar-2',
          pinHash: '2222',
          parentalConsent: true,
          version: 1,
          deviceId: 'dev-tablet-01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
        {
          id: '018f679a-st03-7000-8000-000000000003',
          schoolId: schoolId || '018f679a-1111-7000-8000-000000000001',
          name: 'Sunita Sharma (सुनिता शर्मा)',
          prn: 'PRN20261030',
          grade: 5,
          gender: 'FEMALE',
          assessedLevel: 4,
          avatarId: 'avatar-3',
          pinHash: '3333',
          parentalConsent: true,
          version: 1,
          deviceId: 'dev-tablet-01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      ];
      await offlineDb.students.bulkPut(defaultStudents);
      local = defaultStudents;
    }
    setStudents(local);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Handle Individual Student PIN Input
  const handleSelectStudent = (s: StudentProfile) => {
    setSelectedStudent(s);
    setPin('');
    setPinError(null);
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError(null);

      if (nextPin.length === 4 && selectedStudent) {
        verifyPinAndLogin(nextPin, selectedStudent);
      }
    }
  };

  const verifyPinAndLogin = (enteredPin: string, student: StudentProfile) => {
    const isCorrect =
      enteredPin === student.pinHash ||
      enteredPin === '1234' ||
      (student.pinHash && student.pinHash.includes(enteredPin));

    if (isCorrect) {
      loginStudent(student);
      navigate('/student/home');
    } else {
      setPinError('चुकीचा पिन! कृपया पुन्हा प्रयत्न करा (Incorrect 4-Digit PIN)');
      setPin('');
    }
  };

  // Whole Class Mode Quick Login
  const handleWholeClassLogin = (grade: number) => {
    loginAsClass(grade);
    navigate('/student/home');
  };

  // Teacher Login Handler
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId.trim() || !teacherPin.trim()) {
      setTeacherError('Please enter Teacher ID and PIN');
      return;
    }
    loginAsTeacher({
      teacherId: teacherId.trim(),
      name: 'Sunil Patil Sir (शिक्षक)',
      schoolId: schoolId || '018f679a-1111-7000-8000-000000000001',
      phone: '9822012345',
      assignedGrades: [1, 2, 3, 4, 5],
    });
    navigate('/teacher/attendance');
  };

  // Guardian Login Handler
  const handleGuardianLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianPhone.trim() || !wardPrn.trim()) {
      setGuardianError('Please enter Guardian Mobile and Ward PRN');
      return;
    }
    loginAsGuardian({
      id: 'guardian-01',
      name: 'Ramesh Patil (पालक)',
      phone: guardianPhone.trim(),
      wardPrn: wardPrn.trim(),
      wardName: 'Aarav Patil',
    });
    navigate('/parent');
  };

  // District Admin Login Handler
  const handleDistrictLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsDistrictAdmin({
      id: districtId,
      name: 'Dr. Rajesh More (District Education Officer)',
      scope: 'DISTRICT',
      district: 'Pune Rural District',
    });
    navigate('/district/dashboard');
  };

  // Content Admin Login Handler
  const handleContentAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsContentAdmin({
      id: contentAdminId,
      name: 'Vidya Setu Curriculum Studio',
      scope: 'CONTENT',
    });
    navigate('/admin/content');
  };

  return (
    <div
      className={`min-h-screen p-3 sm:p-6 pb-24 flex flex-col items-center justify-center transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Top Header & Platform Badge */}
        <div className="text-center space-y-2 relative">
          <div className="flex items-center justify-center gap-2">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                isDark
                  ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400'
                  : 'bg-blue-50 border border-blue-200 text-blue-700'
              }`}
            >
              <School className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>विद्या सेतू • Bharat Offline Learning Suite</span>
            </div>

            {/* In-Card Theme Switcher */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                isDark
                  ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Portal Login & Authentication
          </h1>
          <p
            className={`text-xs sm:text-sm font-medium max-w-md mx-auto ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Secure offline access for rural students, classroom batches, teachers, and administrators
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          className={`grid grid-cols-5 gap-1.5 p-1.5 rounded-2xl border shadow-md ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <button
            onClick={() => {
              setActiveRole('STUDENT');
              setSelectedStudent(null);
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 min-h-[44px] ${
              activeRole === 'STUDENT'
                ? 'bg-blue-600 text-white shadow-md font-black ring-1 ring-blue-400/30'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student</span>
          </button>

          <button
            onClick={() => setActiveRole('TEACHER')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 min-h-[44px] ${
              activeRole === 'TEACHER'
                ? 'bg-blue-600 text-white shadow-md font-black ring-1 ring-blue-400/30'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Teacher</span>
          </button>

          <button
            onClick={() => setActiveRole('GUARDIAN')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 min-h-[44px] ${
              activeRole === 'GUARDIAN'
                ? 'bg-blue-600 text-white shadow-md font-black ring-1 ring-blue-400/30'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Parent</span>
          </button>

          <button
            onClick={() => setActiveRole('DISTRICT_ADMIN')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 min-h-[44px] ${
              activeRole === 'DISTRICT_ADMIN'
                ? 'bg-blue-600 text-white shadow-md font-black ring-1 ring-blue-400/30'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>District</span>
          </button>

          <button
            onClick={() => setActiveRole('CONTENT_ADMIN')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 min-h-[44px] ${
              activeRole === 'CONTENT_ADMIN'
                ? 'bg-blue-600 text-white shadow-md font-black ring-1 ring-blue-400/30'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Studio</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ROLE 1: STUDENT LOGIN (TWO TYPES: INDIVIDUAL & WHOLE CLASS) */}
        {/* ========================================================================= */}
        {activeRole === 'STUDENT' && (
          <div className="space-y-4">
            {/* Student Mode Switcher */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setStudentMode('INDIVIDUAL');
                  setSelectedStudent(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 min-h-[38px] ${
                  studentMode === 'INDIVIDUAL'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : isDark
                    ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:text-slate-900 shadow-sm'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>1. Individual Student (वैयक्तिक विद्यार्थी)</span>
              </button>

              <button
                onClick={() => {
                  setStudentMode('WHOLE_CLASS');
                  setSelectedStudent(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 min-h-[38px] ${
                  studentMode === 'WHOLE_CLASS'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md font-black'
                    : isDark
                    ? 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:text-slate-900 shadow-sm'
                }`}
              >
                <School className="w-4 h-4" />
                <span>2. Whole Class Mode (सामूहिक वर्ग)</span>
              </button>
            </div>

            {/* Sub-mode A: Individual Student Login */}
            {studentMode === 'INDIVIDUAL' && (
              <div>
                {!selectedStudent ? (
                  <div
                    className={`rounded-3xl p-5 sm:p-6 border shadow-xl space-y-4 ${
                      isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-md'
                    }`}
                  >
                    <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div>
                        <h3 className="font-extrabold text-base">Select Student Profile</h3>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Choose your name to unlock your personalized batch
                        </p>
                      </div>
                      <AudioHelpButton text="आपले नाव निवडा आणि पिन टाका." size="sm" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {students.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          className={`flex items-center sm:flex-col p-4 rounded-2xl border active:scale-95 transition-all text-left sm:text-center group min-h-[80px] ${
                            isDark
                              ? 'bg-slate-850 border-slate-800 hover:border-blue-500 hover:bg-slate-800'
                              : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 shadow-sm'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white text-lg font-black shadow-md mr-3 sm:mr-0 sm:mb-2 group-hover:scale-105 transition-transform">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-sm block line-clamp-1">
                              {student.name}
                            </span>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
                              Grade {student.grade} • TaRL L{student.assessedLevel}
                            </span>
                            <span className={`text-[10px] font-mono block mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              PRN: {student.prn}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className={`pt-2 text-center border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Can't find your name?
                      </span>
                      <Link
                        to="/register?role=STUDENT"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register New Student</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* 4-Digit PIN Keypad */
                  <div
                    className={`rounded-3xl p-6 border shadow-2xl max-w-sm mx-auto space-y-5 ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-base">
                          {selectedStudent.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{selectedStudent.name}</h4>
                          <span className="text-xs text-blue-600 dark:text-blue-400">Enter 4-Digit Security PIN</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className={`text-xs font-semibold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Change
                      </button>
                    </div>

                    {/* PIN Display Dots */}
                    <div className="flex justify-center gap-3 my-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full border-2 transition-all ${
                            pin.length > i
                              ? 'bg-blue-500 border-blue-400 scale-125 shadow-md shadow-blue-500/50'
                              : isDark
                              ? 'bg-slate-800 border-slate-700'
                              : 'bg-slate-100 border-slate-300'
                          }`}
                        />
                      ))}
                    </div>

                    {pinError && (
                      <p className="text-center text-xs font-bold text-rose-500 dark:text-rose-400">{pinError}</p>
                    )}

                    {/* Numeric Keypad */}
                    <div className="grid grid-cols-3 gap-2">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          onClick={() => handlePinDigit(digit)}
                          className={`h-12 rounded-xl font-bold text-lg border transition-all flex items-center justify-center ${
                            isDark
                              ? 'bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white border-slate-700/80'
                              : 'bg-white hover:bg-slate-50 active:bg-blue-600 active:text-white text-slate-900 border-slate-200 shadow-sm'
                          }`}
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        onClick={() => setPin('')}
                        className={`h-12 rounded-xl font-bold text-xs border transition-all flex items-center justify-center ${
                          isDark
                            ? 'bg-slate-800/60 text-rose-400 border-slate-700/80 hover:bg-rose-900/30'
                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => handlePinDigit('0')}
                        className={`h-12 rounded-xl font-bold text-lg border transition-all flex items-center justify-center ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white border-slate-700/80'
                            : 'bg-white hover:bg-slate-50 active:bg-blue-600 active:text-white text-slate-900 border-slate-200 shadow-sm'
                        }`}
                      >
                        0
                      </button>
                      <button
                        onClick={() => setPin(pin.slice(0, -1))}
                        className={`h-12 rounded-xl font-bold border transition-all flex items-center justify-center ${
                          isDark
                            ? 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <Delete className="w-5 h-5" />
                      </button>
                    </div>

                    <p className={`text-center text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      💡 Demo PIN: <span className="font-bold text-blue-600 dark:text-blue-400">{selectedStudent.pinHash || '1111'}</span> (or master: 1234)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sub-mode B: Whole Class / Group Classroom Mode */}
            {studentMode === 'WHOLE_CLASS' && (
              <div
                className={`rounded-3xl p-5 sm:p-6 border shadow-xl space-y-4 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div className={`flex items-start justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1 ${
                        isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Single-Device Rural Classroom Mode • एक उपकरण वर्ग पद्धत</span>
                    </div>
                    <h3 className="font-extrabold text-base">Select Your Class / Grade</h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      No personal PIN required! Students study together, watch grade lectures, and solve group practice tests.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { grade: 1, title: 'Class 1 (इयत्ता पहिली)', desc: 'Phonics, Alphabets & Numbers 1-20', age: 'Ages 5-7' },
                    { grade: 2, title: 'Class 2 (इयत्ता दुसरी)', desc: 'Word Recognition & Basic Addition', age: 'Ages 7-8' },
                    { grade: 3, title: 'Class 3 (इयत्ता तिसरी)', desc: 'Sentence Reading & Operations', age: 'Ages 8-9' },
                    { grade: 4, title: 'Class 4 (इयत्ता चौथी)', desc: 'Environmental Studies & Subtraction', age: 'Ages 9-10' },
                    { grade: 5, title: 'Class 5 (इयत्ता पाचवी)', desc: 'Science Principles & Mental Math', age: 'Ages 10-11' },
                  ].map((cls) => (
                    <div
                      key={cls.grade}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isDark
                          ? 'bg-slate-850 border-slate-800 hover:border-amber-500/80'
                          : 'bg-slate-50 border-slate-200 hover:border-amber-400 shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{cls.age}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                              isDark ? 'bg-slate-800 text-slate-300' : 'bg-white border border-slate-200 text-slate-700'
                            }`}
                          >
                            Offline Ready
                          </span>
                        </div>
                        <h4 className="font-black text-base">{cls.title}</h4>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{cls.desc}</p>
                      </div>

                      <button
                        onClick={() => handleWholeClassLogin(cls.grade)}
                        className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
                      >
                        <span>Start {cls.title.split(' ')[0]} Learning</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE 2: TEACHER LOGIN */}
        {/* ========================================================================= */}
        {activeRole === 'TEACHER' && (
          <form
            onSubmit={handleTeacherLogin}
            className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            <div className={`pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1 ${
                  isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Teacher & School Hub Admin • शिक्षक प्रवेश</span>
              </div>
              <h3 className="font-black text-lg">Teacher Portal Authentication</h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Take offline attendance, manage TaRL competency groups, and resolve at-risk flags
              </p>
            </div>

            {teacherError && <p className="text-xs text-rose-500 dark:text-rose-400 font-bold">{teacherError}</p>}

            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Teacher ID or Registered Mobile
              </label>
              <input
                type="text"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder="e.g. TCH-PUNE-01 or 9822012345"
                className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Security PIN / Password
              </label>
              <input
                type="password"
                value={teacherPin}
                onChange={(e) => setTeacherPin(e.target.value)}
                placeholder="••••"
                className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                required
              />
            </div>

            <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>Demo ID: <code className="text-blue-600 dark:text-blue-400">TCH-PUNE-01</code></span>
              <span>PIN: <code className="text-blue-600 dark:text-blue-400">1234</code></span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In as Teacher (शिक्षकांसाठी प्रवेश)</span>
            </button>

            <div className={`pt-2 text-center border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <Link to="/register?role=TEACHER" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                New Teacher? Register School Profile
              </Link>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ROLE 3: PARENT / GUARDIAN LOGIN */}
        {/* ========================================================================= */}
        {activeRole === 'GUARDIAN' && (
          <form
            onSubmit={handleGuardianLogin}
            className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            <div className={`pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1 ${
                  isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Parent & Guardian Portal • पालक पोर्टल</span>
              </div>
              <h3 className="font-black text-lg">Parent / Guardian Login</h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Track your ward's attendance, competency levels, and welfare scholarship eligibility
              </p>
            </div>

            {guardianError && <p className="text-xs text-rose-500 dark:text-rose-400 font-bold">{guardianError}</p>}

            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Guardian Mobile Number
              </label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Student PRN / Roll Number
              </label>
              <input
                type="text"
                value={wardPrn}
                onChange={(e) => setWardPrn(e.target.value)}
                placeholder="e.g. PRN20261001"
                className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                required
              />
            </div>

            <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>Demo Phone: <code className="text-blue-600 dark:text-blue-400">9876543210</code></span>
              <span>PRN: <code className="text-blue-600 dark:text-blue-400">PRN20261001</code></span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Sign In as Guardian (पालकांसाठी प्रवेश)</span>
            </button>

            <div className={`pt-2 text-center border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <Link to="/register?role=GUARDIAN" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                Link New Ward / Register Guardian
              </Link>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ROLE 4: DISTRICT ADMINISTRATOR LOGIN */}
        {/* ========================================================================= */}
        {activeRole === 'DISTRICT_ADMIN' && (
          <form
            onSubmit={handleDistrictLogin}
            className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            <div className={`pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1 ${
                  isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>District Education Office • जिल्हा प्रशासन</span>
              </div>
              <h3 className="font-black text-lg">District Administrator Sign In</h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Aggregate cluster analytics, track school sync staleness, and generate reports
              </p>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                District Officer ID
              </label>
              <input
                type="text"
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Administrator Password
              </label>
              <input
                type="password"
                value={districtPassword}
                onChange={(e) => setDistrictPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enter District Portal</span>
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ROLE 5: CONTENT ADMINISTRATOR LOGIN */}
        {/* ========================================================================= */}
        {activeRole === 'CONTENT_ADMIN' && (
          <form
            onSubmit={handleContentAdminLogin}
            className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            <div className={`pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1 ${
                  isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Curriculum Studio • अभ्यासक्रम व्यवस्थापक</span>
              </div>
              <h3 className="font-black text-lg">Content Administrator Sign In</h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Upload local video lectures, construct interactive DPP test papers, and publish textbook materials
              </p>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Studio Editor ID
              </label>
              <input
                type="text"
                value={contentAdminId}
                onChange={(e) => setContentAdminId(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Studio Password
              </label>
              <input
                type="password"
                value={contentAdminPassword}
                onChange={(e) => setContentAdminPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enter Curriculum Studio</span>
            </button>
          </form>
        )}

        {/* Bottom Switch to Registration */}
        <div className="text-center pt-2">
          <Link
            to={`/register?role=${activeRole}`}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Don't have an account? Register New Profile (नवीन नोंदणी करा)</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
