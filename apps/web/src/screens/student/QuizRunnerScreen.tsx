import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { syncManager } from '../../services/sync-manager.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { gradeQuiz, generateUuidV7, Quiz, QuizResult } from '@vidya-setu/shared';
import { StarRating } from '../../components/StarRating.js';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import { Check, X, ArrowRight, RotateCcw, Home, Sparkles } from 'lucide-react';

export const QuizRunnerScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentStudent } = useAuthStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Array<{ questionId: string; selectedOptionId: string; timeSpentSec: number }>
  >([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [completedResult, setCompletedResult] = useState<any | null>(null);
  const [startTime] = useState<string>(new Date().toISOString());

  useEffect(() => {
    async function loadQuiz() {
      if (!id) return;
      const q = await offlineDb.quizzes.get(id);
      if (q) {
        setQuiz(q);
      } else {
        // Fallback default quiz
        const fallbackQuiz: Quiz = {
          id: id || 'quiz-default',
          schoolId: 'global',
          lessonId: '018f679a-ls01-7000-8000-000000000001',
          title: 'Letters & Phonics Quiz',
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
              prompt: 'Which word starts with the sound "क"?',
              options: [
                { id: 'opt1', text: 'कमळ (Kamal)' },
                { id: 'opt2', text: 'अननस (Ananas)' },
                { id: 'opt3', text: 'घर (Ghar)' },
              ],
              correctOptionId: 'opt1',
              level: 1,
              marks: 5,
            },
            {
              id: 'q2',
              type: 'TRUE_FALSE',
              prompt: 'The letter "म" makes the sound /ma/.',
              options: [
                { id: 't_opt', text: 'True (होय)' },
                { id: 'f_opt', text: 'False (नाही)' },
              ],
              correctOptionId: 't_opt',
              level: 1,
              marks: 5,
            },
          ],
        };
        setQuiz(fallbackQuiz);
      }
    }
    loadQuiz();
  }, [id]);

  if (!quiz) {
    return <div className="p-6 text-center text-amber-800">Loading quiz...</div>;
  }

  const currentQuestion = quiz.questions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    if (isAnswerRevealed) return;
    setSelectedOption(optionId);
    setIsAnswerRevealed(true);

    const isCorrect = optionId === currentQuestion.correctOptionId;
    const answerEntry = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      timeSpentSec: 5,
    };

    const nextAnswers = [...selectedAnswers, answerEntry];
    setSelectedAnswers(nextAnswers);

    // After 1.2s delay, advance or finish
    setTimeout(() => {
      if (currentIndex + 1 < quiz.questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsAnswerRevealed(false);
      } else {
        finishQuiz(nextAnswers);
      }
    }, 1200);
  };

  const finishQuiz = async (answers: typeof selectedAnswers) => {
    const grading = gradeQuiz(quiz, answers);
    const resultId = generateUuidV7();
    const studentId = currentStudent ? currentStudent.id : 'stu-guest';

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

    // Save to local Dexie database and enqueue mutation into Outbox atomically!
    await syncManager.mutate('QuizResult', offlineDb.quizResults, quizResultEntity, 'INSERT', 1);

    setCompletedResult(grading);
  };

  // Completion Result Card
  if (completedResult) {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 pb-28 text-center animate-fade-in">
        <div className="bg-white rounded-3xl p-8 border-2 border-amber-300 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 animate-bounce">
            <Sparkles className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 mb-1">
            {t('student.congratulations')}
          </h2>
          <p className="text-sm font-semibold text-amber-800 mb-4">
            {quiz.title} Complete!
          </p>

          <StarRating rating={completedResult.starRating} size="lg" />

          <div className="my-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-xs uppercase font-extrabold text-amber-800 tracking-wider">
              Score
            </span>
            <div className="text-3xl font-black text-amber-950 mt-1">
              {completedResult.score} / {completedResult.maxScore}
            </div>
            <p className="text-xs font-bold text-orange-600 mt-1">
              {completedResult.percentage}% Accuracy
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSelectedAnswers([]);
                setSelectedOption(null);
                setIsAnswerRevealed(false);
                setCompletedResult(null);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-100 text-amber-900 font-bold text-sm hover:bg-amber-200 transition-all min-h-[48px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry</span>
            </button>

            <button
              onClick={() => navigate('/student/home')}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-600 text-white font-black text-sm shadow-md hover:bg-orange-700 transition-all min-h-[48px]"
            >
              <Home className="w-4 h-4" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-28">
      {/* Progress Counter */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
          Question {currentIndex + 1} of {quiz.questions.length}
        </span>
        <div className="flex items-center gap-2">
          <AudioHelpButton text={currentQuestion.prompt} size="sm" />
        </div>
      </div>

      <div className="w-full bg-amber-200/60 rounded-full h-2 mb-6">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-md">
        <h3 className="text-xl sm:text-2xl font-black text-amber-950 mb-6 leading-relaxed">
          {currentQuestion.prompt}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrect = opt.id === currentQuestion.correctOptionId;

            let optionBg = 'bg-amber-50 hover:bg-amber-100/70 border-amber-200 text-amber-950';
            if (isAnswerRevealed) {
              if (isCorrect) {
                optionBg = 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-md';
              } else if (isSelected) {
                optionBg = 'bg-rose-100 border-rose-500 text-rose-950 shadow-md';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isAnswerRevealed}
                className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 font-extrabold text-base sm:text-lg transition-all text-left min-h-[56px] ${optionBg}`}
              >
                <span>{opt.text}</span>
                {isAnswerRevealed && (
                  <div>
                    {isCorrect && <Check className="w-6 h-6 text-emerald-600" />}
                    {isSelected && !isCorrect && <X className="w-6 h-6 text-rose-600" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
