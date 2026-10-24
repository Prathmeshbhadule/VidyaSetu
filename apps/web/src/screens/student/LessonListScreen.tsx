import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import { Lesson } from '@vidya-setu/shared';
import { BookOpen, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-orange-600" />
            {t('student.myLessons')}
          </h2>
          <p className="text-xs sm:text-sm text-amber-800 font-medium mt-1">
            Browse offline lessons designed for your learning level
          </p>
        </div>
        <AudioHelpButton text="आपल्या आवडीचा विषय निवडा आणि पाठ वाचण्यास सुरुवात करा." size="sm" />
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all min-h-[44px] ${
              selectedSubject === sub
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-100/60'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => navigate(`/student/lessons/${lesson.id}`)}
            className="bg-white rounded-3xl p-5 border-2 border-amber-200 hover:border-orange-500 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px] uppercase">
                  {lesson.subject}
                </span>
                <span className="text-xs font-bold text-orange-700">
                  Level {lesson.level}
                </span>
              </div>

              <h3 className="font-extrabold text-amber-950 text-lg leading-snug line-clamp-2">
                {lesson.title}
              </h3>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-amber-100">
              <span className="text-xs text-amber-700 font-semibold">
                ~{lesson.estimatedMinutes} min
              </span>

              <div className="flex items-center gap-2">
                <AudioHelpButton text={lesson.title} size="sm" />
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
