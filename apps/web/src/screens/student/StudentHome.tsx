import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { offlineDb } from '../../db/offline-db.js';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import { Lesson } from '@vidya-setu/shared';
import {
  BookOpen,
  GraduationCap,
  Award,
  PlayCircle,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle,
  Video as VideoIcon,
} from 'lucide-react';

export const StudentHome: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStudent, isSimpleMode } = useAuthStore();
  const [recentLesson, setRecentLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    async function loadContent() {
      const lessons = await offlineDb.lessons.toArray();
      if (lessons.length > 0) {
        setRecentLesson(lessons[0]);
      } else {
        // Seed default offline lessons into IndexedDB if empty
        const defaultLessons: Lesson[] = [
          {
            id: '018f679a-ls01-7000-8000-000000000001',
            schoolId: 'global',
            title: 'Our Alphabet and Phonics (वर्णमाला व ध्वनी)',
            subject: 'LANGUAGE',
            grade: 1,
            level: 1,
            contentBlocks: [
              { id: 'b1', type: 'HEADING', content: 'Learning Letter Sounds' },
              { id: 'b2', type: 'PARAGRAPH', content: 'Every letter has its own sound. For example, "क" makes the sound /ka/ as in Kamal (Lotus).' },
              { id: 'b3', type: 'CALLOUT', content: 'Point to the picture of a lotus and say "क" loudly!' },
            ],
            status: 'PUBLISHED',
            estimatedMinutes: 10,
            version: 1,
            deviceId: 'hub',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
          {
            id: '018f679a-ls02-7000-8000-000000000002',
            schoolId: 'global',
            title: 'Numbers and Counting 1 to 20 (अंक आणि मोजणी)',
            subject: 'MATH',
            grade: 2,
            level: 2,
            contentBlocks: [
              { id: 'b1', type: 'HEADING', content: 'Counting Objects' },
              { id: 'b2', type: 'PARAGRAPH', content: 'Count the five mangoes on the tree: 1, 2, 3, 4, 5. Add one more to get 6!' },
            ],
            status: 'PUBLISHED',
            estimatedMinutes: 15,
            version: 1,
            deviceId: 'hub',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
          {
            id: '018f679a-ls03-7000-8000-000000000003',
            schoolId: 'global',
            title: 'Plants and Trees Around Us (आपल्या सभोवतालची झाडे)',
            subject: 'SCIENCE',
            grade: 3,
            level: 3,
            contentBlocks: [
              { id: 'b1', type: 'HEADING', content: 'Parts of a Plant' },
              { id: 'b2', type: 'PARAGRAPH', content: 'Roots absorb water from soil. Green leaves make food with sunlight.' },
            ],
            status: 'PUBLISHED',
            estimatedMinutes: 15,
            version: 1,
            deviceId: 'hub',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
        ];
        await offlineDb.lessons.bulkPut(defaultLessons);
        setRecentLesson(defaultLessons[0]);
      }
    }
    loadContent();
  }, []);

  const studentName = currentStudent ? currentStudent.name : 'Student';
  const assessedLevel = currentStudent ? currentStudent.assessedLevel : 2;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-28">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden mb-6">
        <div className="absolute right-0 bottom-0 opacity-15 translate-x-4 translate-y-4 pointer-events-none">
          <Sparkles className="w-48 h-48" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-3xl font-black shadow-inner">
              {studentName.charAt(0)}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                Grade {currentStudent?.grade || 3}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                {t('student.welcomeBack', { name: studentName })}
              </h2>
              <div className="inline-flex items-center gap-2 mt-1.5 bg-black/20 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <span>{t('student.assessedLevel')}:</span>
                <span className="bg-amber-300 text-amber-950 font-black px-2 py-0.5 rounded-full text-[11px]">
                  Level {assessedLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AudioHelpButton
              text={`नमस्ते ${studentName}! तुमचे स्वागत आहे. खालील पाठांवर टॅप करा.`}
              size="lg"
              className="bg-white/20 text-white border-white/40 hover:bg-white/30"
            />
          </div>
        </div>
      </div>

      {/* Resume Card (if recent lesson exists) */}
      {recentLesson && (
        <div
          onClick={() => navigate(`/student/lessons/${recentLesson.id}`)}
          className="bg-white border-2 border-amber-200 hover:border-orange-500 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center min-w-[48px]">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-orange-700 uppercase">
                {t('student.resumeLesson')}
              </span>
              <h4 className="font-extrabold text-amber-950 text-base sm:text-lg line-clamp-1">
                {recentLesson.title}
              </h4>
              <p className="text-xs text-amber-700">
                {recentLesson.subject} • ~{recentLesson.estimatedMinutes} min
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-orange-500 min-w-[24px]" />
        </div>
      )}

      {/* Big Action Tiles (Tablet-First Grid) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ${isSimpleMode ? 'text-lg' : ''}`}>
        {/* Tile 1: Lessons */}
        <button
          onClick={() => navigate('/student/lessons')}
          className="flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-orange-500 shadow-sm hover:shadow-xl active:scale-95 transition-all text-left min-h-[110px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl shadow-md min-w-[56px]">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-lg text-amber-950">
              {t('student.myLessons')}
            </h3>
            <p className="text-xs text-amber-800 mt-0.5 font-medium">
              Reading stories & text lessons
            </p>
          </div>
        </button>

        {/* Tile 2: Video Lectures */}
        <button
          onClick={() => navigate('/student/videos')}
          className="flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-500 shadow-sm hover:shadow-xl active:scale-95 transition-all text-left min-h-[110px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center text-2xl shadow-md min-w-[56px]">
            <VideoIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-lg text-purple-950">
                Video Lectures
              </h3>
              <span className="bg-purple-200 text-purple-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                240p/360p
              </span>
            </div>
            <p className="text-xs text-purple-800 mt-0.5 font-medium">
              Offline animated lessons with resume
            </p>
          </div>
        </button>

        {/* Tile 3: Practice Quizzes & Results */}
        <button
          onClick={() => navigate('/student/quizzes')}
          className="flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-500 shadow-sm hover:shadow-xl active:scale-95 transition-all text-left min-h-[110px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center text-2xl shadow-md min-w-[56px]">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-lg text-blue-950">
                Quizzes & Results
              </h3>
              <span className="bg-blue-200 text-blue-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                ⭐⭐⭐ Stars
              </span>
            </div>
            <p className="text-xs text-blue-800 mt-0.5 font-medium">
              Review answers, scores & badges
            </p>
          </div>
        </button>

        {/* Tile 4: TaRL Level Check (Adaptive Assessment) */}
        <button
          onClick={() => navigate('/student/adaptive')}
          className="flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-500 shadow-sm hover:shadow-xl active:scale-95 transition-all text-left min-h-[110px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md min-w-[56px]">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-lg text-emerald-950">
              {t('student.takeAdaptiveAssessment')}
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5 font-medium">
              TaRL Diagnostic Level Check (1-5)
            </p>
          </div>
        </button>

        {/* Tile 5: Government Schemes */}
        <button
          onClick={() => navigate('/schemes')}
          className="flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-200 hover:border-rose-500 shadow-sm hover:shadow-xl active:scale-95 transition-all text-left min-h-[110px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl shadow-md min-w-[56px]">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-lg text-rose-950">
              {t('student.mySchemes')}
            </h3>
            <p className="text-xs text-rose-800 mt-0.5 font-medium">
              Scholarships, uniforms & bicycles
            </p>
          </div>
        </button>

        {/* Tile 6: My Learning Journey */}
        <button
          onClick={() => navigate('/student/progress')}
          className="flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-sky-50 border-2 border-indigo-200 hover:border-indigo-500 shadow-sm hover:shadow-xl active:scale-95 transition-all text-left min-h-[110px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-md min-w-[56px]">
            <Star className="w-7 h-7 fill-white" />
          </div>
          <div>
            <h3 className="font-black text-lg text-indigo-950">
              {t('student.myProgress')}
            </h3>
            <p className="text-xs text-indigo-800 mt-0.5 font-medium">
              Progress report & printable slip
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
