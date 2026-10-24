import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { VideoPlayer } from '../../components/VideoPlayer.js';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import {
  PlayCircle,
  Video as VideoIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  Clock,
  HardDrive,
} from 'lucide-react';

interface LectureItem {
  id: string;
  lessonId: string;
  quizId: string;
  title: string;
  subject: string;
  grade: number;
  level: number;
  durationSec: number;
  sizeMb: number;
  description: string;
}

const sampleLectures: LectureItem[] = [
  {
    id: 'vid-01',
    lessonId: '018f679a-ls01-7000-8000-000000000001',
    quizId: 'quiz-default',
    title: 'Our Alphabet and Phonics (वर्णमाला व ध्वनी)',
    subject: 'LANGUAGE',
    grade: 1,
    level: 1,
    durationSec: 180,
    sizeMb: 12,
    description: 'Learn letter sounds, phonics, and basic word association with animated visual demonstrations.',
  },
  {
    id: 'vid-02',
    lessonId: '018f679a-ls02-7000-8000-000000000002',
    quizId: 'quiz-math-01',
    title: 'Numbers and Counting 1 to 20 (अंक आणि मोजणी)',
    subject: 'MATH',
    grade: 2,
    level: 2,
    durationSec: 240,
    sizeMb: 15,
    description: 'Interactive counting with apples, single-digit addition, and number sequence recognition.',
  },
  {
    id: 'vid-03',
    lessonId: '018f679a-ls03-7000-8000-000000000003',
    quizId: 'quiz-sci-01',
    title: 'Plants and Trees Around Us (आपल्या सभोवतालची झाडे)',
    subject: 'SCIENCE',
    grade: 3,
    level: 3,
    durationSec: 210,
    sizeMb: 14,
    description: 'Explore plant roots, green leaves, photosynthesis, and how trees help our environment.',
  },
  {
    id: 'vid-04',
    lessonId: '018f679a-ls02-7000-8000-000000000002',
    quizId: 'quiz-math-01',
    title: 'Fun Addition & Subtraction (मजेदार बेरीज)',
    subject: 'MATH',
    grade: 2,
    level: 2,
    durationSec: 195,
    sizeMb: 13,
    description: 'Simple mental math addition tricks using pebbles, sticks, and visual groups.',
  },
];

export const VideoLecturesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [activeLecture, setActiveLecture] = useState<LectureItem>(sampleLectures[0]);

  const subjects = ['ALL', 'LANGUAGE', 'MATH', 'SCIENCE'];

  const filteredLectures = selectedSubject === 'ALL'
    ? sampleLectures
    : sampleLectures.filter((item) => item.subject === selectedSubject);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-28">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <button
            onClick={() => navigate('/student/home')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-all mb-2 min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('common.back')}</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
            <VideoIcon className="w-7 h-7 text-orange-600" />
            <span>Video Lectures (व्हिडिओ व्याख्याने)</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-800 font-medium mt-0.5">
            Offline 240p/360p video lessons with seekable playback and practice quizzes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AudioHelpButton text="येथे आपण सर्व व्हिडिओ पाठ पाहू शकता. व्हिडिओ संपल्यानंतर सराव चाचणी सुरू होईल." size="sm" />
        </div>
      </div>

      {/* Active Video Player Stage */}
      {activeLecture && (
        <div className="mb-8">
          <VideoPlayer
            videoId={activeLecture.id}
            title={activeLecture.title}
            subject={activeLecture.subject}
            durationSec={activeLecture.durationSec}
            onComplete={() => {
              // Automatically triggers quiz unlock action
            }}
          />

          {/* Under-Video Lecture Meta */}
          <div className="bg-white rounded-2xl p-5 border-2 border-amber-200 shadow-sm mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-extrabold text-[11px] uppercase">
                  {activeLecture.subject}
                </span>
                <span className="text-xs font-bold text-amber-700">
                  Grade {activeLecture.grade} • Level {activeLecture.level}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Cached Offline
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-amber-950">
                {activeLecture.title}
              </h3>
              <p className="text-xs text-amber-800 font-medium mt-1">
                {activeLecture.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/student/quizzes/${activeLecture.quizId}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition-all min-h-[44px]"
              >
                <span>Take Practice Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Filter Tabs */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-black text-lg text-amber-950 flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-orange-600" />
          <span>All Video Lessons ({filteredLectures.length})</span>
        </h4>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all min-h-[36px] ${
                selectedSubject === sub
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-100/50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredLectures.map((lecture) => {
          const isSelected = activeLecture?.id === lecture.id;
          const mins = Math.floor(lecture.durationSec / 60);

          return (
            <div
              key={lecture.id}
              onClick={() => {
                setActiveLecture(lecture);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`rounded-3xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-100/50 border-orange-500 shadow-md ring-2 ring-orange-400/40'
                  : 'bg-white border-amber-200 hover:border-orange-400 hover:shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-extrabold text-[11px] uppercase">
                    {lecture.subject}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    <span>~{mins} min</span>
                  </div>
                </div>

                <h4 className="font-extrabold text-amber-950 text-base leading-snug line-clamp-2">
                  {lecture.title}
                </h4>

                <p className="text-xs text-amber-800 line-clamp-2 mt-1 font-medium">
                  {lecture.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-amber-100">
                <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                  {lecture.sizeMb} MB • 240p/360p
                </span>

                <div className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600">
                  <span>{isSelected ? 'Now Playing' : 'Play Video'}</span>
                  <PlayCircle className="w-4 h-4 fill-orange-600 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
