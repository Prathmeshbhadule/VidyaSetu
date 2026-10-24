import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { Quiz, QuizResult } from '@vidya-setu/shared';
import { StarRating } from '../../components/StarRating.js';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Calendar,
  Printer,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Star,
  Check,
} from 'lucide-react';

export const QuizResultsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStudent } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'results' | 'quizzes'>('results');
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      // 1. Load Quizzes
      let allQuizzes = await offlineDb.quizzes.toArray();
      if (allQuizzes.length === 0) {
        allQuizzes = [
          {
            id: 'quiz-lang-01',
            schoolId: 'global',
            lessonId: '018f679a-ls01-7000-8000-000000000001',
            title: 'Alphabet & Phonics Practice (वर्णमाला व ध्वनी चाचणी)',
            subject: 'LANGUAGE',
            grade: 1,
            totalMarks: 10,
            passingMarks: 6,
            version: 1,
            deviceId: 'hub',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            questions: [
              {
                id: 'q1',
                type: 'MCQ',
                prompt: 'Which word starts with the sound "क"? (कोणता शब्द "क" ने सुरू होतो?)',
                options: [
                  { id: 'opt1', text: 'कमळ (Kamal / Lotus)' },
                  { id: 'opt2', text: 'अननस (Ananas / Pineapple)' },
                  { id: 'opt3', text: 'घर (Ghar / House)' },
                ],
                correctOptionId: 'opt1',
                explanation: '"कमळ" starts with the letter "क".',
                level: 1,
                marks: 5,
              },
              {
                id: 'q2',
                type: 'TRUE_FALSE',
                prompt: 'The letter "म" makes the sound /ma/ as in "मका".',
                options: [
                  { id: 't_opt', text: 'True (होय)' },
                  { id: 'f_opt', text: 'False (नाही)' },
                ],
                correctOptionId: 't_opt',
                explanation: 'Yes, "म" makes the sound /ma/.',
                level: 1,
                marks: 5,
              },
            ],
          },
          {
            id: 'quiz-math-01',
            schoolId: 'global',
            lessonId: '018f679a-ls02-7000-8000-000000000002',
            title: 'Numbers and Counting 1 to 20 (अंक आणि मोजणी चाचणी)',
            subject: 'MATH',
            grade: 2,
            totalMarks: 10,
            passingMarks: 6,
            version: 1,
            deviceId: 'hub',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            questions: [
              {
                id: 'mq1',
                type: 'MCQ',
                prompt: 'Count the mangoes: 5 on the tree + 2 on the ground = ?',
                options: [
                  { id: 'm1', text: '6' },
                  { id: 'm2', text: '7 (Seven)' },
                  { id: 'm3', text: '8' },
                ],
                correctOptionId: 'm2',
                explanation: '5 + 2 = 7.',
                level: 2,
                marks: 5,
              },
              {
                id: 'mq2',
                type: 'MCQ',
                prompt: 'Which number comes immediately after 14? (१४ नंतर कोणती संख्या येते?)',
                options: [
                  { id: 'm4', text: '13' },
                  { id: 'm5', text: '15 (Fifteen)' },
                  { id: 'm6', text: '16' },
                ],
                correctOptionId: 'm5',
                explanation: 'After 14 comes 15.',
                level: 2,
                marks: 5,
              },
            ],
          },
          {
            id: 'quiz-sci-01',
            schoolId: 'global',
            lessonId: '018f679a-ls03-7000-8000-000000000003',
            title: 'Plants & Trees Science Quiz (वनस्पती व झाडे चाचणी)',
            subject: 'SCIENCE',
            grade: 3,
            totalMarks: 10,
            passingMarks: 6,
            version: 1,
            deviceId: 'hub',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            questions: [
              {
                id: 'sq1',
                type: 'MCQ',
                prompt: 'Which part of a plant absorbs water from the soil? (मुळांचे कार्य काय?)',
                options: [
                  { id: 's1', text: 'Roots (मुळे)' },
                  { id: 's2', text: 'Leaves (पाने)' },
                  { id: 's3', text: 'Flower (फूल)' },
                ],
                correctOptionId: 's1',
                explanation: 'Roots absorb water and nutrients from the soil.',
                level: 3,
                marks: 5,
              },
              {
                id: 'sq2',
                type: 'TRUE_FALSE',
                prompt: 'Green leaves make food for the plant using sunlight.',
                options: [
                  { id: 'st', text: 'True (होय)' },
                  { id: 'sf', text: 'False (नाही)' },
                ],
                correctOptionId: 'st',
                explanation: 'Photosynthesis occurs in green leaves with sunlight.',
                level: 3,
                marks: 5,
              },
            ],
          },
        ];
        await offlineDb.quizzes.bulkPut(allQuizzes);
      }
      setQuizzes(allQuizzes);

      // 2. Load Quiz Results strictly for active student
      if (currentStudent) {
        const studentResults = await offlineDb.quizResults
          .where('studentId')
          .equals(currentStudent.id)
          .toArray();

        setResults(studentResults);
        if (studentResults.length > 0) {
          setExpandedResultId(studentResults[0].id);
        }
      }
    }
    loadData();
  }, [currentStudent]);

  const totalScore = results.reduce((acc, r) => acc + r.score, 0);
  const totalMax = results.reduce((acc, r) => acc + r.maxScore, 0);
  const overallPercentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  const studentName = currentStudent ? currentStudent.name : 'Aarav Patil';
  const assessedLevel = currentStudent ? currentStudent.assessedLevel : 2;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-36 space-y-5">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/student/home')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all mb-2 min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('videos.backToClassroom')}</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-blue-600" />
            <span>{t('dpp.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {t('dpp.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Scorecard</span>
          </button>
          <AudioHelpButton text="आपले चाचणी निकाल आणि मिळालेले गुण येथे पहा." size="sm" />
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 bottom-0 opacity-15 translate-x-6 translate-y-6 pointer-events-none">
          <Sparkles className="w-48 h-48" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-4xl shadow-inner">
              ⭐
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Official Student Scorecard • {t('batch.targetBatch')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black">{studentName}</h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                TaRL {t('common.level')} {assessedLevel} • {t('streak.accuracyTitle')}: {overallPercentage}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-700 text-center min-w-[100px]">
              <span className="text-[11px] font-bold text-slate-400 uppercase">DPP Tests</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5">
                {results.length}
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-700 text-center min-w-[100px]">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Points</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                {totalScore} / {totalMax}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('results')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all min-h-[44px] flex items-center gap-2 ${
            activeTab === 'results'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{t('category.tests')} ({results.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all min-h-[44px] flex items-center gap-2 ${
            activeTab === 'quizzes'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('dpp.allTests')} ({quizzes.length})</span>
        </button>
      </div>

      {/* Tab 1: Quiz Results List with Detailed Question Review */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border-2 border-amber-200 text-center">
              <p className="text-amber-800 text-sm">No quizzes completed yet.</p>
              <button
                onClick={() => setActiveTab('quizzes')}
                className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs shadow-md"
              >
                {t('dpp.startDpp')}
              </button>
            </div>
          ) : (
            results.map((result, idx) => {
              const matchedQuiz = quizzes.find((q) => q.id === result.quizId);
              const isExpanded = expandedResultId === result.id;
              const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
              const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;

              return (
                <div
                  key={result.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-blue-400"
                >
                  {/* Card Header / Summary */}
                  <div
                    onClick={() => setExpandedResultId(isExpanded ? null : result.id)}
                    className="p-5 sm:p-6 cursor-pointer flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-50/50 to-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-black text-lg flex items-center justify-center min-w-[48px] border border-blue-200">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase">
                            {matchedQuiz?.subject || 'DPP PRACTICE'}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(result.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-base sm:text-lg">
                          {matchedQuiz?.title || 'Comprehensive Practice Quiz'}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-black text-blue-600">
                          {result.score} / {result.maxScore}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-amber-400 mt-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detailed Question Breakdown */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-amber-100 bg-amber-50/30 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                        <h5 className="font-extrabold text-amber-950 text-xs sm:text-sm uppercase tracking-wider">
                          Question-by-Question Review (तपशीलवार उत्तरे)
                        </h5>
                        <span className="text-xs font-bold text-orange-700">
                          {pct}% Accuracy
                        </span>
                      </div>

                      {result.answers.map((ans, qIdx) => {
                        const qObj = matchedQuiz?.questions.find((q) => q.id === ans.questionId);
                        const isCorrect = ans.isCorrect;

                        return (
                          <div
                            key={ans.questionId}
                            className={`p-4 rounded-2xl border-2 ${
                              isCorrect
                                ? 'bg-emerald-50/60 border-emerald-300'
                                : 'bg-rose-50/60 border-rose-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white mt-0.5 ${
                                    isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                                  }`}
                                >
                                  {isCorrect ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '✕'}
                                </div>
                                <div>
                                  <p className="font-extrabold text-amber-950 text-sm">
                                    Q{qIdx + 1}. {qObj?.prompt || `Question ${qIdx + 1}`}
                                  </p>
                                  <p className="text-xs font-medium text-slate-700 mt-1">
                                    Answered:{' '}
                                    <span className="font-bold">
                                      {qObj?.options.find((o) => o.id === ans.selectedOptionId)?.text || ans.selectedOptionId}
                                    </span>
                                  </p>
                                  {qObj?.explanation && (
                                    <p className="text-[11px] font-semibold text-emerald-800 mt-1">
                                      💡 Note: {qObj.explanation}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <span
                                className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                  isCorrect ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                                }`}
                              >
                                +{ans.marksAwarded} pts
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/student/quizzes/${result.quizId}`)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry This Quiz</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Available Practice Quizzes */}
      {activeTab === 'quizzes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-3xl p-6 border-2 border-amber-200 hover:border-orange-500 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-extrabold text-[11px] uppercase">
                    {quiz.subject}
                  </span>
                  <span className="text-xs font-bold text-amber-700">
                    Grade {quiz.grade} • {quiz.questions.length} Questions
                  </span>
                </div>

                <h4 className="font-extrabold text-amber-950 text-lg leading-snug line-clamp-2">
                  {quiz.title}
                </h4>

                <p className="text-xs text-amber-800 mt-2 font-medium">
                  Passing marks: {quiz.passingMarks} / {quiz.totalMarks} marks
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-amber-100">
                <span className="text-xs font-bold text-emerald-700">
                  ⭐⭐⭐ 3 Stars Reward
                </span>

                <button
                  onClick={() => navigate(`/student/quizzes/${quiz.id}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all min-h-[40px]"
                >
                  <span>Start Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guaranteed Bottom Buffer */}
      <div className="h-10" />
    </div>
  );
};
