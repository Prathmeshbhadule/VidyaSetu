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

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'ABSENT').length;
  const attendancePercentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-28">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-orange-600" />
            {t('teacher.markAttendance')}
          </h2>
          <p className="text-xs sm:text-sm text-amber-800 font-medium mt-1">
            {t('teacher.allPresentByDefault')}
          </p>
        </div>

        <AudioHelpButton text="विद्यार्थ्यांची हजेरी नोंदवा. सर्व हजर आहेत. गैरहजर असलेल्या विद्यार्थ्यावर टॅप करा." size="sm" />
      </div>

      {/* Date Window Selector (Past 7 Days) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {dates.map((dateStr, idx) => {
          const isSelected = selectedDate === dateStr;
          const label = idx === 0 ? 'Today' : idx === 1 ? 'Yesterday' : dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap min-h-[44px] ${
                isSelected
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-100/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Summary Stats Card */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-amber-200 text-center shadow-sm">
          <span className="text-[11px] uppercase font-extrabold text-amber-700">Present</span>
          <div className="text-2xl font-black text-emerald-600 mt-0.5">{presentCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-amber-200 text-center shadow-sm">
          <span className="text-[11px] uppercase font-extrabold text-amber-700">Absent</span>
          <div className="text-2xl font-black text-rose-600 mt-0.5">{absentCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-amber-200 text-center shadow-sm">
          <span className="text-[11px] uppercase font-extrabold text-amber-700">Attendance %</span>
          <div className="text-2xl font-black text-amber-950 mt-0.5">{attendancePercentage}%</div>
        </div>
      </div>

      {/* Undo Toast */}
      {lastAction && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-900 text-white flex items-center justify-between gap-3 shadow-lg animate-fade-in">
          <span className="text-xs font-semibold">
            Marked <strong>{lastAction.studentName}</strong> as {attendanceMap[lastAction.studentId]}
          </span>
          <button
            onClick={handleUndo}
            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-800 hover:bg-amber-700 rounded-lg text-xs font-black min-h-[36px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Student Attendance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {students.map((student) => {
          const isPresent = (attendanceMap[student.id] || 'PRESENT') === 'PRESENT';

          return (
            <button
              key={student.id}
              onClick={() => toggleStudentStatus(student)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left shadow-sm min-h-[64px] active:scale-[0.98] ${
                isPresent
                  ? 'bg-white border-emerald-300 hover:border-emerald-500'
                  : 'bg-rose-50/80 border-rose-400 hover:border-rose-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-sm ${
                    isPresent ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-amber-950 text-base leading-snug">
                    {student.name}
                  </h4>
                  <p className="text-xs text-amber-700 font-semibold">
                    Grade {student.grade} • PRN: {student.prn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
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
