import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { ensureContentSeeded } from '../../db/seed-content.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { Lesson, Quiz, StudyMaterial, QuizResult } from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  BookOpen,
  Award,
  Video as VideoIcon,
  PlayCircle,
  ArrowRight,
  Flame,
  Star,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  Clock,
  CheckSquare,
  ChevronRight,
  TrendingUp,
  Download,
  ShieldCheck,
  LogOut,
  X,
  Volume2,
  Calculator,
  Atom,
  BookMarked,
  GraduationCap,
  School,
  ExternalLink,
} from 'lucide-react';

export const StudentHome: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStudent, classMode, logout } = useAuthStore();

  const [recentLesson, setRecentLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [studentResults, setStudentResults] = useState<QuizResult[]>([]);
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>('ALL');
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [readerTab, setReaderTab] = useState<'pdf' | 'text'>('pdf');

  useEffect(() => {
    if (!currentStudent) {
      navigate('/login?role=STUDENT', { replace: true });
    }
  }, [currentStudent, navigate]);

  useEffect(() => {
    async function loadContent() {
      if (!currentStudent) return;
      await ensureContentSeeded();

      const lessons = await offlineDb.lessons.toArray();
      setAllLessons(lessons);
      setRecentLesson(lessons.length > 0 ? lessons[0] : null);

      const quizzes = await offlineDb.quizzes.toArray();
      setAllQuizzes(quizzes);

      const materials = await offlineDb.studyMaterials.toArray();
      setStudyMaterials(materials);

      const results = await offlineDb.quizResults
        .where('studentId')
        .equals(currentStudent.id)
        .toArray();
      setStudentResults(results);
    }

    loadContent();
  }, [currentStudent]);

  if (!currentStudent) {
    return null;
  }

  const studentName = currentStudent.name;
  const assessedLevel = currentStudent.assessedLevel;
  const gradeNumber = currentStudent.grade;

  const videoCount = allLessons.length;
  const quizCount = allQuizzes.length;
  const materialCount = studyMaterials.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-36 space-y-6 animate-chart-enter">
      {/* Student Session & Identity Bar */}
      <div className="apple-card rounded-[24px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {classMode?.isClassMode ? <School className="w-6 h-6 text-white" /> : <GraduationCap className="w-6 h-6 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                {classMode?.isClassMode ? classMode.className : studentName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Grade {gradeNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                TaRL Level {assessedLevel}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
              {classMode?.isClassMode
                ? 'Shared Tablet Classroom Session'
                : `PRN: ${currentStudent.prn} • Verified Offline Profile`}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login?role=STUDENT');
          }}
          className="apple-press self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-600 text-slate-600 dark:text-slate-300 font-medium text-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Profile</span>
        </button>
      </div>

      {/* Apple-style Hero Showcase Banner */}
      <div className="rounded-[32px] p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 border border-slate-200/90 dark:border-slate-800 shadow-xl dark:shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 dark:border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Maharashtra State Board Curriculum</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30">
                100% Offline
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Grade {gradeNumber} Foundational Learning Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal mt-1 leading-relaxed">
                Vernacular Marathi & Hindi lessons, Vedic math drills, and daily practice problem quizzes.
              </p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-sm">
                <VideoIcon className="w-3.5 h-3.5 text-blue-600 dark:text-amber-300" />
                <span>{videoCount} Lectures</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-sm">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                <span>{quizCount} Practice DPPs</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-sm">
                <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-sky-300" />
                <span>{materialCount} Textbooks</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                onClick={() => navigate('/student/videos')}
                className="apple-press inline-flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Resume Latest Video</span>
              </button>
              <button
                onClick={() => navigate('/student/progress')}
                className="apple-press inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm border border-slate-200/90 dark:border-white/20 transition-all shadow-sm cursor-pointer"
              >
                <span>View My Stars</span>
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              </button>
            </div>
          </div>

          {/* Right Card: Streak & Accuracy */}
          <div className="rounded-[24px] p-5 text-center min-w-[210px] space-y-2 self-start lg:self-auto bg-white/95 dark:bg-slate-800/80 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>Study Streak</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">4 Days</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Continuous daily practice</p>
            <div className="pt-2 border-t border-slate-100 dark:border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 block tracking-wider">Overall Accuracy</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">88% Passing Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: 'All Subjects', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'LANGUAGE', label: 'Marathi (भाषा)', icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'MATH', label: 'Math (गणित)', icon: <Calculator className="w-3.5 h-3.5" /> },
          { id: 'SCIENCE', label: 'Science (विज्ञान)', icon: <Atom className="w-3.5 h-3.5" /> },
          { id: 'TESTS', label: 'Quizzes & Stars', icon: <Award className="w-3.5 h-3.5" /> },
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
            className={`apple-press flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              activeSubjectTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Lesson Continue Card */}
      {recentLesson && (
        <div className="apple-card rounded-[28px] p-5 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div
              onClick={() => navigate(`/student/lessons/${recentLesson.id}`)}
              className="relative w-28 h-20 sm:w-32 sm:h-20 rounded-[18px] bg-slate-900 border border-slate-800 flex items-center justify-center cursor-pointer group flex-shrink-0 overflow-hidden shadow-inner"
            >
              <VideoIcon className="w-7 h-7 text-slate-500 group-hover:scale-110 transition-transform" />
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center absolute shadow-lg group-hover:scale-110 transition-transform">
                <PlayCircle className="w-4 h-4 fill-white text-blue-600" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase">
                  {recentLesson.subject}
                </span>
                <span className="text-xs text-slate-400">
                  Grade {recentLesson.grade} • Level {recentLesson.level}
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  ● 65% Completed
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight line-clamp-1">
                {recentLesson.title}
              </h3>

              <div className="w-44 sm:w-56 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1.5">
                <div className="bg-blue-600 h-full rounded-full w-[65%]" />
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/student/lessons/${recentLesson.id}`)}
            className="apple-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all self-end md:self-auto"
          >
            <span>Resume Lesson</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Curriculum Subject Classrooms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Classrooms & Curriculum Units
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Explore grade-mapped learning modules and visual storytelling</p>
          </div>

          <button
            onClick={() => navigate('/student/lessons')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Marathi */}
          <div
            onClick={() => navigate('/student/lessons')}
            className="apple-card rounded-[24px] p-5 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-[14px] bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  {allLessons.filter((l) => l.subject === 'LANGUAGE').length || 1} Lessons
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-amber-600 transition-colors">
                Marathi (भाषा व वाचन)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Phonics, word decoding, paragraph reading, and rural folk narratives.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Grade {gradeNumber} • Level 1-2</span>
              <span className="text-amber-600 font-bold flex items-center gap-0.5">
                Open <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Math */}
          <div
            onClick={() => navigate('/student/lessons')}
            className="apple-card rounded-[24px] p-5 hover:border-blue-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-[14px] bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calculator className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300">
                  {allLessons.filter((l) => l.subject === 'MATH').length || 1} Lessons
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition-colors">
                Mathematics (गणित व अंकज्ञान)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                2-digit operations, mental math, place value, and visual counting.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Grade {gradeNumber} • Level 2-3</span>
              <span className="text-blue-600 font-bold flex items-center gap-0.5">
                Open <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Science */}
          <div
            onClick={() => navigate('/student/lessons')}
            className="apple-card rounded-[24px] p-5 hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-[14px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Atom className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  {allLessons.filter((l) => l.subject === 'SCIENCE').length || 1} Lessons
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 transition-colors">
                Science & Environment (परिसर अभ्यास)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Water conservation, flora and fauna, seasonal cycles, and agricultural science.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Grade {gradeNumber} • Level 3</span>
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                Open <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Balbharati Textbooks & Materials */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-indigo-500" />
              E-Library & Balbharati Readers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Instant offline text-to-speech reading in regional Marathi & Hindi</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {studyMaterials.length} Stored Locally
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {studyMaterials.map((mat) => {
            const isPdf = Boolean(mat.downloadUrl?.startsWith('data:application/pdf') || mat.downloadUrl?.toLowerCase().endsWith('.pdf'));

            return (
              <div
                key={mat.id}
                onClick={() => {
                  setSelectedMaterial(mat);
                  setReaderTab(isPdf ? 'pdf' : 'text');
                }}
                className="apple-card rounded-[24px] p-5 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 uppercase">
                      {mat.type}
                    </span>
                    {isPdf && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase">
                        PDF Document
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium ml-auto">
                      {mat.sizeBytes ? `${(mat.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : `${mat.pages || 24} Pages`}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {mat.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                    <Download className="w-3.5 h-3.5" />
                    Offline Ready
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                    {isPdf ? 'Open PDF' : 'Read'} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Welfare Schemes Shortcut */}
      <div
        onClick={() => navigate('/schemes')}
        className="apple-card rounded-[28px] p-5 sm:p-6 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Government Schemes
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mt-1">
              Check Student Scholarship & DBT Eligibility
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Savitribai Phule scholarship, uniform grants, and nutrition benefits
            </p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Modal: Balbharati Reader & PDF Viewer */}
      {selectedMaterial && (() => {
        const isPdf = Boolean(
          selectedMaterial.downloadUrl?.startsWith('data:application/pdf') ||
          selectedMaterial.downloadUrl?.toLowerCase().endsWith('.pdf')
        );

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <div
              className={`apple-card rounded-[32px] w-full flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
                isPdf ? 'max-w-4xl h-[90vh]' : 'max-w-2xl max-h-[85vh]'
              }`}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                      {selectedMaterial.type} • Grade {selectedMaterial.grade}
                    </span>
                    {isPdf && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase">
                        PDF Document
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                    {selectedMaterial.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isPdf && (
                    <a
                      href={selectedMaterial.downloadUrl}
                      download={`${selectedMaterial.title}.pdf`}
                      className="apple-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download PDF</span>
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedMaterial(null)}
                    className="apple-press p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tab Switcher if PDF */}
              {isPdf && (
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="inline-flex p-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 border border-slate-300/40 dark:border-slate-700">
                    <button
                      onClick={() => setReaderTab('pdf')}
                      className={`apple-segment-item px-3 py-1 rounded-full text-xs font-semibold ${
                        readerTab === 'pdf'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      PDF Reader View
                    </button>
                    <button
                      onClick={() => setReaderTab('text')}
                      className={`apple-segment-item px-3 py-1 rounded-full text-xs font-semibold ${
                        readerTab === 'text'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      Text & Speech Notes
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline font-medium">
                    {selectedMaterial.sizeBytes ? `${(selectedMaterial.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : 'Offline Stored'}
                  </span>
                </div>
              )}

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
                {isPdf && readerTab === 'pdf' ? (
                  <div className="flex-1 min-h-[480px] w-full bg-slate-100 dark:bg-slate-950 p-2 sm:p-3 flex flex-col">
                    <iframe
                      src={selectedMaterial.downloadUrl}
                      title={selectedMaterial.title}
                      className="w-full flex-1 rounded-[18px] border border-slate-200/80 dark:border-slate-800 bg-white shadow-inner"
                    />
                  </div>
                ) : (
                  <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    <div className="prose max-w-none text-slate-800 dark:text-slate-200 text-sm whitespace-pre-line leading-relaxed p-5 rounded-[20px] bg-slate-50 dark:bg-slate-800/50">
                      {selectedMaterial.content}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window && selectedMaterial.content) {
                      window.speechSynthesis.cancel();
                      const u = new SpeechSynthesisUtterance(selectedMaterial.content.slice(0, 200));
                      u.lang = 'mr-IN';
                      window.speechSynthesis.speak(u);
                    }
                  }}
                  className="apple-press inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs"
                >
                  <Volume2 className="w-4 h-4 text-blue-500" />
                  <span>Listen in Vernacular Speech</span>
                </button>

                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="apple-press px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
