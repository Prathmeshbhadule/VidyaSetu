import React, { useState, useEffect } from 'react';
import { offlineDb } from '../../db/offline-db.js';
import { syncManager } from '../../services/sync-manager.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import {
  Lesson,
  Video,
  Quiz,
  Question,
  StudyMaterial,
  StudyMaterialType,
  generateUuidV7,
} from '@vidya-setu/shared';
import {
  BookOpen,
  Video as VideoIcon,
  CheckSquare,
  FileText,
  Plus,
  Save,
  CheckCircle2,
  Trash2,
  Package,
  Layers,
  Sparkles,
  Eye,
  Clock,
  HardDrive,
  Upload,
  ArrowRight,
} from 'lucide-react';

export const ContentAdminScreen: React.FC = () => {
  const { schoolId } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'videos' | 'quizzes' | 'materials' | 'catalog'>('videos');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Existing Data Counts
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);

  // Tab 1: Video Lecture Form State
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSubject, setVideoSubject] = useState('SCIENCE');
  const [videoGrade, setVideoGrade] = useState(3);
  const [videoLevel, setVideoLevel] = useState(3);
  const [videoDurationMinutes, setVideoDurationMinutes] = useState(12);
  const [videoTeacher, setVideoTeacher] = useState('सुनील पाटील सर (Sunil Patil Sir)');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoContentNotes, setVideoContentNotes] = useState('');
  const [videoStorageKey, setVideoStorageKey] = useState('offline-video-nature-walk');
  const [autoCreateDpp, setAutoCreateDpp] = useState(true);

  // Tab 2: Quiz / DPP Form State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('SCIENCE');
  const [quizGrade, setQuizGrade] = useState(3);
  const [quizTotalMarks, setQuizTotalMarks] = useState(10);
  const [quizPassingMarks, setQuizPassingMarks] = useState(6);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [questions, setQuestions] = useState<
    {
      prompt: string;
      options: { id: string; text: string }[];
      correctOptionId: string;
      explanation: string;
      marks: number;
    }[]
  >([
    {
      prompt: 'पाणी उष्णतेने वाफेत रूपांतरित होण्याच्या क्रियेला काय म्हणतात?',
      options: [
        { id: 'opt-a', text: 'बाष्पीभवन (Evaporation)' },
        { id: 'opt-b', text: 'संघनन (Condensation)' },
        { id: 'opt-c', text: 'गोठणे (Freezing)' },
        { id: 'opt-d', text: 'वितळणे (Melting)' },
      ],
      correctOptionId: 'opt-a',
      explanation: 'उष्णतेमुळे पाण्याचे वाफेत रूपांतर होणे म्हणजे बाष्पीभवन होय.',
      marks: 5,
    },
    {
      prompt: 'ढगांमधून जमिनीवर पडणाऱ्या पाण्याचे थेंब म्हणजे काय?',
      options: [
        { id: 'opt-a', text: 'पाऊस (Rain)' },
        { id: 'opt-b', text: 'धुके (Fog)' },
        { id: 'opt-c', text: 'हिम (Snow)' },
        { id: 'opt-d', text: 'गारा (Hail)' },
      ],
      correctOptionId: 'opt-a',
      explanation: 'ढगांमधील वाफेचे संघनन होऊन पाऊस पडतो.',
      marks: 5,
    },
  ]);

  // Tab 3: Study Material / Books Form State
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<StudyMaterialType>('TEXTBOOK');
  const [matSubject, setMatSubject] = useState('SCIENCE');
  const [matGrade, setMatGrade] = useState(3);
  const [matPages, setMatPages] = useState(32);
  const [matSizeBytes, setMatSizeBytes] = useState(3670016); // ~3.5MB
  const [matDescription, setMatDescription] = useState('');
  const [matContent, setMatContent] = useState('');

  // Tab 4: Content Pack State
  const [packVersion, setPackVersion] = useState(2);

  const notifySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const loadAllContent = async () => {
    const [lList, vList, qList, mList] = await Promise.all([
      offlineDb.lessons.toArray(),
      offlineDb.videos.toArray(),
      offlineDb.quizzes.toArray(),
      offlineDb.studyMaterials.toArray(),
    ]);
    setLessons(lList);
    setVideos(vList);
    setQuizzes(qList);
    setMaterials(mList);

    if (lList.length > 0 && !selectedLessonId) {
      setSelectedLessonId(lList[0].id);
    }
  };

  useEffect(() => {
    loadAllContent();
  }, []);

  // Submit Handler: Add Video Lecture
  const handleAddVideoLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    const lessonId = generateUuidV7();
    const videoId = generateUuidV7();
    const quizId = autoCreateDpp ? generateUuidV7() : undefined;

    // 1. Create Lesson Entity
    const newLesson: Lesson = {
      id: lessonId,
      schoolId: schoolId || 'global',
      title: videoTitle,
      subject: videoSubject,
      grade: Number(videoGrade),
      level: Number(videoLevel),
      contentBlocks: [
        {
          id: 'b1',
          type: 'HEADING',
          content: `${videoTitle} • Video Lesson Summary`,
        },
        {
          id: 'b2',
          type: 'PARAGRAPH',
          content:
            videoContentNotes ||
            videoDescription ||
            'Detailed chapter notes and curriculum overview presented by master faculty.',
        },
        {
          id: 'b3',
          type: 'CALLOUT',
          content: `Faculty: ${videoTeacher}. Watch the lecture video and solve the attached DPP quiz.`,
        },
      ],
      audioUrl: null,
      status: 'PUBLISHED',
      estimatedMinutes: Number(videoDurationMinutes),
      version: 1,
      deviceId: syncManager.getDeviceId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    // 2. Create Video Entity
    const newVideo: Video = {
      id: videoId,
      schoolId: schoolId || 'global',
      lessonId,
      title: videoTitle,
      storageKey: videoStorageKey,
      durationSec: Number(videoDurationMinutes) * 60,
      bitrateKbps: 360,
      sizeBytes: Number(videoDurationMinutes) * 1024 * 1024,
      sha256: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
      thumbnailUrl: '',
      transcodeStatus: 'READY',
      version: 1,
      deviceId: syncManager.getDeviceId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await offlineDb.lessons.put(newLesson);
    await offlineDb.videos.put(newVideo);

    // 3. Optional Auto-created DPP Quiz
    if (autoCreateDpp && quizId) {
      const dppQuiz: Quiz = {
        id: quizId,
        schoolId: schoolId || 'global',
        lessonId,
        title: `DPP • ${videoTitle}`,
        subject: videoSubject,
        grade: Number(videoGrade),
        totalMarks: 10,
        passingMarks: 6,
        version: 1,
        deviceId: syncManager.getDeviceId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        questions: [
          {
            id: 'dpp-q1',
            type: 'MCQ',
            prompt: `या पाठातील मुख्य संकल्पना कोणती आहे? (What is the key takeaway of ${videoTitle}?)`,
            options: [
              { id: 'opt1', text: 'मूलभूत संकल्पना व उपयोग (Core principles & usage)' },
              { id: 'opt2', text: 'केवळ पाठांतर (Only memorization)' },
              { id: 'opt3', text: 'काहीही नाही (None)' },
            ],
            correctOptionId: 'opt1',
            explanation: 'या पाठात वैज्ञानिक व व्यावहारिक संकल्पनांची माहिती दिली आहे.',
            level: Number(videoLevel),
            marks: 5,
          },
          {
            id: 'dpp-q2',
            type: 'TRUE_FALSE',
            prompt: 'हा घटक आपल्या दैनंदिन जीवनात उपयुक्त आहे का? (Is this concept useful in daily life?)',
            options: [
              { id: 'opt-t', text: 'होय (True)' },
              { id: 'opt-f', text: 'नाही (False)' },
            ],
            correctOptionId: 'opt-t',
            explanation: 'होय, हा घटक दैनंदिन वातावरणात प्रत्यक्ष पाहता येतो.',
            level: Number(videoLevel),
            marks: 5,
          },
        ],
      };
      await offlineDb.quizzes.put(dppQuiz);
    }

    notifySuccess(
      `🎉 व्हिडिओ तासिका "${videoTitle}" यशस्वीरित्या जोडली गेली! हे आता विद्यार्थ्यांच्या व्हिडिओ यादीत आणि डॅशबोर्डवर उपलब्ध आहे.`
    );
    setVideoTitle('');
    setVideoDescription('');
    setVideoContentNotes('');
    loadAllContent();
  };

  // Submit Handler: Add Quiz
  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    const quizId = generateUuidV7();
    const formattedQuestions: Question[] = questions.map((q, idx) => ({
      id: `q-${idx + 1}`,
      quizId,
      type: q.options.length === 2 ? 'TRUE_FALSE' : 'MCQ',
      prompt: q.prompt,
      options: q.options,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      level: 3,
      marks: Number(q.marks) || 5,
    }));

    const newQuiz: Quiz = {
      id: quizId,
      schoolId: schoolId || 'global',
      lessonId: selectedLessonId || generateUuidV7(),
      title: quizTitle,
      subject: quizSubject,
      grade: Number(quizGrade),
      totalMarks: Number(quizTotalMarks),
      passingMarks: Number(quizPassingMarks),
      questions: formattedQuestions,
      version: 1,
      deviceId: syncManager.getDeviceId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await offlineDb.quizzes.put(newQuiz);
    notifySuccess(
      `🎉 सराव चाचणी "${quizTitle}" यशस्वीरित्या तयार झाली! हे आता विद्यार्थ्यांच्या टेस्ट सिरीज व DPP मध्ये उपलब्ध आहे.`
    );
    setQuizTitle('');
    loadAllContent();
  };

  // Submit Handler: Add Study Material / Books
  const handleAddStudyMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;

    const matId = generateUuidV7();
    const newMaterial: StudyMaterial = {
      id: matId,
      schoolId: schoolId || 'global',
      title: matTitle,
      type: matType,
      subject: matSubject,
      grade: Number(matGrade),
      pages: Number(matPages),
      sizeBytes: Number(matSizeBytes),
      description:
        matDescription ||
        'महाराष्ट्र राज्य पाठ्यपुस्तक निर्मिती व अभ्यासक्रम संशोधन मंडळ (बालभारती) अधिकृत अभ्यास साहित्य.',
      content:
        matContent ||
        `${matTitle}\n\nप्रकरण १: परिचय व पूर्वतयारी\nया पाठ्यपुस्तकात विद्यार्थ्यांसाठी सोप्या भाषेत रंगीत चित्रे आणि कृतियुक्त स्वाध्याय समाविष्ट केलेले आहेत.\n\nप्रकरण २: मुख्य संकल्पना व उदाहरणे\n१. प्रत्येक घटकाचे सविस्तर स्पष्टीकरण.\n२. दैनंदिन व्यवहारातील उदाहरणे व गमतीशीर कोडी.\n३. शिक्षकांसाठी मार्गदर्शन सूचना व मूल्यमापन स्वाध्याय.`,
      downloadUrl: `/materials/${matTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      offlineReady: true,
      version: 1,
      deviceId: syncManager.getDeviceId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await offlineDb.studyMaterials.put(newMaterial);
    notifySuccess(
      `🎉 अभ्यास साहित्य "${matTitle}" यशस्वीरित्या जोडले गेले! हे आता विद्यार्थ्यांच्या अभ्यास साहित्य विभागात उपलब्ध आहे.`
    );
    setMatTitle('');
    setMatDescription('');
    setMatContent('');
    loadAllContent();
  };

  // Helper to add extra question in Quiz tab
  const addQuestionField = () => {
    setQuestions([
      ...questions,
      {
        prompt: `नवीन प्रश्न क्रमांक ${questions.length + 1}`,
        options: [
          { id: 'opt-a', text: 'पर्याय १ (Option A)' },
          { id: 'opt-b', text: 'पर्याय २ (Option B)' },
          { id: 'opt-c', text: 'पर्याय ३ (Option C)' },
          { id: 'opt-d', text: 'पर्याय ४ (Option D)' },
        ],
        correctOptionId: 'opt-a',
        explanation: 'योग्य उत्तराचे स्पष्टीकरण.',
        marks: 5,
      },
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 pb-36 space-y-6">
      {/* Studio Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              TEACHER & CONTENT STUDIO
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              ● Live Sync to Student Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            अभ्यासक्रम व साहित्य व्यवस्थापन स्टुडिओ
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
            येथे व्हिडिओ तासिका, सराव चाचण्या (DPP) आणि पाठ्यपुस्तके व हस्तलिखित नोट्स अपलोड करा. सर्व साहित्य तत्काळ विद्यार्थ्यांच्या टॅब्लेटवर दिसेल.
          </p>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center min-w-[90px]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">व्हिडिओ</span>
            <span className="text-xl font-black text-blue-400">{videos.length || lessons.length}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center min-w-[90px]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">चाचण्या</span>
            <span className="text-xl font-black text-amber-400">{quizzes.length}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center min-w-[90px]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">पुस्तके/नोट्स</span>
            <span className="text-xl font-black text-emerald-400">{materials.length}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center min-w-[90px]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">धडे</span>
            <span className="text-xl font-black text-purple-400">{lessons.length}</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-center gap-3 font-bold text-xs sm:text-sm shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'videos', label: '🎬 व्हिडिओ तासिका जोडा (Add Video)', icon: VideoIcon, count: videos.length },
          { id: 'quizzes', label: '📝 सराव चाचणी तयार करा (Create DPP)', icon: CheckSquare, count: quizzes.length },
          { id: 'materials', label: '📚 पुस्तके व नोट्स अपलोड करा (Upload Books)', icon: FileText, count: materials.length },
          { id: 'catalog', label: '📋 सर्व साहित्य यादी (Live Catalog)', icon: Layers, count: lessons.length + quizzes.length + materials.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ADD VIDEO LECTURE */}
      {/* ========================================================================= */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <VideoIcon className="w-6 h-6 text-blue-600" />
                नवीन व्हिडिओ तासिका अपलोड करा (Add Actual Video Lecture)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                240p/360p ऑफलाइन कॉम्प्रेशनसह व्हिडिओ जोडा. विद्यार्थी ऑफलाइन असतानाही हा व्हिडिओ पाहू शकतील.
              </p>
            </div>

            <form onSubmit={handleAddVideoLecture} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  तासिकेचे नाव (Video Lecture Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. जलचक्र आणि पाऊस • Water Cycle Explained"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">विषय (Subject)</label>
                  <select
                    value={videoSubject}
                    onChange={(e) => setVideoSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                  >
                    <option value="LANGUAGE">मराठी व इंग्रजी भाषा (Language)</option>
                    <option value="MATH">गणित व संख्याज्ञान (Mathematics)</option>
                    <option value="SCIENCE">परिसर अभ्यास व विज्ञान (Science)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">इयत्ता (Grade)</label>
                  <select
                    value={videoGrade}
                    onChange={(e) => setVideoGrade(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                      <option key={g} value={g}>
                        इयत्ता {g} री (Class {g})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">TaRL स्तर (Level 1-5)</label>
                  <select
                    value={videoLevel}
                    onChange={(e) => setVideoLevel(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                  >
                    <option value={1}>Level 1: अक्षर / अंक ओळख</option>
                    <option value={2}>Level 2: शब्द / बेरीज-वजाबाकी</option>
                    <option value={3}>Level 3: परिच्छेद / गुणाकार</option>
                    <option value={4}>Level 4: गोष्ट / भागाकार</option>
                    <option value={5}>Level 5: प्रगत आकलन</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    कालावधी (Duration in Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={videoDurationMinutes}
                    onChange={(e) => setVideoDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    शिक्षकांचे नाव (Faculty / Teacher)
                  </label>
                  <input
                    type="text"
                    value={videoTeacher}
                    onChange={(e) => setVideoTeacher(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  व्हिडिओ स्रोत / स्टोरेज की (Offline Video Asset)
                </label>
                <select
                  value={videoStorageKey}
                  onChange={(e) => setVideoStorageKey(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                >
                  <option value="offline-video-nature-walk">
                    Offline Animated Science Simulation (240p/360p • Nature & Earth)
                  </option>
                  <option value="offline-video-math-numbers">
                    Offline Interactive Counting & Abacus (240p • Math Demo)
                  </option>
                  <option value="offline-video-alphabet-phonics">
                    Offline Phonics & Vernacular Letters (240p • Marathi/Hindi)
                  </option>
                  <option value="custom-local-hub">Custom School Hub Video File (/storage/hub/video_01.mp4)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  थोडक्यात माहिती व शिकण्याचे उद्दिष्ट (Overview / Learning Outcome)
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. या पाठात जलचक्राचे तीन मुख्य टप्पे - बाष्पीभवन, संघनन आणि पाऊस - सोप्या भाषेत दाखवले आहेत."
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoDpp"
                  checked={autoCreateDpp}
                  onChange={(e) => setAutoCreateDpp(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <label htmlFor="autoDpp" className="text-xs font-bold text-slate-800 cursor-pointer">
                  या व्हिडिओसोबत आपोआप २ प्रश्नांची सराव चाचणी (DPP) जोडा (Auto-create linked DPP Practice Quiz)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>व्हिडिओ तासिका प्रकाशित करा (Publish Video to Student Portal)</span>
              </button>
            </form>
          </div>

          {/* Right: Live Preview & Guidance */}
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-3xl p-5 text-white border border-slate-800 shadow-md">
              <span className="text-[10px] uppercase font-black text-blue-400 tracking-wider">
                STUDENT PORTAL LIVE PREVIEW
              </span>
              <div className="mt-3 aspect-video rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                <VideoIcon className="w-10 h-10 text-blue-400 mb-2 animate-pulse" />
                <h4 className="font-bold text-sm text-white line-clamp-1">
                  {videoTitle || 'व्हिडिओ तासिकेचे नाव'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Grade {videoGrade} • {videoDurationMinutes} Min • {videoSubject}
                </p>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-medium">
                <div className="flex items-center justify-between">
                  <span>Faculty:</span>
                  <span className="font-bold text-white">{videoTeacher}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Offline Resolution:</span>
                  <span className="font-bold text-emerald-400">240p / 360p H.264</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>DPP Test Attached:</span>
                  <span className="font-bold text-amber-400">{autoCreateDpp ? 'होय (Yes)' : 'नाही'}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 text-xs text-blue-900 space-y-2">
              <h4 className="font-black text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                ग्रामीण शाळांसाठी वैशिष्ट्ये
              </h4>
              <p>
                १. व्हिडिओ अपलोड होताच तो स्थानिक <strong>Dexie DB</strong> व <strong>School Hub</strong> वर स्टोअर होतो.
              </p>
              <p>
                २. विद्यार्थ्यांच्या <strong>/student/videos</strong> आणि होमस्क्रीनवर हा व्हिडिओ तत्काळ दिसेल.
              </p>
              <p>
                ३. विद्यार्थी व्हिडिओ पाहताना कुठे थांबले होते ती पोझिशन (Resume timestamp) सेव्ह राहते.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CREATE QUIZ / DPP */}
      {/* ========================================================================= */}
      {activeTab === 'quizzes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-emerald-600" />
              नवीन सराव चाचणी (DPP / Quiz) तयार करा
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              विद्यार्थ्यांसाठी बहुपर्यायी प्रश्न (MCQ) तयार करा. चाचणी पूर्ण झाल्यावर विद्यार्थ्यांना गुण आणि स्पष्टीकरण दिसेल.
            </p>
          </div>

          <form onSubmit={handleAddQuiz} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  चाचणीचे नाव (Quiz / DPP Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. गणित बेरीज व संख्याज्ञान दैनंदिन सराव (DPP 03)"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  संबंधित धडा / व्हिडिओ (Link to Lesson)
                </label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                >
                  <option value="">स्वतंत्र चाचणी (Standalone Quiz)</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      [{l.subject}] {l.title} (Grade {l.grade})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विषय (Subject)</label>
                <select
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                >
                  <option value="LANGUAGE">भाषा (Language)</option>
                  <option value="MATH">गणित (Math)</option>
                  <option value="SCIENCE">विज्ञान (Science)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">इयत्ता (Grade)</label>
                <select
                  value={quizGrade}
                  onChange={(e) => setQuizGrade(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                    <option key={g} value={g}>
                      इयत्ता {g} री
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">एकूण गुण (Total Marks)</label>
                <input
                  type="number"
                  value={quizTotalMarks}
                  onChange={(e) => setQuizTotalMarks(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">उत्तीर्ण गुण (Passing)</label>
                <input
                  type="number"
                  value={quizPassingMarks}
                  onChange={(e) => setQuizPassingMarks(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                />
              </div>
            </div>

            {/* Dynamic Question Builder */}
            <div className="border-t border-slate-200 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <span>प्रश्न संच (Questions: {questions.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={addQuestionField}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-black text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ आणखी एक प्रश्न जोडा (Add Question)</span>
                </button>
              </div>

              {questions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                      प्रश्न {qIndex + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuestions(questions.filter((_, idx) => idx !== qIndex))}
                        className="text-xs text-rose-600 hover:underline font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>काढून टाका</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      प्रश्नाचा मजकूर (Question Prompt)
                    </label>
                    <input
                      type="text"
                      required
                      value={q.prompt}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].prompt = e.target.value;
                        setQuestions(updated);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIndex) => (
                      <div key={opt.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctOptionId === opt.id}
                          onChange={() => {
                            const updated = [...questions];
                            updated[qIndex].correctOptionId = opt.id;
                            setQuestions(updated);
                          }}
                          className="w-4 h-4 text-emerald-600"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIndex].options[optIndex].text = e.target.value;
                            setQuestions(updated);
                          }}
                          className="flex-1 text-xs font-medium text-slate-800 border-none focus:outline-none"
                          placeholder={`पर्याय ${optIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      योग्य उत्तराचे स्पष्टीकरण (Explanation / Solution Note)
                    </label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].explanation = e.target.value;
                        setQuestions(updated);
                      }}
                      placeholder="उदा. उत्तर बरोबर का आहे याचे कारण..."
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>सराव चाचणी प्रकाशित करा (Publish Quiz to Student Portal)</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: UPLOAD STUDY MATERIAL / NOTES / BOOKS */}
      {/* ========================================================================= */}
      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                पाठ्यपुस्तके व हस्तलिखित नोट्स जोडा (Add Books & Study Material)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                बालभारती शासकीय पुस्तके, शिक्षकांच्या हस्तलिखित नोट्स आणि स्वाध्याय पत्रिका जोडा. विद्यार्थी ऑफलाइन वाचू शकतील.
              </p>
            </div>

            <form onSubmit={handleAddStudyMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पुस्तकाचे किंवा साहित्याचे नाव (Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. इयत्ता ३ री परिसर अभ्यास पाठ्यपुस्तक - बालभारती"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">प्रकार (Type)</label>
                  <select
                    value={matType}
                    onChange={(e) => setMatType(e.target.value as StudyMaterialType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                  >
                    <option value="TEXTBOOK">📖 शासकीय पुस्तक (Textbook)</option>
                    <option value="NOTES">📝 हस्तलिखित नोट्स (Notes)</option>
                    <option value="WORKSHEET">📑 स्वाध्याय पत्रिका (Worksheet)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">विषय (Subject)</label>
                  <select
                    value={matSubject}
                    onChange={(e) => setMatSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                  >
                    <option value="LANGUAGE">भाषा (Language)</option>
                    <option value="MATH">गणित (Math)</option>
                    <option value="SCIENCE">विज्ञान व परिसर अभ्यास</option>
                    <option value="GENERAL">सामान्य ज्ञान (General)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">इयत्ता (Grade)</label>
                  <select
                    value={matGrade}
                    onChange={(e) => setMatGrade(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                      <option key={g} value={g}>
                        इयत्ता {g} री
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    एकूण पृष्ठे (Total Pages)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={matPages}
                    onChange={(e) => setMatPages(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    फाइल आकार (Size in MB)
                  </label>
                  <input
                    type="text"
                    value={`${(matSizeBytes / (1024 * 1024)).toFixed(1)} MB`}
                    disabled
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  साहित्याचे सविस्तर वाचन / नोट्स मजकूर (Reading Content & Key Notes)
                </label>
                <textarea
                  rows={6}
                  placeholder="येथे पाठातील मुख्य मुद्दे, स्वाध्याय किंवा पुस्तकातील प्रकरणे टाईप करा..."
                  value={matContent}
                  onChange={(e) => setMatContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium text-xs leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>अभ्यास साहित्य अपलोड करा (Publish to Student Portal)</span>
              </button>
            </form>
          </div>

          {/* Right: Info Card */}
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 text-purple-950 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-md">
                📚
              </div>
              <h3 className="font-black text-base">ऑफलाइन पाठ्यपुस्तके व स्वाध्याय</h3>
              <p className="text-xs text-purple-900 font-medium leading-relaxed">
                अपलोड केलेले कोणतेही पुस्तक किंवा नोट्स थेट विद्यार्थ्यांच्या पोर्टलवर उपलब्ध होतात.
              </p>
              <ul className="text-xs text-purple-900 space-y-1.5 list-disc pl-4 font-medium">
                <li>विद्यार्थी थेट टॅब्लेटवर पुस्तक वाचू शकतात.</li>
                <li>प्रकरणांचे रंगीत स्पष्टीकरण उपलब्ध होते.</li>
                <li>इंटरनेट नसतानाही संपूर्ण पुस्तक उघडते.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LIVE CATALOG & ALL CONTENT */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>स्थानिक अभ्यासक्रम कॅटलॉग (Local Curriculum & Assets)</span>
            </h3>

            {/* Video Lectures Sub-list */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                व्हिडिओ तासिका ({lessons.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lessons.map((l) => (
                  <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {l.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-600">Grade {l.grade}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{l.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                      ● Published
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quizzes Sub-list */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                सराव चाचण्या / DPP ({quizzes.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizzes.map((q) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {q.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-600">Grade {q.grade} • {q.questions?.length || 2} Qs</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{q.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                      {q.totalMarks} Marks
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Materials Sub-list */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                पुस्तके व अभ्यास साहित्य ({materials.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {materials.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          {m.type}
                        </span>
                        <span className="text-xs font-bold text-slate-600">Grade {m.grade} • {m.pages || 24} Pages</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                      Offline Ready
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
