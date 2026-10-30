import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { offlineDb } from '../../db/offline-db.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { QuizResult } from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  Award,
  Sparkles,
  Star,
  Printer,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Target,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const StudentProgressScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStudent } = useAuthStore();
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    async function loadResults() {
      const studentId = currentStudent ? currentStudent.id : '018f679a-st01-7000-8000-000000000001';
      let local = await offlineDb.quizResults
        .where('studentId')
        .equals(studentId)
        .toArray();

      if (local.length === 0) {
        local = await offlineDb.quizResults.toArray();
      }

      setResults(local);
    }
    loadResults();
  }, [currentStudent]);

  const totalScore = results.reduce((acc, r) => acc + r.score, 0);
  const studentName = currentStudent ? currentStudent.name : 'Aarav Patil';
  const assessedLevel = currentStudent ? currentStudent.assessedLevel : 2;

  // Build trajectory data for animated chart
  const progressHistory = results.length > 0
    ? results.map((r, index) => ({
        quiz: `Quiz ${index + 1}`,
        score: Math.round((r.score / Math.max(r.maxScore, 1)) * 100),
        raw: `${r.score}/${r.maxScore}`,
      }))
    : [
        { quiz: 'Quiz 1', score: 60, raw: '3/5' },
        { quiz: 'Quiz 2', score: 80, raw: '4/5' },
        { quiz: 'Quiz 3', score: 85, raw: '17/20' },
        { quiz: 'Quiz 4', score: 95, raw: '5/5' },
        { quiz: 'Latest', score: 100, raw: '5/5' },
      ];

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-36 animate-chart-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Learning Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('student.myProgress', 'My Learning Trajectory')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Foundational literacy mastery, competency checkpoints, and star badges
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrintSlip}
            className="apple-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Student Slip</span>
          </button>
          <AudioHelpButton text="आपली शिकण्याची प्रगती आणि मिळवलेले तारे येथे पहा." size="sm" />
        </div>
      </div>

      {/* Apple-style Hero Achievement Card */}
      <div className="apple-card rounded-[28px] p-6 sm:p-8 mb-6 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shadow-inner">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-300">
                Pratham TaRL Certified Scholar
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">{studentName}</h2>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Grade {currentStudent?.grade || 3} • PRN: {currentStudent?.prn || 'PRN20261001'}
              </p>
            </div>
          </div>

          <div className="apple-glass rounded-[20px] p-4 text-center min-w-[130px] self-start sm:self-auto">
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block">Competency</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5">Level {assessedLevel}</div>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">Fluent Reading</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="apple-card rounded-[22px] p-4 sm:p-5 text-center">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Quizzes</span>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {results.length || 5}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Completed</span>
        </div>

        <div className="apple-card rounded-[22px] p-4 sm:p-5 text-center">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Total Score</span>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 mt-1">
            {totalScore || 34}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Points Earned</span>
        </div>

        <div className="apple-card rounded-[22px] p-4 sm:p-5 text-center">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Stars</span>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-500 mt-1 flex items-center justify-center gap-1">
            <span>{(results.length || 5) * 3}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Mastery Badges</span>
        </div>
      </div>

      {/* Animated Mastery Trajectory Chart */}
      <div className="apple-card rounded-[28px] p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Score Trajectory & Mastery Growth
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                +35% Progress
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Practice test performance percentage over consecutive learning milestones
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressHistory} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="studentTrajectoryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0071e3" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0071e3" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis
                dataKey="quiz"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="apple-glass rounded-[16px] px-3.5 py-2 shadow-xl border border-black/10 dark:border-white/10 text-xs">
                        <p className="font-semibold text-slate-900 dark:text-white">{data.quiz}</p>
                        <p className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                          Score: {data.score}% ({data.raw})
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#0071e3"
                strokeWidth={3}
                fill="url(#studentTrajectoryGrad)"
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completed Practice Quizzes List */}
      <div className="apple-card rounded-[28px] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Completed Assessment Checkpoints
          </h4>

          <button
            onClick={() => navigate('/student/quizzes')}
            className="apple-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-xs transition-all"
          >
            <span>Review All Tests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {(results.length > 0 ? results : [
            { id: '1', score: 5, maxScore: 5, submittedAt: new Date().toISOString() },
            { id: '2', score: 4, maxScore: 5, submittedAt: new Date(Date.now() - 86400000).toISOString() },
          ]).map((res: any, idx: number) => (
            <div
              key={res.id || idx}
              className="p-4 rounded-[20px] bg-slate-50/75 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-colors"
            >
              <div>
                <h5 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Foundational Literacy & Numeracy Check #{idx + 1}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                  {new Date(res.submittedAt).toLocaleDateString()} • {res.score} of {res.maxScore} marks
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs px-2.5 py-1 rounded-full bg-amber-500/10">
                <span>3 Stars</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
