import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { syncManager } from '../../services/sync-manager.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { gradeQuiz, generateUuidV7, Quiz, QuizResult } from '@vidya-setu/shared';
import { StarRating } from '../../components/StarRating.js';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Home,
  Sparkles,
  Clock,
  Award,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const QuizRunnerScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentStudent } = useAuthStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
  const [completedResult, setCompletedResult] = useState<any | null>(null);
  const [startTime] = useState<string>(new Date().toISOString());
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Timer loop
  useEffect(() => {
    if (completedResult) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [completedResult]);

  useEffect(() => {
    async function loadQuiz() {
      if (!id) return;
      let q = await offlineDb.quizzes.get(id);
      if (!q) {
        // Fallback default quiz
        q = {
          id: id || 'quiz-default',
          schoolId: 'global',
          lessonId: '018f679a-ls01-7000-8000-000000000001',
          title: 'Daily Practice Problem (DPP 01) • Phonics & Words',
          subject: 'LANGUAGE',
          grade: 1,
          totalMarks: 10,
          passingMarks: 6,
          version: 1,
          deviceId: 'dev-tablet-01',
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
              prompt: 'The letter "म" makes the sound /ma/ as in "मका" (Corn).',
              options: [
                { id: 't_opt', text: 'True (होय - बरोबर)' },
                { id: 'f_opt', text: 'False (नाही - चूक)' },
              ],
              correctOptionId: 't_opt',
              explanation: 'Yes, "म" represents the /ma/ sound.',
              level: 1,
              marks: 5,
            },
          ],
        };
        await offlineDb.quizzes.put(q);
      }
      setQuiz(q);
    }
    loadQuiz();
  }, [id]);

  if (!quiz) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Loading test paper...</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const selectedOptionId = answersMap[currentQuestion.id] || null;

  const handleSelectOption = (optionId: string) => {
    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNextOrFinish = () => {
    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const formattedAnswers = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answersMap[q.id] || '',
      timeSpentSec: Math.max(5, Math.floor(secondsElapsed / quiz.questions.length)),
    }));

    const grading = gradeQuiz(quiz, formattedAnswers);
    const resultId = generateUuidV7();
    const studentId = currentStudent ? currentStudent.id : '018f679a-st01-7000-8000-000000000001';

    const quizResultEntity: QuizResult = {
      id: resultId,
      schoolId: currentStudent?.schoolId || 'school-01',
      studentId,
      quizId: quiz.id,
      mode: 'QUIZ',
      answers: grading.answers,
      score: grading.score,
      maxScore: grading.maxScore,
      assessedLevel: currentStudent?.assessedLevel || 1,
      startedAt: startTime,
      submittedAt: new Date().toISOString(),
      version: 1,
      deviceId: syncManager.getDeviceId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await syncManager.mutate('QuizResult', offlineDb.quizResults, quizResultEntity, 'INSERT', 1);
    setCompletedResult(grading);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Test Series Result Card
  if (completedResult) {
    const pct = completedResult.percentage;
    const isPassed = pct >= 60;

    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-28 text-center animate-fade-in space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          {/* Header Badge */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">
              चाचणी निकाल (Test Series Result)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {isPassed ? 'Shabash! Test Completed 🎉' : 'Test Submitted! Keep Practicing 💪'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {quiz.title} • Time Taken: {formatTimer(secondsElapsed)}
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center">
            <StarRating rating={completedResult.starRating} size="lg" />
          </div>

          {/* Detailed Score Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Score</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                {completedResult.score} / {completedResult.maxScore}
              </div>
            </div>

            <div className="border-x border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Accuracy</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-0.5">
                {pct}%
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
              <div className={`text-base sm:text-lg font-black mt-1 ${isPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isPassed ? 'QUALIFIED' : 'NEEDS PRACTICE'}
              </div>
            </div>
          </div>

          {/* Solution & Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/student/quizzes')}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-all min-h-[48px]"
            >
              <FileCheck className="w-5 h-5" />
              <span>{t('dpp.review')} & {t('dpp.allTests')}</span>
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setAnswersMap({});
                  setCompletedResult(null);
                  setSecondsElapsed(0);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-Attempt DPP</span>
              </button>

              <button
                onClick={() => navigate('/student/home')}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all min-h-[44px]"
              >
                <Home className="w-4 h-4" />
                <span>{t('videos.backToClassroom')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test Series Question Stage
  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 pb-28 space-y-4">
      {/* Top Test Bar */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-black">
            {t('category.tests')} • {quiz.subject}
          </span>
          <h2 className="text-sm sm:text-base font-black truncate max-w-sm">
            {quiz.title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Time: {formatTimer(secondsElapsed)}</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit this test?')) {
                navigate('/student/home');
              }
            }}
            className="text-xs text-slate-400 hover:text-white font-bold"
          >
            Exit Test
          </button>
        </div>
      </div>

      {/* Question Palette Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">Questions:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {quiz.questions.map((q, idx) => {
              const isAnswered = !!answersMap[q.id];
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-xl font-mono text-xs font-black transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                      : isAnswered
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Answered
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            Unvisited
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-xs font-bold text-slate-500">
            +{currentQuestion.marks} Marks • 0 Neg.
          </span>
        </div>

        {/* Prompt */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-relaxed">
            {currentQuestion.prompt}
          </h3>
          <AudioHelpButton text={currentQuestion.prompt} size="sm" />
        </div>

        {/* Options Grid */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((opt, oIdx) => {
            const isSelected = selectedOptionId === opt.id;
            const letter = String.fromCharCode(65 + oIdx); // A, B, C, D

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 shadow-md ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {letter}
                  </div>
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {opt.text}
                  </span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              const updated = { ...answersMap };
              delete updated[currentQuestion.id];
              setAnswersMap(updated);
            }}
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            Clear Response
          </button>

          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs min-h-[44px]"
              >
                Previous
              </button>
            )}

            <button
              onClick={handleNextOrFinish}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all min-h-[44px]"
            >
              <span>{currentIndex + 1 === quiz.questions.length ? 'Submit Test Paper' : 'Save & Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
