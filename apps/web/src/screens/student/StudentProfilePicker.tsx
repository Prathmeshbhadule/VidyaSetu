import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { StudentProfile, generateUuidV7 } from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  User,
  Lock,
  Delete,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  UserPlus,
  X,
  CheckCircle2,
} from 'lucide-react';

export const StudentProfilePicker: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginStudent, schoolId } = useAuthStore();

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // New Student Registration Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState(3);
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [newPin, setNewPin] = useState('1234');

  const loadStudents = async () => {
    const local = await offlineDb.students.toArray();
    if (local.length > 0) {
      setStudents(local);
    } else {
      const defaultStudents: StudentProfile[] = [
        {
          id: '018f679a-st01-7000-8000-000000000001',
          schoolId: '018f679a-1111-7000-8000-000000000001',
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
          schoolId: '018f679a-1111-7000-8000-000000000001',
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
          schoolId: '018f679a-1111-7000-8000-000000000001',
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
      setStudents(defaultStudents);
    }
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

      // Auto submit on 4 digits
      if (nextPin.length === 4 && selectedStudent) {
        verifyPinAndLogin(nextPin, selectedStudent);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setPinError(null);
  };

  const verifyPinAndLogin = (enteredPin: string, student: StudentProfile) => {
    // Check against individual student's pinHash, with master fallback 1234 for initial evaluation
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

  const handleCreateNewStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPin.length !== 4) return;

    const newStudent: StudentProfile = {
      id: generateUuidV7(),
      schoolId: schoolId || '018f679a-1111-7000-8000-000000000001',
      name: newName,
      prn: `PRN${Date.now().toString().slice(-6)}`,
      grade: Number(newGrade),
      gender: newGender,
      assessedLevel: 2,
      avatarId: newGender === 'FEMALE' ? 'avatar-female' : 'avatar-male',
      pinHash: newPin,
      parentalConsent: true,
      version: 1,
      deviceId: 'dev-tablet-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await offlineDb.students.put(newStudent);
    setShowAddModal(false);
    setNewName('');
    setNewPin('1234');
    await loadStudents();
    setSelectedStudent(newStudent);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-28 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Top Branding & Lock Icon */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/30 ring-4 ring-blue-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {selectedStudent ? `${selectedStudent.name}` : 'विद्यार्थी लॉगिन (Student Login)'}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs sm:text-sm font-medium text-slate-400">
              {selectedStudent
                ? 'सुरक्षित लॉगिनसाठी आपला ४ अंकांचा पिन टाका (Enter 4-Digit PIN)'
                : 'अभ्यास सुरू करण्यासाठी आपले नाव निवडा (Select your profile)'}
            </p>
            <AudioHelpButton text="आपले नाव निवडा आणि चार अंकांचा गुप्त पिन टाका." size="sm" />
          </div>
        </div>

        {/* Profile Grid or PIN Entry Modal */}
        {!selectedStudent ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {students.map((student) => {
                const isFemale = student.gender === 'FEMALE';
                return (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="flex flex-col items-center p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500 hover:bg-slate-850 hover:shadow-xl active:scale-95 transition-all text-center min-h-[140px] group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md mb-2.5 group-hover:scale-105 transition-transform">
                      {isFemale ? '👧' : '👦'}
                    </div>
                    <span className="font-extrabold text-sm sm:text-base text-white line-clamp-1">
                      {student.name}
                    </span>
                    <span className="text-[11px] font-bold text-blue-400 mt-0.5">
                      इयत्ता {student.grade} • Level {student.assessedLevel}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                      PIN Protected
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Add New Student Profile Button */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 font-bold text-xs transition-all shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ नवीन विद्यार्थी प्रोफाइल जोडा (Add New Student)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl max-w-sm mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xl shadow-md">
                  {selectedStudent.gender === 'FEMALE' ? '👧' : '👦'}
                </div>
                <div>
                  <h3 className="font-black text-white text-base leading-snug">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Grade {selectedStudent.grade} • PRN: {selectedStudent.prn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-xs font-bold text-blue-400 hover:underline min-h-[36px] px-2"
              >
                बदला (Change)
              </button>
            </div>

            {/* PIN Dots Display */}
            <div className="flex justify-center gap-4 my-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin.length > i
                      ? 'bg-blue-500 border-blue-400 scale-125 shadow-md shadow-blue-500/50'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-center text-xs font-bold text-rose-400 animate-shake">
                {pinError}
              </p>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handlePinDigit(digit)}
                  className="h-13 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-black text-xl border border-slate-700/80 transition-all shadow-sm flex items-center justify-center min-h-[48px]"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => setPin('')}
                className="h-13 py-3 rounded-2xl bg-slate-800/60 text-rose-400 font-bold text-xs border border-slate-700/80 hover:bg-rose-900/40 transition-all flex items-center justify-center min-h-[48px]"
              >
                Clear
              </button>
              <button
                onClick={() => handlePinDigit('0')}
                className="h-13 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-black text-xl border border-slate-700/80 transition-all shadow-sm flex items-center justify-center min-h-[48px]"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-13 py-3 rounded-2xl bg-slate-800/80 text-slate-300 font-bold border border-slate-700/80 hover:bg-slate-700 transition-all flex items-center justify-center min-h-[48px]"
                aria-label="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400 font-medium">
              <span>डेमो पिन: <strong>{selectedStudent.pinHash || '1234'}</strong> (किंवा 1234)</span>
            </div>
          </div>
        )}

        {/* Modal: Register New Student */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                  नवीन विद्यार्थी नोंदणी (Register Student)
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewStudent} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    विद्यार्थ्याचे पूर्ण नाव (Student Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. राहुल शिंदे"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-bold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">इयत्ता (Grade)</label>
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-bold text-xs"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                        <option key={g} value={g}>
                          इयत्ता {g} री
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">लिंग (Gender)</label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-bold text-xs"
                    >
                      <option value="FEMALE">Girl (मुलगी)</option>
                      <option value="MALE">Boy (मुलगा)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ४ अंकांचा गुप्त पिन (4-Digit PIN for Login) *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono font-bold text-sm tracking-widest text-center"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    हा पिन फक्त याच विद्यार्थ्याला माहित असावा जेणेकरून इतर कोणी लॉग इन करू शकणार नाही.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>विद्यार्थी प्रोफाइल सेव्ह करा (Save & Continue)</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
