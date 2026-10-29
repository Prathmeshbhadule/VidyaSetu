import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
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
  HelpCircle,
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
} from 'lucide-react';

export const StudentHome: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStudent, classMode, isSimpleMode, logout } = useAuthStore();

  const [recentLesson, setRecentLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [studentResults, setStudentResults] = useState<QuizResult[]>([]);
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>('ALL');

  // Modal state for reading books / notes
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);

  // Enforce Student Privacy / Session Guard
  useEffect(() => {
    if (!currentStudent) {
      navigate('/student/picker', { replace: true });
    }
  }, [currentStudent, navigate]);

  useEffect(() => {
    async function loadContent() {
      if (!currentStudent) return;

      // 1. Load Lessons
      const lessons = await offlineDb.lessons.toArray();
      if (lessons.length > 0) {
        setAllLessons(lessons);
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
              { id: 'b1', type: 'HEADING', content: 'Counting with Everyday Objects' },
              { id: 'b2', type: 'PARAGRAPH', content: 'Count pebbles, sticks, or fingers. 1 apple plus 1 apple equals 2 apples!' },
            ],
            status: 'PUBLISHED',
            estimatedMinutes: 12,
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
        setAllLessons(defaultLessons);
        setRecentLesson(defaultLessons[0]);
      }

      // 2. Load Quizzes
      const quizzes = await offlineDb.quizzes.toArray();
      setAllQuizzes(quizzes);

      // 3. Load or Seed Study Materials / Books
      const materials = await offlineDb.studyMaterials.toArray();
      if (materials.length > 0) {
        setStudyMaterials(materials);
      } else {
        const seedMaterials: StudyMaterial[] = [
          {
            id: 'mat-01',
            schoolId: 'global',
            title: 'इयत्ता ३ री गणित पाठ्यपुस्तक - बालभारती',
            type: 'TEXTBOOK',
            subject: 'MATH',
            grade: 3,
            pages: 48,
            sizeBytes: 4404019,
            description: 'महाराष्ट्र राज्य पाठ्यपुस्तक मंडळ (बालभारती) अधिकृत गणित पुस्तक - संख्याज्ञान, बेरीज, वजाबाकी व भौमितिक आकृत्या.',
            content: `इयत्ता ३ री गणित पाठ्यपुस्तक (Mathematics Textbook)\n\nअनुक्रमणिका:\n१. भौमितिक आकृत्यांची ओळख - कोन, कडा व शिरोबिंदू\n२. संख्याज्ञान - तीन अंकी संख्यांचे वाचन व लेखन\n३. बिनहातच्याची व हातच्याची बेरीज\n४. बिनउसन्याची व उसन्याची वजाबाकी\n५. गुणाकार पूर्वतयारी व पाढे तयार करणे\n\nप्रकरण १: तीन अंकी संख्याज्ञान\nउदा. शतक (१००), दशक (१०) आणि एकक (१). १०० + २० + ५ = १२५ (एकशे पंचवीस).`,
            downloadUrl: '/materials/math_grade3_balbharati.pdf',
            offlineReady: true,
            version: 1,
            deviceId: 'hub',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
          {
            id: 'mat-02',
            schoolId: 'global',
            title: 'परिसर अभ्यास व सामान्य विज्ञान हस्तलिखित नोट्स',
            type: 'NOTES',
            subject: 'SCIENCE',
            grade: 3,
            pages: 18,
            sizeBytes: 2097152,
            description: 'शिक्षकांच्या हस्तलिखित स्पष्टीकरणासह जलचक्र, सजीव-निर्जीव आणि वनस्पतींची वाढ यावरील महत्त्वाचे मुद्दे.',
            content: `परिसर अभ्यास हस्तलिखित नोट्स (Science Teacher Notes)\n\nघटक: जलचक्र आणि वनस्पती\n\n१. वनस्पतींचे अवयव:\n- मुळे: जमिनीतील पाणी व क्षार शोषून घेतात.\n- खोड: झाडाला आधार देते व अन्न पोहोचवते.\n- पाने: सूर्यप्रकाशामध्ये अन्न तयार करतात (प्रकाशसंश्लेषण).\n\n२. पाण्याचे चक्र:\nउष्णता -> पाण्याचे बाष्पीभवन -> आकाशात ढग -> थंड हवा लागल्याने संघनन -> पाऊस!`,
            downloadUrl: '/materials/science_notes_std3.pdf',
            offlineReady: true,
            version: 1,
            deviceId: 'hub',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
          {
            id: 'mat-03',
            schoolId: 'global',
            title: 'मराठी वर्णमाला व ध्वनी स्वाध्याय पत्रिका',
            type: 'WORKSHEET',
            subject: 'LANGUAGE',
            grade: 1,
            pages: 12,
            sizeBytes: 1048576,
            description: 'अक्षर ओळख, चित्र-शब्द जोड्या आणि स्वरचिन्हांचा सराव करण्यासाठी रंगीत कार्यपत्रिका.',
            content: `मराठी भाषा स्वाध्याय पत्रिका (Vernacular Language Worksheet)\n\nस्वाध्याय १: अक्षराला गोल करा\nक - कमळ, कप, कपाट, करवत\nम - मका, मगर, मासा, मध\n\nस्वाध्याय २: रिकाम्या जागी योग्य शब्द भरा:\n१. आकाशामध्ये _______ चमकतो. (सूर्य / चंद्र)\n२. झाडावर गोड _______ पिकले आहेत. (आंबे / दगड)`,
            downloadUrl: '/materials/marathi_worksheet_std1.pdf',
            offlineReady: true,
            version: 1,
            deviceId: 'hub',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
        ];
        await offlineDb.studyMaterials.bulkPut(seedMaterials);
        setStudyMaterials(seedMaterials);
      }

      // 4. Load Student's OWN quiz results
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

  // Counts
  const videoCount = allLessons.length;
  const quizCount = allQuizzes.length;
  const materialCount = studyMaterials.length;

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 pb-36 space-y-6">
      {/* Student Session & Privacy Top Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-indigo-800 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-700/20 ring-2 ring-blue-100">
            {classMode?.isClassMode ? '🏫' : currentStudent.gender === 'FEMALE' ? '👧' : '👦'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-lg text-slate-900 leading-tight">
                {classMode?.isClassMode ? classMode.className : studentName}
              </h3>
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {t('common.grade')} {gradeNumber}
              </span>
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {classMode?.isClassMode ? 'सामूहिक वर्ग तासिका' : `TaRL ${t('common.level')} ${assessedLevel}`}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {classMode?.isClassMode
                ? 'Shared Tablet Classroom Session • No individual PIN required'
                : `PRN: ${currentStudent.prn} • ${t('session.lockedSession')}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login?role=STUDENT');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 font-black text-xs transition-all min-h-[44px] shadow-sm"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>{classMode?.isClassMode ? 'Leave Class (वर्ग सोडा)' : t('session.switchStudent')}</span>
        </button>
      </div>

      {/* Hero Batch Banner: Warm, Inspiring, High-Contrast Educational Design */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-indigo-800/60 text-white shadow-xl p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400 via-indigo-400 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-3.5 max-w-xl">
            {/* Batch Tag */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('batch.targetBatch')}</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold px-2.5 py-1 rounded-full">
                ● {t('batch.offlineReady')}
              </span>
            </div>

            {/* Title & Teacher */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {t('batch.foundationCourse', { grade: gradeNumber })}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1">
                Language Phonics • Vedic Math • Basic Science • TaRL Level {assessedLevel}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-200">
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>{t('batch.faculty')}</span>
              </div>
            </div>

            {/* Features Row */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-200 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <VideoIcon className="w-4 h-4 text-amber-300" />
                <span>{t('batch.videoCount', { count: videoCount })}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <CheckSquare className="w-4 h-4 text-emerald-300" />
                <span>{t('batch.dppCount', { count: quizCount })}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <FileText className="w-4 h-4 text-sky-300" />
                <span>{t('batch.notesCount', { count: materialCount })}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/student/videos')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/40 transition-all min-h-[48px]"
              >
                <PlayCircle className="w-5 h-5" />
                <span>{t('batch.resumeLecture')}</span>
              </button>
              <button
                onClick={() => navigate('/student/lessons')}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all min-h-[48px]"
              >
                <span>{t('batch.exploreBatch')}</span>
              </button>
            </div>
          </div>

          {/* Right Banner Badge: Study Streak */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-3xl text-center space-y-2.5 min-w-[210px] shadow-lg">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 font-black text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
              <span>{t('streak.studyStreak')}</span>
            </div>
            <div className="text-3xl font-black text-white">{t('streak.daysCount', { days: 4 })}</div>
            <p className="text-[11px] text-slate-300">
              {t('streak.streakDays')}
            </p>
            <div className="pt-2 border-t border-slate-700/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('streak.accuracyTitle')}</span>
              <span className="text-base font-black text-emerald-400">{t('streak.accuracyValue')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Category Bar: Modern Pill Navigation with Lucide Icons */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: t('category.all'), icon: <Layers className="w-4 h-4" /> },
          { id: 'LANGUAGE', label: t('category.language'), icon: <BookOpen className="w-4 h-4" /> },
          { id: 'MATH', label: t('category.math'), icon: <Calculator className="w-4 h-4" /> },
          { id: 'SCIENCE', label: t('category.science'), icon: <Atom className="w-4 h-4" /> },
          { id: 'TESTS', label: t('category.tests'), icon: <Award className="w-4 h-4" /> },
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border min-h-[44px] ${
              activeSubjectTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span className={activeSubjectTab === tab.id ? 'text-white' : 'text-blue-600'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Section: Continue Watching / Recent Lecture */}
      {recentLesson && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* 16:9 Thumbnail Box */}
            <div
              onClick={() => navigate(`/student/lessons/${recentLesson.id}`)}
              className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center cursor-pointer group flex-shrink-0 overflow-hidden shadow-inner"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-indigo-950 flex items-center justify-center">
                <VideoIcon className="w-8 h-8 text-slate-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                ~{recentLesson.estimatedMinutes || 12}:00
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <PlayCircle className="w-5 h-5 fill-white text-blue-600" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {recentLesson.subject}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {t('common.grade')} {recentLesson.grade} • {t('common.level')} {recentLesson.level}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ● 65% {t('student.completed')}
                </span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight line-clamp-1">
                {recentLesson.title}
              </h4>

              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                {t('batch.faculty')}
              </p>

              {/* Progress Bar */}
              <div className="w-48 sm:w-64 bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                <div className="bg-blue-600 h-full rounded-full w-[65%]" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => navigate(`/student/lessons/${recentLesson.id}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs shadow-md shadow-blue-600/20 transition-all min-h-[44px]"
            >
              <span>{t('student.resumeLesson')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Section: My Batches & Subject Classrooms */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>{t('classrooms.title')}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('classrooms.subtitle')}
            </p>
          </div>

          <button
            onClick={() => navigate('/student/lessons')}
            className="text-xs font-black text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 min-h-[36px]"
          >
            <span>{t('classrooms.viewAll')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Language */}
          <div
            onClick={() => navigate('/student/lessons')}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-amber-400 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {t('classrooms.lecturesCount', { count: allLessons.filter((l) => l.subject === 'LANGUAGE').length || 1 })}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base group-hover:text-amber-700 transition-colors">
                {t('category.language')}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Phonics, letter recognition, vocabulary building & storytelling
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
              <span>{t('common.grade')} {gradeNumber} • {t('common.level')} 1-2</span>
              <span className="text-amber-600 font-black flex items-center gap-0.5">
                {t('classrooms.open')} <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2: Math */}
          <div
            onClick={() => navigate('/student/lessons')}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {t('classrooms.lecturesCount', { count: allLessons.filter((l) => l.subject === 'MATH').length || 1 })}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                {t('category.math')}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Counting, 2-digit addition, subtraction, visual mental math
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
              <span>{t('common.grade')} {gradeNumber} • {t('common.level')} 2-3</span>
              <span className="text-blue-600 font-black flex items-center gap-0.5">
                {t('classrooms.open')} <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 3: Science */}
          <div
            onClick={() => navigate('/student/lessons')}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Atom className="w-6 h-6" />
                </div>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {t('classrooms.lecturesCount', { count: allLessons.filter((l) => l.subject === 'SCIENCE').length || 1 })}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                {t('category.science')}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Plants, water cycle, animals, environment & basic science
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
              <span>{t('common.grade')} {gradeNumber} • {t('common.level')} 3</span>
              <span className="text-emerald-600 font-black flex items-center gap-0.5">
                {t('classrooms.open')} <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: OFFLINE BOOKS, STUDY MATERIALS & NOTES */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-indigo-600" />
              <span>{t('materials.title')}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('materials.subtitle')}
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            ● {t('materials.availableCount', { count: studyMaterials.length })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {studyMaterials.map((mat) => {
            const isTextbook = mat.type === 'TEXTBOOK';
            const isNotes = mat.type === 'NOTES';

            return (
              <div
                key={mat.id}
                onClick={() => setSelectedMaterial(mat)}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        isTextbook
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : isNotes
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isTextbook ? t('materials.textbook') : isNotes ? t('materials.notes') : t('materials.worksheet')}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {t('materials.pages', { count: mat.pages || 24 })}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                    {mat.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 font-medium">
                    {mat.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    {t('materials.offlineAvailable')}
                  </span>

                  <button className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:underline min-h-[36px]">
                    <span>{t('materials.read')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Daily Practice Problems (DPP) & Test Series */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <span>{t('dpp.title')}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('dpp.subtitle')}
            </p>
          </div>

          <button
            onClick={() => navigate('/student/quizzes')}
            className="text-xs font-black text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 min-h-[36px]"
          >
            <span>{t('dpp.allTests')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allQuizzes.slice(0, 2).map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between gap-4 hover:border-blue-400 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    DPP 0{idx + 1} • {q.subject}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('dpp.marksTotal', { marks: q.totalMarks })}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base line-clamp-1">
                  {q.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {t('dpp.questionsCount', { count: q.questions?.length || 2 })} • {t('dpp.passingMarks', { marks: q.passingMarks })}
                </p>
              </div>

              <button
                onClick={() => navigate(`/student/quizzes/${q.id}`)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs shadow-md shadow-blue-600/20 whitespace-nowrap min-h-[44px]"
              >
                {t('dpp.startDpp')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Welfare Portal Shortcut */}
      <div
        onClick={() => navigate('/schemes')}
        className="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white rounded-3xl p-5 sm:p-6 border border-amber-200/90 hover:border-amber-400 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              {t('nav.schemes')}
            </span>
            <h4 className="font-black text-slate-900 text-base sm:text-lg mt-1">
              {t('schemes.title')}
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              {t('schemes.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-black text-amber-900 bg-white px-4 py-2 rounded-xl border border-amber-300 shadow-sm min-h-[40px]">
          <span>{t('schemes.eligibilityCheck')}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* READING MODAL: BOOK / NOTES VIEWER */}
      {/* ========================================================================= */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400">
                  {selectedMaterial.type} • {t('common.grade')} {selectedMaterial.grade}
                </span>
                <h3 className="text-lg font-black">{selectedMaterial.title}</h3>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Reader */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
                <span>{t('materials.pages', { count: selectedMaterial.pages || 24 })}</span>
                <span className="text-emerald-600 font-bold">● {t('materials.offlineAvailable')}</span>
              </div>

              <div className="prose max-w-none text-slate-800 text-sm whitespace-pre-line leading-relaxed font-medium bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                {selectedMaterial.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  if ('speechSynthesis' in window && selectedMaterial.content) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(selectedMaterial.content.slice(0, 200));
                    u.lang = 'mr-IN';
                    window.speechSynthesis.speak(u);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 min-h-[44px]"
              >
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>{t('materials.readAloud')}</span>
              </button>

              <button
                onClick={() => setSelectedMaterial(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs min-h-[44px]"
              >
                {t('materials.closeReader')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
