import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import { speechService } from '../../services/speech.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { Lesson, Quiz } from '@vidya-setu/shared';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  PlayCircle,
  HelpCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const LessonReaderScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, isSimpleMode } = useAuthStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [associatedQuiz, setAssociatedQuiz] = useState<Quiz | null>(null);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    async function fetchLesson() {
      if (!id) return;
      const local = await offlineDb.lessons.get(id);
      if (local) {
        setLesson(local);
        // Find quiz
        const quiz = await offlineDb.quizzes.where('lessonId').equals(id).first();
        if (quiz) {
          setAssociatedQuiz(quiz);
        }
      }
    }
    fetchLesson();
  }, [id]);

  const handleReadFullLesson = () => {
    if (!lesson) return;

    if (isReadingAloud) {
      speechService.stop();
      setIsReadingAloud(false);
    } else {
      const fullText = [
        lesson.title,
        ...(lesson.contentBlocks || []).map((b: any) => b.content),
      ].join('. ');

      speechService.speak(fullText, language);
      setIsReadingAloud(true);
    }
  };

  const handleMarkComplete = async () => {
    setIsCompleted(true);
    // Unlocks quiz directly
    if (associatedQuiz) {
      navigate(`/student/quizzes/${associatedQuiz.id}`);
    } else {
      navigate('/student/lessons');
    }
  };

  if (!lesson) {
    return (
      <div className="p-6 text-center">
        <p className="text-amber-800">Loading lesson...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-28">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/student/home')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs hover:bg-amber-200 transition-all min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')}</span>
        </button>

        <button
          onClick={handleReadFullLesson}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all min-h-[44px] ${
            isReadingAloud
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {isReadingAloud ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isReadingAloud ? t('common.stopAudio') : t('common.readAloud')}</span>
        </button>
      </div>

      {/* Lesson Reader Card */}
      <article className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-amber-200 shadow-md">
        <header className="mb-6 border-b border-amber-100 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-extrabold text-[11px] uppercase tracking-wider">
              {lesson.subject}
            </span>
            <span className="text-xs font-semibold text-amber-700">
              Grade {lesson.grade} • Level {lesson.level}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-amber-950 leading-tight">
            {lesson.title}
          </h1>
        </header>

        {/* Content Blocks */}
        <div className="space-y-6 text-slate-800">
          {(lesson.contentBlocks || []).map((block: any, idx: number) => {
            if (block.type === 'HEADING') {
              return (
                <div key={idx} className="flex items-center justify-between gap-3 pt-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-orange-950">
                    {block.content}
                  </h3>
                  <AudioHelpButton text={block.content} size="sm" />
                </div>
              );
            }

            if (block.type === 'CALLOUT') {
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-4 sm:p-5 flex items-start gap-3.5 my-4"
                >
                  <div className="p-2 rounded-xl bg-amber-200 text-amber-900 min-w-[36px]">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-amber-950 text-sm sm:text-base leading-relaxed">
                      {block.content}
                    </p>
                  </div>
                  <AudioHelpButton text={block.content} size="sm" />
                </div>
              );
            }

            return (
              <div key={idx} className="flex items-start justify-between gap-3">
                <p
                  className={`leading-relaxed text-slate-800 flex-1 ${
                    isSimpleMode ? 'text-lg sm:text-xl font-medium' : 'text-base sm:text-lg'
                  }`}
                >
                  {block.content}
                </p>
                <AudioHelpButton text={block.content} size="sm" />
              </div>
            );
          })}
        </div>

        {/* Lesson Footer & Quiz Unlock Action */}
        <div className="mt-10 pt-6 border-t border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Completing this lesson unlocks the practice quiz!</span>
          </div>

          <button
            onClick={handleMarkComplete}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-base shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all min-h-[48px]"
          >
            <span>{associatedQuiz ? 'Take Practice Quiz' : 'Mark Completed'}</span>
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </article>
    </div>
  );
};
