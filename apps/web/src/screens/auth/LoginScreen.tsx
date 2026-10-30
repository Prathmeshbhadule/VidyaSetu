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
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Delete,
  School,
  Sparkles,
  UserCheck,
  UserPlus,
  Sun,
  Moon,
  ChevronRight,
  Zap,
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
  const [studentMode, setStudentMode] = useState<'INDIVIDUAL' | 'WHOLE_CLASS'>('INDIVIDUAL');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Forms
  const [teacherId, setTeacherId] = useState('TCH-PUNE-01');
  const [teacherPin, setTeacherPin] = useState('1234');
  const [teacherError, setTeacherError] = useState('');

  const [guardianPhone, setGuardianPhone] = useState('9876543210');
  const [wardPrn, setWardPrn] = useState('PRN20261001');
  const [guardianError, setGuardianError] = useState('');

  const [districtId, setDistrictId] = useState('DIST-PUNE-01');
  const [districtPassword, setDistrictPassword] = useState('admin123');

  const [contentAdminId, setContentAdminId] = useState('CONTENT-MKT-01');
  const [contentAdminPassword, setContentAdminPassword] = useState('content123');

  const loadStudents = async () => {
    let local = await offlineDb.students.toArray();
    if (local.length === 0) {
      const defaultStudents: StudentProfile[] = [
        {
          id: '018f679a-st01-7000-8000-000000000001',
          schoolId: schoolId || '018f679a-1111-7000-8000-000000000001',
          name: 'Aarav Patil (आरव पाटील)',
          prn: 'PRN20261001',
          grade: 3,
          gender: 'MALE',
          assessedLevel: 3,
          avatarId: 'avatar-1',
          pinHash: '1234',
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
          pinHash: '1234',
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
          pinHash: '1234',
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
      setPinError('चुकीचा पिन! कृपया पुन्हा प्रयत्न करा (Incorrect PIN)');
      setPin('');
    }
  };

  const handleWholeClassLogin = (grade: number) => {
    loginAsClass(grade);
    navigate('/student/home');
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId.trim() || !teacherPin.trim()) {
      setTeacherError('Please enter Teacher ID and PIN');
      return;
    }
    loginAsTeacher({
      teacherId: teacherId.trim(),
      name: 'Sunil Patil Sir',
      schoolId: schoolId || '018f679a-1111-7000-8000-000000000001',
      phone: '9822012345',
      assignedGrades: [1, 2, 3, 4, 5],
    });
    navigate('/teacher/attendance');
  };

  const handleGuardianLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianPhone.trim() || !wardPrn.trim()) {
      setGuardianError('Please enter Guardian Mobile and Ward PRN');
      return;
    }
    loginAsGuardian({
      id: 'guardian-01',
      name: 'Ramesh Patil',
      phone: guardianPhone.trim(),
      wardPrn: wardPrn.trim(),
      wardName: 'Aarav Patil',
    });
    navigate('/parent');
  };

  const handleDistrictLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsDistrictAdmin({
      id: districtId,
      name: 'Dr. Rajesh More (DEO)',
      scope: 'DISTRICT',
      district: 'Pune Rural District',
    });
    navigate('/district/dashboard');
  };

  const handleContentAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsContentAdmin({
      id: contentAdminId,
      name: 'Curriculum Studio',
      scope: 'CONTENT',
    });
    navigate('/admin/content');
  };

  // Quick 1-Click Login for immediate preview
  const handleQuickDemo = (roleType: 'student' | 'class' | 'teacher' | 'guardian' | 'district') => {
    if (roleType === 'student') {
      const stu = students[0] || {
        id: '018f679a-st01-7000-8000-000000000001',
        name: 'Aarav Patil',
        grade: 3,
        assessedLevel: 3,
        prn: 'PRN20261001',
      };
      loginStudent(stu as any);
      navigate('/student/home');
    } else if (roleType === 'class') {
      loginAsClass(3);
      navigate('/student/home');
    } else if (roleType === 'teacher') {
      loginAsTeacher({
        teacherId: 'TCH-PUNE-01',
        name: 'Sunil Patil Sir',
        schoolId: schoolId || '018f679a-1111-7000-8000-000000000001',
        phone: '9822012345',
        assignedGrades: [1, 2, 3, 4, 5],
      });
      navigate('/teacher/attendance');
    } else if (roleType === 'guardian') {
      loginAsGuardian({
        id: 'guardian-01',
        name: 'Ramesh Patil',
        phone: '9876543210',
        wardPrn: 'PRN20261001',
        wardName: 'Aarav Patil',
      });
      navigate('/parent');
    } else if (roleType === 'district') {
      loginAsDistrictAdmin({
        id: 'DIST-PUNE-01',
        name: 'Dr. Rajesh More (DEO)',
        scope: 'DISTRICT',
        district: 'Pune Rural District',
      });
      navigate('/district/dashboard');
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 pb-32 flex flex-col items-center justify-center animate-chart-enter">
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <School className="w-3.5 h-3.5" />
            <span>Vidya Setu • Offline Learning Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Choose Your Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Role-isolated access for rural students, multi-grade classrooms, teachers, and district administration
          </p>
        </div>

        {/* Quick Demo Instant Access Pills */}
        <div className="apple-glass rounded-[24px] p-3 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Instant Demo Access (1-Click Preview)</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => handleQuickDemo('student')}
              className="apple-press inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Aarav (Student)</span>
            </button>
            <button
              onClick={() => handleQuickDemo('class')}
              className="apple-press inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold"
            >
              <School className="w-3.5 h-3.5" />
              <span>Class 3 Batch</span>
            </button>
            <button
              onClick={() => handleQuickDemo('teacher')}
              className="apple-press inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teacher Portal</span>
            </button>
            <button
              onClick={() => handleQuickDemo('guardian')}
              className="apple-press inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Parent Portal</span>
            </button>
            <button
              onClick={() => handleQuickDemo('district')}
              className="apple-press inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>District Analytics</span>
            </button>
          </div>
        </div>

        {/* Apple Segmented Role Picker */}
        <div className="inline-flex w-full p-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          {[
            { role: 'STUDENT' as UserRole, label: 'Student', icon: <GraduationCap className="w-3.5 h-3.5" /> },
            { role: 'TEACHER' as UserRole, label: 'Teacher', icon: <Users className="w-3.5 h-3.5" /> },
            { role: 'GUARDIAN' as UserRole, label: 'Parent', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
            { role: 'DISTRICT_ADMIN' as UserRole, label: 'District', icon: <Building2 className="w-3.5 h-3.5" /> },
            { role: 'CONTENT_ADMIN' as UserRole, label: 'Studio', icon: <BookOpen className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.role}
              onClick={() => {
                setActiveRole(tab.role);
                setSelectedStudent(null);
              }}
              className={`apple-segment-item flex-1 py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === tab.role
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Student View */}
        {activeRole === 'STUDENT' && (
          <div className="space-y-4">
            {/* Student Mode Switcher */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setStudentMode('INDIVIDUAL');
                  setSelectedStudent(null);
                }}
                className={`apple-press px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  studentMode === 'INDIVIDUAL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                1. Individual Student Profile
              </button>
              <button
                onClick={() => {
                  setStudentMode('WHOLE_CLASS');
                  setSelectedStudent(null);
                }}
                className={`apple-press px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  studentMode === 'WHOLE_CLASS'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                2. Whole Class Mode (No PIN)
              </button>
            </div>

            {studentMode === 'INDIVIDUAL' ? (
              !selectedStudent ? (
                <div className="apple-card rounded-[28px] p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">Choose Your Name</h3>
                      <p className="text-xs text-slate-400">Tap your profile to enter your 4-digit PIN</p>
                    </div>
                    <AudioHelpButton text="आपले नाव निवडा आणि पिन टाका." size="sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        className="apple-press p-4 rounded-[22px] bg-slate-50/75 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center hover:border-blue-500/40 transition-all group"
                      >
                        <div className="w-12 h-12 mx-auto rounded-[16px] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-sm mb-2 group-hover:scale-105 transition-transform">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm text-slate-900 dark:text-white block truncate">
                          {student.name}
                        </span>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block mt-0.5">
                          Grade {student.grade} • Level {student.assessedLevel}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Apple PIN Keypad */
                <div className="apple-card rounded-[28px] p-6 max-w-sm mx-auto space-y-5 text-center">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-left">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedStudent.name}</h4>
                      <span className="text-xs text-slate-400">Enter Security PIN</span>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  {/* PIN Dots */}
                  <div className="flex justify-center gap-3 my-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                          pin.length > i
                            ? 'bg-blue-600 scale-125'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {pinError && (
                    <p className="text-xs font-semibold text-rose-500 dark:text-rose-400">{pinError}</p>
                  )}

                  {/* Tactile Circular Keypad */}
                  <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        onClick={() => handlePinDigit(digit)}
                        className="apple-press w-16 h-16 rounded-full font-semibold text-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-900 dark:text-white flex items-center justify-center transition-all mx-auto"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      onClick={() => setPin('')}
                      className="apple-press w-16 h-16 rounded-full font-medium text-xs text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => handlePinDigit('0')}
                      className="apple-press w-16 h-16 rounded-full font-semibold text-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-900 dark:text-white flex items-center justify-center transition-all mx-auto"
                    >
                      0
                    </button>
                    <button
                      onClick={() => setPin(pin.slice(0, -1))}
                      className="apple-press w-16 h-16 rounded-full font-medium text-slate-500 flex items-center justify-center mx-auto"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    PIN is pre-set to: <strong className="text-slate-700 dark:text-slate-200">1234</strong>
                  </p>
                </div>
              )
            ) : (
              /* Whole Class Mode */
              <div className="apple-card rounded-[28px] p-6 space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Whole Class 1-Click Launch</h3>
                  <p className="text-xs text-slate-400">Ideal for shared single-tablet classrooms</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { grade: 1, title: 'Class 1 (पहिली)', desc: 'Phonics & Basic Numbers' },
                    { grade: 2, title: 'Class 2 (दुसरी)', desc: 'Words & Simple Addition' },
                    { grade: 3, title: 'Class 3 (तिसरी)', desc: 'Sentences & Operations' },
                    { grade: 4, title: 'Class 4 (चौथी)', desc: 'Environmental Studies & Science' },
                  ].map((cls) => (
                    <button
                      key={cls.grade}
                      onClick={() => handleWholeClassLogin(cls.grade)}
                      className="apple-press p-4 rounded-[22px] bg-slate-50/75 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left hover:border-amber-500/40 transition-all flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">{cls.title}</span>
                        <span className="text-xs text-slate-400 mt-0.5 block">{cls.desc}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Teacher Form */}
        {activeRole === 'TEACHER' && (
          <form onSubmit={handleTeacherLogin} className="apple-card rounded-[28px] p-6 sm:p-8 space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Teacher Sign In</h3>
              <p className="text-xs text-slate-400">Classroom attendance, TaRL groupings, and at-risk resolution</p>
            </div>

            {teacherError && <p className="text-xs text-rose-500 font-semibold">{teacherError}</p>}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Teacher ID
              </label>
              <input
                type="text"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                PIN
              </label>
              <input
                type="password"
                value={teacherPin}
                onChange={(e) => setTeacherPin(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="apple-press w-full py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-sm transition-all"
            >
              Sign In to Teacher Hub
            </button>
          </form>
        )}

        {/* Guardian Form */}
        {activeRole === 'GUARDIAN' && (
          <form onSubmit={handleGuardianLogin} className="apple-card rounded-[28px] p-6 sm:p-8 space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Parent / Guardian Login</h3>
              <p className="text-xs text-slate-400">Track attendance, learning levels, and welfare scholarship eligibility</p>
            </div>

            {guardianError && <p className="text-xs text-rose-500 font-semibold">{guardianError}</p>}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Registered Mobile Number
              </label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Student PRN
              </label>
              <input
                type="text"
                value={wardPrn}
                onChange={(e) => setWardPrn(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="apple-press w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
            >
              Access Parent Dashboard
            </button>
          </form>
        )}

        {/* District Admin Form */}
        {activeRole === 'DISTRICT_ADMIN' && (
          <form onSubmit={handleDistrictLogin} className="apple-card rounded-[28px] p-6 sm:p-8 space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">District Administrator Sign In</h3>
              <p className="text-xs text-slate-400">Aggregate telemetry, school synchronization tracking, and report exports</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Officer ID
              </label>
              <input
                type="text"
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={districtPassword}
                onChange={(e) => setDistrictPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="apple-press w-full py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-sm transition-all"
            >
              Enter District Analytics
            </button>
          </form>
        )}

        {/* Content Admin Form */}
        {activeRole === 'CONTENT_ADMIN' && (
          <form onSubmit={handleContentAdminLogin} className="apple-card rounded-[28px] p-6 sm:p-8 space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Curriculum Studio</h3>
              <p className="text-xs text-slate-400">Author offline textbook materials, local video lectures, and DPP quizzes</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Studio Editor ID
              </label>
              <input
                type="text"
                value={contentAdminId}
                onChange={(e) => setContentAdminId(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={contentAdminPassword}
                onChange={(e) => setContentAdminPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="apple-press w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-sm transition-all"
            >
              Open Studio Workspace
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
