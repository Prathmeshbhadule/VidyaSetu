import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import { Lesson } from '@vidya-setu/shared';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Video as VideoIcon,
  PlayCircle,
  Clock,
  FileText,
  CheckSquare,
} from 'lucide-react';

export const LessonListScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  useEffect(() => {
    async function loadLessons() {
      const all = await offlineDb.lessons.toArray();
      setLessons(all);
    }
    loadLessons();
  }, []);

  const subjects = ['ALL', 'LANGUAGE', 'MATH', 'SCIENCE'];

  const filtered = selectedSubject === 'ALL'
    ? lessons
    : lessons.filter((l) => l.subject === selectedSubject);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-28 space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/student/home')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all mb-2 min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard (डॅशबोर्डवर परत जा)</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <span>My Batches & Chapters (माझी बॅच व पाठ)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Safar Batch 2026 • Video lectures, lecture notes and DPP exercises
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AudioHelpButton text="आपल्या आवडीचा विषय निवडा आणि पाठ वाचण्यास सुरुवात करा." size="sm" />
        </div>
      </div>

      {/* Video Lectures Quick Banner */}
      <div
        onClick={() => navigate('/student/videos')}
        className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-between gap-4 border border-slate-800"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center min-w-[56px] shadow-inner">
            <VideoIcon className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                व्हिडिओ तासिका (Video Classroom)
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ● 240p/360p Offline
              </span>
            </div>
            <h3 className="font-black text-base sm:text-lg mt-1">
              Watch Animated Video Lectures (व्हिडिओ व्याख्याने पहा)
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              4 interactive seekable video lessons with resume playback and quiz unlocks
            </p>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 text-blue-400 min-w-[24px]" />
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all min-h-[40px] border ${
              selectedSubject === sub
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sub === 'ALL' ? 'सर्व विषय (All)' : sub}
          </button>
        ))}
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => navigate(`/student/lessons/${lesson.id}`)}
            className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-500 hover:shadow-xl active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-black text-xs uppercase">
                  {lesson.subject}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  TaRL Level {lesson.level}
                </span>
              </div>

              <h3 className="font-black text-slate-900 text-lg leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                {lesson.title}
              </h3>

              <p className="text-xs text-slate-500 font-medium mt-1">
                Faculty: Sunil Patil Sir • Master Teacher
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ~{lesson.estimatedMinutes} min
                </span>
                <span>•</span>
                <span className="text-emerald-600 font-bold">● Offline Ready</span>
                <span>•</span>
                <span className="text-blue-600 font-bold">DPP Attached</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <span className="text-xs text-blue-600 font-black">
                Start Chapter ▶
              </span>

              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
