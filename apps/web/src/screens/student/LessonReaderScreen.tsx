import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import { speechService } from '../../services/speech.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { Lesson, Quiz } from '@vidya-setu/shared';
import { VideoPlayer } from '../../components/VideoPlayer.js';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  PlayCircle,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  Video as VideoIcon,
  FileText,
  CheckSquare,
  Sparkles,
  Download,
  Share2,
  MessageCircle,
  Clock,
  ArrowRight,
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
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'dpp' | 'doubt'>('video');

  useEffect(() => {
    async function fetchLesson() {
      if (!id) return;
      const local = await offlineDb.lessons.get(id);
      if (local) {
        setLesson(local);
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
    if (associatedQuiz) {
      navigate(`/student/quizzes/${associatedQuiz.id}`);
    } else {
      navigate('/student/quizzes');
    }
  };

  if (!lesson) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Loading classroom lecture...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 pb-28 space-y-5">
      {/* Lecture Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/student/home')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all min-h-[38px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classroom (बॅचवर परत जा)</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
            ● 240p/360p Offline Cached
          </span>
          <AudioHelpButton text="आपण व्हिडिओ पाहू शकता किंवा खालील नोट्स वाचू शकता." size="sm" />
        </div>
      </div>

      {/* Video Player Container */}
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
        <VideoPlayer
          videoId={lesson.id}
          title={lesson.title}
          subject={lesson.subject}
          durationSec={lesson.estimatedMinutes * 60}
          onComplete={handleMarkComplete}
        />
      </div>

      {/* Class Details & Teacher Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-black text-xs uppercase tracking-wider">
                {lesson.subject}
              </span>
              <span className="text-xs font-bold text-slate-500">
                Grade {lesson.grade} • Level {lesson.level} • Lecture 01
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {lesson.title}
            </h1>

            <p className="text-xs text-slate-500 font-semibold mt-1">
              By Sunil Patil Sir (सुनील पाटील सर) • Master Faculty, Vidya Setu
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReadFullLesson}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm transition-all min-h-[40px] ${
                isReadingAloud
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {isReadingAloud ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isReadingAloud ? 'Stop Voice' : 'Audio Narration'}</span>
            </button>
          </div>
        </div>

        {/* Classroom Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pt-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'video', label: '🎬 Lecture Overview', count: null },
            { id: 'notes', label: '📄 Class Notes & Reading', count: 'PDF' },
            { id: 'dpp', label: '📝 Attached DPP / Quiz', count: associatedQuiz ? '1 Test' : 'None' },
            { id: 'doubt', label: '❓ Ask a Doubt', count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count && (
                <span className="bg-slate-200 text-slate-700 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'video' && (
          <div className="space-y-4 pt-2 text-slate-700 text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Classroom Objectives (या पाठात आपण काय शिकणार?)</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 font-medium">
                <li>Understand fundamental sounds, phonics, and letters of the regional script.</li>
                <li>Interactive visual examples with everyday village objects (lotus, mangoes, trees).</li>
                <li>Complete the video lecture to unlock the 10-mark Daily Practice Problem (DPP).</li>
              </ul>
            </div>

            {/* Attached DPP Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                  Daily Practice Problem (DPP)
                </span>
                <h5 className="font-black text-slate-900 text-base">
                  {associatedQuiz?.title || 'Lecture Practice Test 01'}
                </h5>
                <p className="text-xs text-slate-600 font-medium">
                  {associatedQuiz?.questions.length || 2} Questions • 10 Marks • ⭐⭐⭐ 3 Stars Reward
                </p>
              </div>

              <button
                onClick={() => {
                  if (associatedQuiz) {
                    navigate(`/student/quizzes/${associatedQuiz.id}`);
                  } else {
                    navigate('/student/quizzes');
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all"
              >
                <span>Start Practice Quiz (DPP)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Class Notes & Text */}
        {activeTab === 'notes' && (
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 border border-blue-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-xs text-blue-900">
                  Official Class Notes (हस्तलिखित वर्ग नोंदी)
                </span>
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save Notes</span>
              </button>
            </div>

            <div className="space-y-4">
              {(lesson.contentBlocks || []).map((block: any, idx: number) => {
                if (block.type === 'HEADING') {
                  return (
                    <h3 key={idx} className="text-lg font-black text-slate-900 pt-2 border-b border-slate-100 pb-1">
                      {block.content}
                    </h3>
                  );
                }
                if (block.type === 'CALLOUT') {
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs sm:text-sm">
                      💡 {block.content}
                    </div>
                  );
                }
                return (
                  <p key={idx} className="text-slate-800 leading-relaxed text-sm sm:text-base font-medium">
                    {block.content}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Attached DPP */}
        {activeTab === 'dpp' && (
          <div className="pt-2 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  DPP • Daily Practice Problem (दैनंदिन सराव चाचणी)
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Passing Marks: {associatedQuiz?.passingMarks || 6} / {associatedQuiz?.totalMarks || 10}
                </span>
              </div>

              <h4 className="font-black text-slate-900 text-lg">
                {associatedQuiz?.title || 'Lecture Practice Test'}
              </h4>

              <p className="text-xs text-slate-600 font-medium">
                Test your understanding immediately after watching the lecture. Instant answer review and star rewards.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    if (associatedQuiz) {
                      navigate(`/student/quizzes/${associatedQuiz.id}`);
                    } else {
                      navigate('/student/quizzes');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md"
                >
                  <span>Solve DPP Questions Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Doubt Solver */}
        {activeTab === 'doubt' && (
          <div className="pt-2 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="font-black text-slate-900 text-base">
                Ask Teacher a Doubt (शिक्षकांना शंका विचारा)
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                In offline classroom mode, your questions are saved locally on the school hub PC for your teacher to review.
              </p>
              <button
                onClick={() => speechService.speak(lesson.title, language)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm"
              >
                🔊 Listen to Voice Explanation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
