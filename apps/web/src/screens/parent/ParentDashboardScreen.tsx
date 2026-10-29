import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { StudentProfile } from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  Users,
  Award,
  CheckCircle2,
  Calendar,
  Bell,
  Star,
  FileText,
} from 'lucide-react';

export const ParentDashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [attendancePercent, setAttendancePercent] = useState<number>(85);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function loadChildData() {
      const students = await offlineDb.students.toArray();
      // Demo child: Pooja Jadhav or first student
      const child = students.find((s) => s.name.includes('Pooja')) || students[0];
      if (child) {
        setStudent(child);
        const attendance = await offlineDb.attendance.where('studentId').equals(child.id).toArray();
        if (attendance.length > 0) {
          const present = attendance.filter((a) => a.status === 'PRESENT').length;
          setAttendancePercent(Math.round((present / attendance.length) * 100));
        }
      }

      setNotifications([
        {
          id: 'notif-1',
          type: 'SCHEME_ELIGIBLE',
          title: 'Eligible for Savitribai Phule Scholarship',
          message: 'Your child Pooja is eligible for the annual girl student scholarship. Collect the application from the school headmaster.',
          channelUsed: 'SMS',
          date: 'Yesterday',
        },
        {
          id: 'notif-2',
          type: 'ASSESSMENT_REPORT',
          title: 'Level 3 Achieved in Marathi & Math',
          message: 'Shabash! Pooja has successfully advanced to Level 3 (Paragraph Reading and 2-digit operations).',
          channelUsed: 'ON_DEVICE',
          date: '3 days ago',
        },
      ]);
    }
    loadChildData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-36 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Parent & Guardian Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Track your child's learning progress, school attendance, and benefits
          </p>
        </div>

        <AudioHelpButton text="पालक पोर्टल. आपल्या पाल्याची उपस्थिती, शैक्षणिक प्रगती आणि शासकीय योजनांची माहिती." size="sm" />
      </div>

      {student && (
        <>
          {/* Child Profile Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {student.name.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase">
                  Student Record • Grade {student.grade}
                </span>
                <h3 className="text-2xl font-black text-slate-900">{student.name}</h3>
                <p className="text-xs text-slate-500 font-medium">PRN: {student.prn}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[11px] uppercase font-bold text-blue-700">Learning Level</span>
                <div className="text-xl font-black text-slate-900">Level {student.assessedLevel}</div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[11px] uppercase font-bold text-emerald-800">Attendance</span>
                <div className="text-xl font-black text-emerald-700">{attendancePercent}%</div>
              </div>
            </div>
          </div>

          {/* Notifications Feed */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-6">
            <h3 className="font-extrabold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              School Notices & Communications
            </h3>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    <span className="text-[11px] text-slate-500 font-semibold">{n.date}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{n.message}</p>
                  <span className="text-[10px] font-bold text-blue-700 uppercase mt-2 block">
                    Delivered via: {n.channelUsed}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
