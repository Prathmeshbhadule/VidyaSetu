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
  CheckCircle2,
  Video as VideoIcon,
  Flame,
  FileText,
  Clock,
  CheckSquare,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Download,
  ShieldCheck,
} from 'lucide-react';

export const StudentHome: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStudent, isSimpleMode } = useAuthStore();
  const [recentLesson, setRecentLesson] = useState<Lesson | null>(null);
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>('ALL');

  useEffect(() => {
    async function loadContent() {
      const lessons = await offlineDb.lessons.toArray();
      if (lessons.length > 0) {
        setRecentLesson(lessons[0]);
      } else {
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

  const studentName = currentStudent ? currentStudent.name : 'Aarav Patil';
  const assessedLevel = currentStudent ? currentStudent.assessedLevel : 2;
  const gradeNumber = currentStudent ? currentStudent.grade : 3;

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 pb-28 space-y-6">
      {/* Hero Batch Banner Carousel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 border border-slate-800 text-white shadow-2xl p-6 sm:p-8">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-indigo-500 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            {/* Batch Tag */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                🎯 लक्ष्य बॅच २०२६ (TARGET 2026)
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                ● 100% Offline Ready
              </span>
            </div>

            {/* Title & Teacher */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                इयत्ता {gradeNumber} री • संपूर्ण पायाभूत अभ्यासक्रम
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                Language Phonics • Vedic Math • Basic Science • TaRL Level {assessedLevel}
              </p>
              <p className="text-[11px] text-blue-300 font-bold mt-1">
                मार्गदर्शक: सुनील पाटील सर (सुवर्णपदक विजेते शिक्षक) व तज्ञ शिक्षक
              </p>
            </div>

            {/* Features Row */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <VideoIcon className="w-4 h-4 text-amber-400" />
                <span>4 Video Lectures</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Daily Practice DPP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Class Notes PDF</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/student/videos')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/30 active:scale-95 transition-all min-h-[46px]"
              >
                <PlayCircle className="w-5 h-5 fill-white text-blue-600" />
                <span>Resume Lecture (लेक्चर सुरु करा)</span>
              </button>

              <button
                onClick={() => navigate('/student/quizzes')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs sm:text-sm transition-all min-h-[46px]"
              >
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Solve Today's DPP (चाचणी सोडवा)</span>
              </button>
            </div>
          </div>

          {/* Student Status Card */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700 text-center min-w-[200px] shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-3xl mx-auto flex items-center justify-center mb-2 shadow-inner">
              🦁
            </div>
            <h4 className="font-black text-white text-base">{studentName}</h4>
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-black mt-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>4 Days Study Streak!</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/80 flex items-center justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">TaRL Level</span>
                <span className="font-black text-blue-400 text-sm">Level {assessedLevel}</span>
              </div>
              <div className="h-6 w-px bg-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Accuracy</span>
                <span className="font-black text-emerald-400 text-sm">92%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Category Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: 'सर्व विषय (All)', icon: '📚' },
          { id: 'LANGUAGE', label: 'मराठी व इंग्रजी भाषा', icon: '📖' },
          { id: 'MATH', label: 'गणित व संख्याज्ञान', icon: '🔢' },
          { id: 'SCIENCE', label: 'परिसर अभ्यास व विज्ञान', icon: '🔬' },
          { id: 'TESTS', label: 'सराव चाचणी व निकाल', icon: '🎯' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'TESTS') {
                navigate('/student/quizzes');
              } else {
                setActiveSubjectTab(tab.id);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border ${
              activeSubjectTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Section: Continue Watching / Recent Lecture */}
      {recentLesson && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* 16:9 Thumbnail Box */}
            <div
              onClick={() => navigate(`/student/lessons/${recentLesson.id}`)}
              className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center cursor-pointer group flex-shrink-0 overflow-hidden shadow-inner"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-indigo-950 flex items-center justify-center">
                <span className="text-3xl">🎬</span>
              </div>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all flex items-center justify-center">
                <PlayCircle className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                12:45
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  {recentLesson.subject}
                </span>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ~{recentLesson.estimatedMinutes} min
                </span>
              </div>

              <h3
                onClick={() => navigate(`/student/lessons/${recentLesson.id}`)}
                className="font-black text-slate-900 text-base sm:text-lg hover:text-blue-600 cursor-pointer line-clamp-1"
              >
                {recentLesson.title}
              </h3>

              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Classroom Lecture • By Sunil Patil Sir (सुनील पाटील सर)
              </p>

              {/* Progress bar */}
              <div className="w-48 bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-200">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => navigate(`/student/lessons/${recentLesson.id}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all min-h-[44px]"
            >
              <span>Continue Studying</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Section: My Batches & Subject Classrooms */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>My Subject Classrooms (माझे विषय वर्ग)</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Structured lectures, assignments (DPP) and chapter notes
            </p>
          </div>

          <button
            onClick={() => navigate('/student/lessons')}
            className="text-xs font-black text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Batch Card 1: Language */}
          <div
            onClick={() => navigate('/student/lessons')}
            className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs">
                  📖 भाषा व इंग्रजी
                </span>
                <span className="text-xs font-bold text-slate-400">Class 3</span>
              </div>

              <h4 className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                मराठी व इंग्रजी वर्णमाला व शब्द वाचन
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Faculty: Sunil Patil Sir • Master Teacher
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 text-[11px] font-bold text-slate-600">
                <span>📹 3 Lectures</span>
                <span>•</span>
                <span>📝 2 DPPs</span>
                <span>•</span>
                <span>📄 Notes PDF</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600">
                ● 100% Offline
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Batch Card 2: Mathematics */}
          <div
            onClick={() => navigate('/student/lessons')}
            className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-black text-xs">
                  🔢 गणित (Mathematics)
                </span>
                <span className="text-xs font-bold text-slate-400">Class 3</span>
              </div>

              <h4 className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                संख्याज्ञान, मोजणी आणि गमतीशीर बेरीज
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Faculty: Anita Kulkarni Madam
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 text-[11px] font-bold text-slate-600">
                <span>📹 4 Lectures</span>
                <span>•</span>
                <span>📝 3 DPPs</span>
                <span>•</span>
                <span>📄 Formula Sheet</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600">
                ● 100% Offline
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Batch Card 3: Science */}
          <div
            onClick={() => navigate('/student/lessons')}
            className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs">
                  🔬 परिसर अभ्यास व विज्ञान
                </span>
                <span className="text-xs font-bold text-slate-400">Class 3</span>
              </div>

              <h4 className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                आपल्या सभोवतालची झाडे व निसर्ग
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Faculty: Rajesh Deshmukh Sir
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 text-[11px] font-bold text-slate-600">
                <span>📹 2 Lectures</span>
                <span>•</span>
                <span>📝 1 DPP</span>
                <span>•</span>
                <span>📄 Diagrams PDF</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600">
                ● 100% Offline
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Daily Practice Problems (DPP) & Test Series */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <span>Daily Practice Problems (DPP) & Test Series</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Topic-wise practice quizzes with answer key & scorecards
            </p>
          </div>

          <button
            onClick={() => navigate('/student/quizzes')}
            className="text-xs font-black text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>All Results & Scorecards</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* DPP 1 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  DPP 01 • LANGUAGE
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Score: 10/10
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                Phonics & Letter Sounds Practice
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                10 Marks • ⭐⭐⭐ 3 Stars Earned
              </p>
            </div>

            <button
              onClick={() => navigate('/student/quizzes')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
            >
              Review
            </button>
          </div>

          {/* DPP 2 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  DPP 02 • MATH
                </span>
                <span className="text-xs font-bold text-blue-600">
                  New Exercise
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                Numbers 1 to 20 & Quick Addition
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                10 Questions • 10 Marks • ~5 min
              </p>
            </div>

            <button
              onClick={() => navigate('/student/quizzes/quiz-math-01')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md"
            >
              Start DPP
            </button>
          </div>
        </div>
      </div>

      {/* Section: Free Offline Study Material & Schemes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Welfare Schemes Box */}
        <div
          onClick={() => navigate('/schemes')}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md">
              🏛️
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                Welfare Portal
              </span>
              <h4 className="font-black text-slate-900 text-base">
                Government Schemes & Benefits
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                Scholarships, uniforms, bicycles & checklist
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-700" />
        </div>

        {/* TaRL Diagnostic Level Box */}
        <div
          onClick={() => navigate('/student/adaptive')}
          className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-5 border border-indigo-200 hover:border-indigo-400 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-md">
              🎯
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800">
                TaRL Staircase Diagnostic
              </span>
              <h4 className="font-black text-slate-900 text-base">
                Check My Learning Level (1 to 5)
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                Current Level: Level {assessedLevel} Certified
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-indigo-700" />
        </div>
      </div>
    </div>
  );
};
