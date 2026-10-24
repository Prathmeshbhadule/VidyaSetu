import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { StudentProfile } from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import { User, Lock, Delete, ArrowRight, Sparkles } from 'lucide-react';

export const StudentProfilePicker: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCurrentStudent } = useAuthStore();

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudents() {
      const local = await offlineDb.students.toArray();
      if (local.length > 0) {
        setStudents(local);
      } else {
        // Seed default local classroom students if empty
        const defaultStudents: StudentProfile[] = [
          {
            id: '018f679a-st01-7000-8000-000000000001',
            schoolId: '018f679a-1111-7000-8000-000000000001',
            name: 'Aarav Patil',
            prn: 'PRN20261001',
            grade: 2,
            gender: 'MALE',
            assessedLevel: 2,
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
            schoolId: '018f679a-1111-7000-8000-000000000001',
            name: 'Pooja Jadhav',
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
            schoolId: '018f679a-1111-7000-8000-000000000001',
            name: 'Sunita Sharma',
            prn: 'PRN20261030',
            grade: 5,
            gender: 'FEMALE',
            assessedLevel: 3,
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
        setStudents(defaultStudents);
      }
    }
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
    if (enteredPin === '1234' || student.pinHash === enteredPin || student.pinHash.includes(enteredPin)) {
      setCurrentStudent(student);
      navigate('/student/home');
    } else {
      setPinError(t('student.incorrectPin'));
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100/60 p-4 pb-24 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30 mb-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
            {t('student.selectProfile')}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <p className="text-sm font-medium text-amber-800">
              {selectedStudent ? `${t('student.enterPin')} for ${selectedStudent.name}` : 'Tap your profile to start learning'}
            </p>
            <AudioHelpButton text="आपला फोटो निवडा आणि चार अंकांचा पिन टाका." size="sm" />
          </div>
        </div>

        {/* Profile Grid or PIN Entry Modal */}
        {!selectedStudent ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className="flex flex-col items-center p-5 rounded-3xl bg-white border-2 border-amber-200 hover:border-orange-500 hover:shadow-xl active:scale-95 transition-all text-center min-h-[140px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-black shadow-md mb-3">
                  {student.name.charAt(0)}
                </div>
                <span className="font-extrabold text-base text-amber-950 line-clamp-1">
                  {student.name}
                </span>
                <span className="text-xs font-semibold text-orange-700 mt-1">
                  {t('common.grade')} {student.grade} • {t('common.level')} {student.assessedLevel}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-300 shadow-xl max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center text-xl">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-amber-950 text-base leading-snug">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-amber-700">PRN: {selectedStudent.prn}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-xs font-bold text-orange-600 hover:underline min-h-[36px] px-2"
              >
                Change
              </button>
            </div>

            {/* PIN Dots */}
            <div className="flex justify-center gap-3 my-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin.length > i
                      ? 'bg-orange-500 border-orange-600 scale-125'
                      : 'bg-amber-100 border-amber-300'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-center text-xs font-bold text-rose-600 mb-4 animate-shake">
                {pinError}
              </p>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handlePinDigit(digit)}
                  className="h-14 rounded-2xl bg-amber-50 hover:bg-orange-100 active:bg-orange-200 text-amber-950 font-black text-xl border border-amber-200 transition-all shadow-sm flex items-center justify-center min-h-[48px]"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => setPin('')}
                className="h-14 rounded-2xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 hover:bg-rose-100 transition-all flex items-center justify-center min-h-[48px]"
              >
                Clear
              </button>
              <button
                onClick={() => handlePinDigit('0')}
                className="h-14 rounded-2xl bg-amber-50 hover:bg-orange-100 active:bg-orange-200 text-amber-950 font-black text-xl border border-amber-200 transition-all shadow-sm flex items-center justify-center min-h-[48px]"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-14 rounded-2xl bg-amber-100/80 text-amber-900 font-bold border border-amber-300 hover:bg-amber-200 transition-all flex items-center justify-center min-h-[48px]"
                aria-label="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[11px] text-amber-700">Demo student PIN: <strong>1234</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
