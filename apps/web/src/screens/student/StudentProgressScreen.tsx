import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const StudentProgressScreen: React.FC = () => {
  const { t } = useTranslation();
  const { currentStudent } = useAuthStore();
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    async function loadResults() {
      if (!currentStudent) return;
      const local = await offlineDb.quizResults
        .where('studentId')
        .equals(currentStudent.id)
        .toArray();

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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-28">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600" />
            {t('student.myProgress')}
          </h2>
          <p className="text-xs sm:text-sm text-amber-800 font-medium mt-1">
            Learning achievements, badges, and competency milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintSlip}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-all min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Progress Slip</span>
          </button>
          <AudioHelpButton text="आपली शिकण्याची प्रगती आणि मिळवलेले तारे येथे पहा." size="sm" />
        </div>
      </div>

      {/* Hero Badge Card */}
      <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-inner">
            ⭐
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Learning Mastery
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">{studentName}</h3>
            <p className="text-xs text-indigo-100 font-medium mt-0.5">
              Grade {currentStudent?.grade || 3} • PRN: {currentStudent?.prn || 'PRN1001'}
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[140px]">
          <span className="text-xs font-bold text-indigo-200 uppercase">Current Level</span>
          <div className="text-3xl font-black text-amber-300 mt-0.5">Level {assessedLevel}</div>
          <span className="text-[11px] text-indigo-100 font-medium">TaRL Certified</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm text-center">
          <span className="text-xs uppercase font-extrabold text-amber-800">Quizzes Attempted</span>
          <div className="text-3xl font-black text-amber-950 mt-1">{results.length}</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm text-center">
          <span className="text-xs uppercase font-extrabold text-amber-800">Total Points</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{totalScore} pts</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm text-center">
          <span className="text-xs uppercase font-extrabold text-amber-800">Stars Earned</span>
          <div className="text-3xl font-black text-amber-500 mt-1 flex items-center justify-center gap-1">
            <span>{results.length * 3}</span>
            <Star className="w-6 h-6 fill-amber-400 text-amber-400 inline" />
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-sm">
        <h4 className="font-extrabold text-base text-amber-950 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-600" />
          Completed Practice Quizzes
        </h4>

        {results.length === 0 ? (
          <p className="text-xs text-amber-800 italic">No practice quizzes completed yet. Complete your first lesson to earn stars!</p>
        ) : (
          <div className="space-y-3">
            {results.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-3"
              >
                <div>
                  <h5 className="font-extrabold text-amber-950 text-sm">Language & Math Practice</h5>
                  <p className="text-[11px] text-amber-700 font-medium">
                    {new Date(res.submittedAt).toLocaleDateString()} • {res.score} / {res.maxScore} marks
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-amber-500 font-black text-sm">
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
