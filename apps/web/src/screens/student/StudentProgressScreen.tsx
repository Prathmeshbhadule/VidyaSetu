import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { QuizResult } from '@vidya-setu/shared';
import { StarRating } from '../../components/StarRating.js';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  Award,
  Sparkles,
  Star,
  Printer,
  BookOpen,
  CheckCircle2,
  Calendar,
  ArrowRight,
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
  const totalMax = results.reduce((acc, r) => acc + r.maxScore, 0);
  const studentName = currentStudent ? currentStudent.name : 'Student';
  const assessedLevel = currentStudent ? currentStudent.assessedLevel : 2;

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-36">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <Award className="w-7 h-7 text-blue-600" />
            {t('student.myProgress')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Learning achievements, stars, badges, and foundational competency milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintSlip}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Progress Slip</span>
          </button>
          <AudioHelpButton text="आपली शिकण्याची प्रगती आणि मिळवलेले तारे येथे पहा." size="sm" />
        </div>
      </div>

      {/* Hero Badge Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-6 flex flex-wrap items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-4xl shadow-inner">
            ⭐
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Learning Mastery • Vidya Setu
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">{studentName}</h3>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Grade {currentStudent?.grade || 3} • PRN: {currentStudent?.prn || 'PRN1001'}
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 text-center min-w-[140px]">
          <span className="text-xs font-bold text-slate-400 uppercase">Current Level</span>
          <div className="text-3xl font-black text-amber-400 mt-0.5">Level {assessedLevel}</div>
          <span className="text-[11px] text-emerald-400 font-bold">TaRL Certified</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm text-center">
          <span className="text-[11px] uppercase font-bold text-slate-500">Quizzes Attempted</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{results.length}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm text-center">
          <span className="text-[11px] uppercase font-bold text-slate-500">Total Points</span>
          <div className="text-3xl font-black text-blue-600 mt-1">{totalScore} pts</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm text-center">
          <span className="text-[11px] uppercase font-bold text-slate-500">Stars Earned</span>
          <div className="text-3xl font-black text-amber-500 mt-1 flex items-center justify-center gap-1.5">
            <span>{results.length * 3}</span>
            <Star className="w-6 h-6 fill-amber-400 text-amber-400 inline" />
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Completed Practice Quizzes
          </h4>

          <button
            onClick={() => navigate('/student/quizzes')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-all"
          >
            <span>Detailed Results & Answers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {results.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No practice quizzes completed yet. Complete your first lesson to earn stars!</p>
        ) : (
          <div className="space-y-3">
            {results.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
              >
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Language & Math Practice</h5>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {new Date(res.submittedAt).toLocaleDateString()} • {res.score} / {res.maxScore} marks
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                  <span>3</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
