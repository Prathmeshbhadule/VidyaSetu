import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { syncManager } from '../../services/sync-manager.js';
import { computeTaRLGroups, StudentProfile, TaRLGroup } from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  Layers,
  Sparkles,
  BookOpen,
  Clock,
  Package,
  Edit2,
  Check,
  ChevronDown,
} from 'lucide-react';

export const TeacherTaRLScreen: React.FC = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [activeLevel, setActiveLevel] = useState<number>(1);

  useEffect(() => {
    async function loadStudents() {
      const all = await offlineDb.students.toArray();
      setStudents(all);
    }
    loadStudents();
  }, []);

  const groups: TaRLGroup[] = computeTaRLGroups(students, overrides);
  const currentGroup = groups.find((g) => g.level === activeLevel) || groups[0];

  const handleOverrideLevel = async (student: StudentProfile, newLevel: number) => {
    const nextOverrides = { ...overrides, [student.id]: newLevel };
    setOverrides(nextOverrides);

    // Persist updated level to local Dexie and sync outbox
    const updated = { ...student, assessedLevel: newLevel, updatedAt: new Date().toISOString() };
    await syncManager.mutate('StudentProfile', offlineDb.students, updated, 'UPDATE', 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-28">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
            <Layers className="w-7 h-7 text-orange-600" />
            {t('teacher.tarlGrouping')}
          </h2>
          <p className="text-xs sm:text-sm text-amber-800 font-medium mt-1">
            Grouping by learning competence rather than chronological age (Pratham TaRL)
          </p>
        </div>

        <AudioHelpButton text="योग्य स्तरावर शिक्षण (TaRL) गट. विद्यार्थ्यांच्या क्षमतेनुसार ५ स्तरांचे गट व उपक्रम." size="sm" />
      </div>

      {/* Level Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {groups.map((g) => (
          <button
            key={g.level}
            onClick={() => setActiveLevel(g.level)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap min-h-[44px] ${
              activeLevel === g.level
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 scale-105'
                : 'bg-white text-amber-950 border border-amber-200 hover:bg-amber-100/60'
            }`}
          >
            <span>Level {g.level}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeLevel === g.level ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {g.students.length}
            </span>
          </button>
        ))}
      </div>

      {/* Active Group Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-md mb-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-amber-950">
              {currentGroup.groupName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium">
              {currentGroup.description}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-black text-xs">
            {currentGroup.students.length} Students
          </span>
        </div>

        {/* Student Badges */}
        <div className="mb-8">
          <h4 className="text-xs font-extrabold uppercase text-amber-800 tracking-wider mb-3">
            Assigned Students
          </h4>
          {currentGroup.students.length === 0 ? (
            <p className="text-xs text-amber-700 italic">No students currently at this level.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentGroup.students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50/50"
                >
                  <div>
                    <span className="font-bold text-sm text-amber-950">{student.name}</span>
                    <span className="text-[11px] text-amber-700 block">Grade {student.grade} • PRN: {student.prn}</span>
                  </div>

                  {/* Quick Teacher Override Selector */}
                  <select
                    value={student.assessedLevel}
                    onChange={(e) => handleOverrideLevel(student, parseInt(e.target.value, 10))}
                    className="text-xs font-bold border border-amber-300 rounded-lg p-1 bg-white text-amber-950"
                    aria-label="Override level"
                  >
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <option key={lvl} value={lvl}>Move to L{lvl}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Pedagogical Activities */}
        <div>
          <h4 className="text-xs font-extrabold uppercase text-amber-800 tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Recommended Pedagogical Activities for Level {currentGroup.level}
          </h4>

          <div className="space-y-3">
            {currentGroup.recommendedActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl border-2 border-orange-100 bg-orange-50/50 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-extrabold text-base text-amber-950">{act.title}</h5>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-200 text-orange-900 font-extrabold text-[11px]">
                    {act.subject}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {act.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-amber-900 pt-1">
                  <span className="flex items-center gap-1 text-amber-700">
                    <Clock className="w-3.5 h-3.5" />
                    ~{act.durationMin} minutes
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <Package className="w-3.5 h-3.5" />
                    Materials: {act.materialsNeeded.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
