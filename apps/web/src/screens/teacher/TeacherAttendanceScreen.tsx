import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { syncManager } from '../../services/sync-manager.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import {
  AttendanceRecord,
  StudentProfile,
  generateUuidV7,
  AttendanceStatus,
} from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const TeacherAttendanceScreen: React.FC = () => {
  const { t } = useTranslation();
  const { schoolId } = useAuthStore();

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [lastAction, setLastAction] = useState<{
    studentId: string;
    studentName: string;
    prevStatus: AttendanceStatus;
  } | null>(null);

  // Generate 7-day historical window dates
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    async function loadAttendanceData() {
      const allStudents = await offlineDb.students.toArray();
      setStudents(allStudents);

      const records = await offlineDb.attendance.where('date').equals(selectedDate).toArray();
      const map: Record<string, AttendanceStatus> = {};

      for (const s of allStudents) {
        // Everyone defaults to PRESENT unless recorded otherwise
        map[s.id] = 'PRESENT';
      }

      for (const r of records) {
        map[r.studentId] = r.status;
      }

      setAttendanceMap(map);
    }
    loadAttendanceData();
  }, [selectedDate]);

  const toggleStudentStatus = async (student: StudentProfile) => {
    const current = attendanceMap[student.id] || 'PRESENT';
    const next: AttendanceStatus = current === 'PRESENT' ? 'ABSENT' : 'PRESENT';

    setLastAction({
      studentId: student.id,
      studentName: student.name,
      prevStatus: current,
    });

    const updatedMap = { ...attendanceMap, [student.id]: next };
    setAttendanceMap(updatedMap);

    const recordEntity: AttendanceRecord = {
      id: generateUuidV7(),
      schoolId: student.schoolId,
      studentId: student.id,
      date: selectedDate,
      status: next,
      markedBy: 'teacher-local',
      source: 'TEACHER',
      version: 1,
      deviceId: syncManager.getDeviceId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    // Save to local Dexie database and queue outbox mutation atomically!
    await syncManager.mutate(
      'Attendance',
      offlineDb.attendance,
      recordEntity,
      'INSERT',
      1 // Priority 1 (High priority)
    );
  };

  const handleUndo = async () => {
    if (!lastAction) return;

    const student = students.find((s) => s.id === lastAction.studentId);
    if (!student) return;

    const revertedStatus = lastAction.prevStatus;
    setAttendanceMap((prev) => ({ ...prev, [student.id]: revertedStatus }));

    const recordEntity: AttendanceRecord = {
      id: generateUuidV7(),
      schoolId: student.schoolId,
      studentId: student.id,
      date: selectedDate,
      status: revertedStatus,
      markedBy: 'teacher-local',
      source: 'TEACHER',
      version: 1,
      deviceId: syncManager.getDeviceId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await syncManager.mutate('Attendance', offlineDb.attendance, recordEntity, 'INSERT', 1);
    setLastAction(null);
  };

  const handleMarkAll = async (status: AttendanceStatus) => {
    const updatedMap: Record<string, AttendanceStatus> = {};
    for (const s of students) {
      updatedMap[s.id] = status;
      const recordEntity: AttendanceRecord = {
        id: generateUuidV7(),
        schoolId: s.schoolId,
        studentId: s.id,
        date: selectedDate,
        status,
        markedBy: 'teacher-local',
        source: 'TEACHER',
        version: 1,
        deviceId: syncManager.getDeviceId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };
      await syncManager.mutate('Attendance', offlineDb.attendance, recordEntity, 'INSERT', 1);
    }
    setAttendanceMap(updatedMap);
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'ABSENT').length;
  const attendancePercentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-36 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-blue-600" />
            <span>{t('teacher.markAttendance')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {t('teacher.allPresentByDefault')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AudioHelpButton text="विद्यार्थ्यांची हजेरी नोंदवा. सर्व हजर आहेत. गैरहजर असलेल्या विद्यार्थ्यावर टॅप करा." size="sm" />
        </div>
      </div>

      {/* Date Window Selector (Past 7 Days) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {dates.map((dateStr, idx) => {
            const isSelected = selectedDate === dateStr;
            const label = idx === 0 ? 'Today' : idx === 1 ? 'Yesterday' : dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap min-h-[44px] ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-300'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMarkAll('PRESENT')}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-all min-h-[40px] flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All Present</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Card */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center shadow-sm">
          <span className="text-[11px] uppercase font-extrabold text-slate-500">Present</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-0.5">{presentCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center shadow-sm">
          <span className="text-[11px] uppercase font-extrabold text-slate-500">Absent</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-0.5">{absentCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center shadow-sm">
          <span className="text-[11px] uppercase font-extrabold text-slate-500">Attendance %</span>
          <div className={`text-2xl sm:text-3xl font-black mt-0.5 ${attendancePercentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {attendancePercentage}%
          </div>
        </div>
      </div>

      {/* Undo Toast */}
      {lastAction && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-lg animate-fade-in">
          <span className="text-xs font-semibold">
            Marked <strong>{lastAction.studentName}</strong> as {attendanceMap[lastAction.studentId]}
          </span>
          <button
            onClick={handleUndo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black min-h-[36px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Student Attendance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {students.map((student) => {
          const isPresent = (attendanceMap[student.id] || 'PRESENT') === 'PRESENT';

          return (
            <button
              key={student.id}
              onClick={() => toggleStudentStatus(student)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left shadow-sm min-h-[64px] active:scale-[0.98] ${
                isPresent
                  ? 'bg-white border-emerald-300 hover:border-emerald-500 hover:shadow-md'
                  : 'bg-rose-50/80 border-rose-400 hover:border-rose-500 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-sm ${
                    isPresent ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base leading-snug">
                    {student.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold">
                    Grade {student.grade} • PRN: {student.prn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isPresent
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800 animate-pulse'
                  }`}
                >
                  {isPresent ? 'Present' : 'Absent'}
                </span>
                {isPresent ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
