import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { generateUuidV7, StudentProfile, UserRole } from '@vidya-setu/shared';
import {
  GraduationCap,
  Users,
  HeartHandshake,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ShieldCheck,
  School,
  Sparkles,
} from 'lucide-react';

export const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRoleParam = searchParams.get('role') as UserRole | null;

  const { loginStudent, loginAsTeacher, loginAsGuardian, schoolId } = useAuthStore();

  const [activeRole, setActiveRole] = useState<'STUDENT' | 'TEACHER' | 'GUARDIAN'>(
    initialRoleParam === 'TEACHER' ? 'TEACHER' : initialRoleParam === 'GUARDIAN' ? 'GUARDIAN' : 'STUDENT'
  );

  // Student Registration Form
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState(2);
  const [studentGender, setStudentGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [studentPrn, setStudentPrn] = useState(`PRN${Date.now().toString().slice(-6)}`);
  const [studentPin, setStudentPin] = useState('1234');

  // Teacher Registration Form
  const [teacherName, setTeacherName] = useState('');
  const [teacherId, setTeacherId] = useState(`TCH-${Date.now().toString().slice(-4)}`);
  const [teacherSchool, setTeacherSchool] = useState('Zilla Parishad Primary School Khed');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherPin, setTeacherPin] = useState('1234');

  // Guardian Registration Form
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [wardPrn, setWardPrn] = useState('');
  const [relation, setRelation] = useState('Parent / पालक');

  const [isSuccess, setIsSuccess] = useState(false);

  // Handle Student Registration
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || studentPin.length !== 4) return;

    const newStudent: StudentProfile = {
      id: generateUuidV7(),
      schoolId: schoolId || '018f679a-1111-7000-8000-000000000001',
      name: studentName.trim(),
      prn: studentPrn.trim(),
      grade: Number(studentGrade),
      gender: studentGender,
      assessedLevel: Number(studentGrade) <= 2 ? 2 : 3,
      avatarId: studentGender === 'FEMALE' ? 'avatar-female' : 'avatar-male',
      pinHash: studentPin,
      parentalConsent: true,
      version: 1,
      deviceId: 'dev-tablet-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await offlineDb.students.put(newStudent);
    setIsSuccess(true);

    setTimeout(() => {
      loginStudent(newStudent);
      navigate('/student/home');
    }, 800);
  };

  // Handle Teacher Registration
  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherId.trim()) return;

    setIsSuccess(true);
    setTimeout(() => {
      loginAsTeacher({
        teacherId: teacherId.trim(),
        name: `${teacherName.trim()} (शिक्षक)`,
        schoolId: schoolId || '018f679a-1111-7000-8000-000000000001',
        phone: teacherPhone.trim(),
        assignedGrades: [1, 2, 3, 4, 5],
      });
      navigate('/teacher/attendance');
    }, 800);
  };

  // Handle Guardian Registration
  const handleRegisterGuardian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianName.trim() || !guardianPhone.trim()) return;

    setIsSuccess(true);
    setTimeout(() => {
      loginAsGuardian({
        id: generateUuidV7(),
        name: guardianName.trim(),
        phone: guardianPhone.trim(),
        wardPrn: wardPrn.trim() || 'PRN20261001',
        wardName: 'Student Ward',
      });
      navigate('/parent');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-3 sm:p-6 pb-24 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 text-xs font-bold shadow-sm">
            <School className="w-4 h-4 text-blue-400" />
            <span>विद्या सेतू • Offline Profile Registration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Create New Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md mx-auto">
            Offline-first account registration saved to local storage and synchronized with school hub
          </p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <button
            onClick={() => setActiveRole('STUDENT')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeRole === 'STUDENT'
                ? 'bg-blue-600 text-white shadow-md font-black ring-1 ring-blue-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student</span>
          </button>

          <button
            onClick={() => setActiveRole('TEACHER')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeRole === 'TEACHER'
                ? 'bg-blue-600 text-white shadow-md font-black ring-1 ring-blue-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Teacher</span>
          </button>

          <button
            onClick={() => setActiveRole('GUARDIAN')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeRole === 'GUARDIAN'
                ? 'bg-blue-600 text-white shadow-md font-black ring-1 ring-blue-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Parent</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* STUDENT REGISTRATION FORM */}
        {/* ========================================================================= */}
        {activeRole === 'STUDENT' && (
          <form onSubmit={handleRegisterStudent} className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-black text-lg text-white">Student Registration (विद्यार्थी नोंदणी)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Register student to access video lectures, DPP practice, and offline textbook notes
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Student Full Name (विद्यार्थ्याचे नाव)
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Rohini Patil (रोहिणी पाटील)"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Class / Grade (इयत्ता)
                </label>
                <select
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Class 1 (इयत्ता पहिली)</option>
                  <option value={2}>Class 2 (इयत्ता दुसरी)</option>
                  <option value={3}>Class 3 (इयत्ता तिसरी)</option>
                  <option value={4}>Class 4 (इयत्ता चौथी)</option>
                  <option value={5}>Class 5 (इयत्ता पाचवी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Gender (लिंग)
                </label>
                <select
                  value={studentGender}
                  onChange={(e) => setStudentGender(e.target.value as 'MALE' | 'FEMALE')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FEMALE">Female (मुलगी)</option>
                  <option value="MALE">Male (मुलगा)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  PRN / Roll Number
                </label>
                <input
                  type="text"
                  value={studentPrn}
                  onChange={(e) => setStudentPrn(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Security PIN (4 digits)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={studentPin}
                  onChange={(e) => setStudentPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSuccess}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Account Registered! Logging In...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Start Learning (नोंदणी पूर्ण करा)</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TEACHER REGISTRATION FORM */}
        {/* ========================================================================= */}
        {activeRole === 'TEACHER' && (
          <form onSubmit={handleRegisterTeacher} className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-black text-lg text-white">Teacher Registration (शिक्षक नोंदणी)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Register as a teacher to record attendance and monitor learning mastery
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Teacher Full Name (शिक्षकाचे नाव)
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="e.g. Sunil Patil Sir"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Teacher ID
                </label>
                <input
                  type="text"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Security PIN / Password
                </label>
                <input
                  type="password"
                  value={teacherPin}
                  onChange={(e) => setTeacherPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                School Name
              </label>
              <input
                type="text"
                value={teacherSchool}
                onChange={(e) => setTeacherSchool(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSuccess}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Teacher Profile Created! Loading Dashboard...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Register as Teacher (शिक्षक नोंदणी)</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* GUARDIAN REGISTRATION FORM */}
        {/* ========================================================================= */}
        {activeRole === 'GUARDIAN' && (
          <form onSubmit={handleRegisterGuardian} className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-black text-lg text-white">Parent Registration (पालक नोंदणी)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Link your phone to your child's student record for offline SMS and progress cards
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Guardian Full Name (पालकाचे नाव)
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Ramesh Patil"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Guardian Mobile Number
                </label>
                <input
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="10-digit number"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Ward's PRN / Roll Number
                </label>
                <input
                  type="text"
                  value={wardPrn}
                  onChange={(e) => setWardPrn(e.target.value)}
                  placeholder="e.g. PRN20261001"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSuccess}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Guardian Linked! Entering Parent Portal...</span>
                </>
              ) : (
                <>
                  <HeartHandshake className="w-4 h-4" />
                  <span>Register & Link Ward (नोंदणी पूर्ण करा)</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Bottom Switch to Login */}
        <div className="text-center pt-2">
          <Link
            to={`/login?role=${activeRole}`}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Already have an account? Sign In (प्रवेश करा)</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
