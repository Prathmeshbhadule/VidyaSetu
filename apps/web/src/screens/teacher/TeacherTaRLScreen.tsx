import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { offlineDb } from '../../db/offline-db.js';
import { syncManager } from '../../services/sync-manager.js';
import { computeTaRLGroups, StudentProfile, TaRLGroup } from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  Layers,
  Sparkles,
  Clock,
  Package,
  Users,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
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

  const chartData = groups.map((g) => ({
    name: `L${g.level}`,
    full: g.groupName,
    count: g.students.length,
    level: g.level,
  }));

  const handleOverrideLevel = async (student: StudentProfile, newLevel: number) => {
    const nextOverrides = { ...overrides, [student.id]: newLevel };
    setOverrides(nextOverrides);

    const updated = { ...student, assessedLevel: newLevel, updatedAt: new Date().toISOString() };
    await syncManager.mutate('StudentProfile', offlineDb.students, updated, 'UPDATE', 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-36 animate-chart-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Pratham TaRL Methodology</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('teacher.tarlGrouping', 'Teaching at the Right Level')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Competency-based grouping for multi-grade rural classrooms (Levels 1 to 5)
          </p>
        </div>

        <AudioHelpButton text="योग्य स्तरावर शिक्षण (TaRL) गट. विद्यार्थ्यांच्या क्षमतेनुसार ५ स्तरांचे गट व उपक्रम." size="sm" />
      </div>

      {/* Competency Overview Chart: Animated Recharts */}
      <div className="apple-card rounded-[28px] p-6 sm:p-7 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Classroom Competency Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any bar to instantly view that learning group's assigned students & activities
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {students.length} Students Total
          </span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="tarlActiveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0071e3" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.85} />
                </linearGradient>
                <linearGradient id="tarlInactiveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#64748b" stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="apple-glass rounded-[14px] px-3 py-1.5 shadow-lg text-xs border border-black/10 dark:border-white/10">
                        <span className="font-bold text-slate-900 dark:text-white block">{data.full}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{data.count} Students</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                radius={[8, 8, 3, 3]}
                onClick={(entry: any) => setActiveLevel(entry.level)}
                className="cursor-pointer"
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.level}`}
                    fill={entry.level === activeLevel ? 'url(#tarlActiveGrad)' : 'url(#tarlInactiveGrad)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Apple Segmented Level Pill Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 no-scrollbar">
        {groups.map((g) => (
          <button
            key={g.level}
            onClick={() => setActiveLevel(g.level)}
            className={`apple-press px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap min-h-[42px] border ${
              activeLevel === g.level
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <span>Level {g.level}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeLevel === g.level
                  ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {g.students.length}
            </span>
          </button>
        ))}
      </div>

      {/* Active Group Card */}
      <div className="apple-card rounded-[28px] p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-apple-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {currentGroup.groupName}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
              {currentGroup.description}
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs whitespace-nowrap">
            {currentGroup.students.length} Students
          </span>
        </div>

        {/* Assigned Students */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Assigned Students at Level {currentGroup.level}
          </h3>
          {currentGroup.students.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No students currently assigned to this competence tier.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentGroup.students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3.5 rounded-[18px] bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/30 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white block truncate">
                      {student.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Grade {student.grade} • PRN: {student.prn}
                    </span>
                  </div>

                  <select
                    value={student.assessedLevel}
                    onChange={(e) => handleOverrideLevel(student, parseInt(e.target.value, 10))}
                    className="text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Override level for ${student.name}`}
                  >
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <option key={lvl} value={lvl}>Tier L{lvl}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pedagogical Activities */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Curated Interventions & Classroom Drills
          </h3>

          <div className="space-y-3">
            {currentGroup.recommendedActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 sm:p-5 rounded-[20px] bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {act.title}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                    {act.subject}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {act.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{act.durationMin} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    {act.materialsNeeded.join(', ')}
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
