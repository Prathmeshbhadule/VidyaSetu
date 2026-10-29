import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { syncManager } from '../../services/sync-manager.js';
import {
  evaluateStudentAtRisk,
  createAtRiskEntities,
  AtRiskFlag,
  StudentProfile,
  Scheme,
} from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  Award,
  Sparkles,
  Send,
  MessageSquare,
} from 'lucide-react';

export const TeacherAtRiskScreen: React.FC = () => {
  const { t } = useTranslation();
  const [flags, setFlags] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<any | null>(null);
  const [followUpNote, setFollowUpNote] = useState('');

  useEffect(() => {
    async function loadData() {
      const allSchemes = await offlineDb.schemes.toArray();
      setSchemes(allSchemes);

      const allStudents = await offlineDb.students.toArray();
      const allAttendance = await offlineDb.attendance.toArray();

      const evaluatedFlags: any[] = [];

      for (const student of allStudents) {
        const studentAttendance = allAttendance.filter((a) => a.studentId === student.id);
        const evalResult = evaluateStudentAtRisk(student, studentAttendance, allSchemes);

        if (evalResult.isAtRisk) {
          for (const f of evalResult.flags) {
            evaluatedFlags.push({
              ...f,
              id: `${student.id}-${f.ruleId}`,
              studentId: student.id,
              studentName: student.name,
              grade: student.grade,
              gender: student.gender,
              resolvedAt: null,
            });
          }
        }
      }

      setFlags(evaluatedFlags);
    }
    loadData();
  }, []);

  const handleResolveFlag = async (flag: any) => {
    const updatedFlags = flags.filter((f) => f.id !== flag.id);
    setFlags(updatedFlags);

    const resolvedEntity: AtRiskFlag = {
      id: flag.id,
      schoolId: '018f679a-1111-7000-8000-000000000001',
      studentId: flag.studentId,
      ruleId: flag.ruleId,
      reason: flag.reason,
      attendancePercent: flag.attendancePercent,
      consecutiveAbsences: flag.consecutiveAbsences,
      suggestedSchemeIds: flag.suggestedSchemeIds,
      raisedAt: new Date().toISOString(),
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'Sunil Patil (Teacher)',
      note: followUpNote || 'Home visit completed. Parent confirmed re-enrollment.',
      version: 1,
      deviceId: syncManager.getDeviceId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    // Save to local Dexie database and queue outbox mutation atomically!
    await syncManager.mutate(
      'AtRiskFlag',
      offlineDb.atRiskFlags,
      resolvedEntity,
      'INSERT',
      1
    );

    setSelectedFlag(null);
    setFollowUpNote('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-36 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-rose-600" />
            <span>{t('teacher.atRiskTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {t('teacher.atRiskSubtitle')}
          </p>
        </div>

        <AudioHelpButton text="विशेष लक्ष व पाठपुराव्याची गरज असणारे विद्यार्थी. गैरहजेरीची कारणे व संबंधित शासकीय योजना." size="sm" />
      </div>

      {/* Flag List */}
      {flags.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 text-center shadow-sm space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-black text-slate-900 text-lg">No Students Currently At-Risk</h3>
          <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
            All students meet attendance and retention targets.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => {
            const isGirl = flag.gender === 'FEMALE';
            return (
              <div
                key={flag.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:border-rose-300 transition-all space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-extrabold text-[11px] uppercase tracking-wider">
                        {flag.ruleId === 'RULE_GIRL_CHILD_RETENTION'
                          ? 'Girl-Child Retention Alert'
                          : flag.ruleId === 'RULE_CONSECUTIVE_ABSENCE'
                          ? 'Consecutive Absence Alert'
                          : 'Low Attendance Alert'}
                      </span>
                      {isGirl && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-[11px]">
                          Girl Student
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-xl text-slate-900">
                      {flag.studentName}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">
                      Grade {flag.grade} • Current Attendance: {flag.attendancePercent}%
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedFlag(flag)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all min-h-[44px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('teacher.resolveAction')}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  {flag.reason}
                </p>

                {/* Suggested Support Schemes */}
                {flag.suggestedSchemeIds && flag.suggestedSchemeIds.length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider mb-2 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>{t('teacher.suggestedSchemes')}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {flag.suggestedSchemeIds.map((sId: string) => {
                        const s = schemes.find((sc) => sc.id === sId);
                        return (
                          <span
                            key={sId}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold"
                          >
                            {s ? s.name : 'Savitribai Phule Scholarship for Girls'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Follow-up Note & Resolve Modal */}
      {selectedFlag && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-orange-300 shadow-2xl animate-fade-in">
            <h3 className="font-extrabold text-xl text-amber-950 mb-1">
              Mark Follow-Up Completed
            </h3>
            <p className="text-xs text-amber-800 mb-4">
              Recording teacher intervention for <strong>{selectedFlag.studentName}</strong>
            </p>

            <textarea
              rows={4}
              placeholder="e.g. Conducted home visit. Parents agreed to send student regularly. Recommended bicycle scheme."
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
              className="w-full p-3 rounded-2xl border border-amber-300 font-medium text-sm text-amber-950 mb-4 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFlag(null)}
                className="flex-1 py-3 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveFlag(selectedFlag)}
                className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md min-h-[44px]"
              >
                Save & Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
