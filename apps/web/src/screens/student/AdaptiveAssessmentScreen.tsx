import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { offlineDb } from '../../db/offline-db.js';
import { syncManager } from '../../services/sync-manager.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import {
  evaluateAdaptiveAssessment,
  INITIAL_ADAPTIVE_LEVEL,
  MAX_ADAPTIVE_QUESTIONS,
  AdaptiveStep,
  Question,
  generateUuidV7,
} from '@vidya-setu/shared';
import { AudioHelpButton } from '../../components/AudioHelpButton.js';
import { Mic, MicOff, Check, X, Sparkles, GraduationCap, ArrowRight, Home } from 'lucide-react';

// Graded question bank for Levels 1 to 5
const ADAPTIVE_QUESTION_BANK: Record<number, Question[]> = {
  1: [
    {
      id: 'ad-q1-1',
      type: 'MCQ',
      prompt: 'Identify the letter with the sound /ka/:',
      options: [
        { id: 'opt1', text: 'क' },
        { id: 'opt2', text: 'म' },
        { id: 'opt3', text: 'र' },
      ],
      correctOptionId: 'opt1',
      level: 1,
      marks: 1,
    },
    {
      id: 'ad-q1-2',
      type: 'MCQ',
      prompt: 'Count the stars: ⭐ ⭐ ⭐ ⭐',
      options: [
        { id: 'opt1', text: '4' },
        { id: 'opt2', text: '3' },
        { id: 'opt3', text: '5' },
      ],
      correctOptionId: 'opt1',
      level: 1,
      marks: 1,
    },
  ],
  2: [
    {
      id: 'ad-q2-1',
      type: 'MCQ',
      prompt: 'Read the word: घर (Ghar). What does it mean?',
      options: [
        { id: 'opt1', text: 'House / Home' },
        { id: 'opt2', text: 'Tree' },
        { id: 'opt3', text: 'Water' },
      ],
      correctOptionId: 'opt1',
      level: 2,
      marks: 1,
    },
    {
      id: 'ad-q2-2',
      type: 'MCQ',
      prompt: 'What is 7 + 5?',
      options: [
        { id: 'opt1', text: '12' },
        { id: 'opt2', text: '11' },
        { id: 'opt3', text: '13' },
      ],
      correctOptionId: 'opt1',
      level: 2,
      marks: 1,
    },
  ],
  3: [
    {
      id: 'ad-q3-1',
      type: 'MCQ',
      prompt: 'Complete the sentence: सूर्य ____ दिशेला उगवतो. (The sun rises in the ____.)',
      options: [
        { id: 'opt1', text: 'पूर्व (East)' },
        { id: 'opt2', text: 'पश्चिम (West)' },
        { id: 'opt3', text: 'उत्तर (North)' },
      ],
      correctOptionId: 'opt1',
      level: 3,
      marks: 1,
    },
    {
      id: 'ad-q3-2',
      type: 'MCQ',
      prompt: 'Solve: 45 - 18 = ?',
      options: [
        { id: 'opt1', text: '27' },
        { id: 'opt2', text: '23' },
        { id: 'opt3', text: '37' },
      ],
      correctOptionId: 'opt1',
      level: 3,
      marks: 1,
    },
  ],
  4: [
    {
      id: 'ad-q4-1',
      type: 'MCQ',
      prompt: 'A farmer plants 6 rows of tomato saplings, with 8 saplings in each row. How many saplings in total?',
      options: [
        { id: 'opt1', text: '48' },
        { id: 'opt2', text: '42' },
        { id: 'opt3', text: '54' },
      ],
      correctOptionId: 'opt1',
      level: 4,
      marks: 1,
    },
    {
      id: 'ad-q4-2',
      type: 'MCQ',
      prompt: 'Which part of the plant prepares food through photosynthesis?',
      options: [
        { id: 'opt1', text: 'Leaves (पाने)' },
        { id: 'opt2', text: 'Roots (मुळे)' },
        { id: 'opt3', text: 'Bark (खोड)' },
      ],
      correctOptionId: 'opt1',
      level: 4,
      marks: 1,
    },
  ],
  5: [
    {
      id: 'ad-q5-1',
      type: 'MCQ',
      prompt: 'If a water tank has 120 liters and leaks 15 liters per hour, how many hours until it is half full (60 L)?',
      options: [
        { id: 'opt1', text: '4 hours' },
        { id: 'opt2', text: '3 hours' },
        { id: 'opt3', text: '5 hours' },
      ],
      correctOptionId: 'opt1',
      level: 5,
      marks: 1,
    },
  ],
};

export const AdaptiveAssessmentScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentStudent, setCurrentStudent } = useAuthStore();

  const [history, setHistory] = useState<AdaptiveStep[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(INITIAL_ADAPTIVE_LEVEL);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [assessedLevel, setAssessedLevel] = useState<number>(INITIAL_ADAPTIVE_LEVEL);
  const [isListening, setIsListening] = useState(false);

  // Pick question matching currentLevel not yet answered
  const candidatePool = ADAPTIVE_QUESTION_BANK[currentLevel] || ADAPTIVE_QUESTION_BANK[3];
  const answeredIds = new Set(history.map((h) => h.questionId));
  const currentQuestion = candidatePool.find((q) => !answeredIds.has(q.id)) || candidatePool[0];

  const handleSelectOption = async (optionId: string) => {
    if (isRevealed) return;
    setSelectedOption(optionId);
    setIsRevealed(true);

    const isCorrect = optionId === currentQuestion.correctOptionId;
    const newStep: AdaptiveStep = {
      questionId: currentQuestion.id,
      level: currentLevel,
      isCorrect,
    };

    const nextHistory = [...history, newStep];
    setHistory(nextHistory);

    const evaluation = evaluateAdaptiveAssessment(nextHistory);

    setTimeout(async () => {
      if (evaluation.isComplete && evaluation.assessedLevel) {
        setAssessedLevel(evaluation.assessedLevel);
        setIsCompleted(true);

        // Update student profile in local Dexie database and queue outbox mutation
        if (currentStudent) {
          const updatedStudent = {
            ...currentStudent,
            assessedLevel: evaluation.assessedLevel,
            updatedAt: new Date().toISOString(),
          };
          await syncManager.mutate(
            'StudentProfile',
            offlineDb.students,
            updatedStudent,
            'UPDATE',
            1
          );
          setCurrentStudent(updatedStudent);
        }
      } else {
        setCurrentLevel(evaluation.nextLevel ?? currentLevel);
        setSelectedOption(null);
        setIsRevealed(false);
      }
    }, 1200);
  };

  // Optional Voice Input via Web Speech API
  const handleVoiceAnswer = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported on this browser. Please tap an answer.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        setIsListening(false);
        const transcript = event.results[0][0].transcript.toLowerCase();
        // Match transcript with options
        const match = currentQuestion.options.find(
          (opt) => opt.text.toLowerCase().includes(transcript) || transcript.includes(opt.text.toLowerCase())
        );
        if (match) {
          handleSelectOption(match.id);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 pb-36 text-center animate-fade-in">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 animate-bounce">
            <GraduationCap className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
            {t('adaptive.resultTitle')}
          </h2>
          <p className="text-sm font-semibold text-slate-600 mb-6">
            Teaching at the Right Level (TaRL) Assessment
          </p>

          <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 mb-6">
            <span className="text-xs uppercase font-extrabold text-emerald-800 tracking-wider">
              Assessed Learning Level
            </span>
            <div className="text-4xl font-black text-emerald-950 mt-1">
              Level {assessedLevel}
            </div>
            <p className="text-xs font-bold text-emerald-700 mt-2">
              Evaluated across {history.length} adaptive staircase items
            </p>
          </div>

          <button
            onClick={() => navigate('/student/home')}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md hover:bg-blue-700 transition-all min-h-[48px]"
          >
            <Home className="w-5 h-5" />
            <span>Go to My Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-36">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            {t('adaptive.questionOutOf', { current: history.length + 1, max: MAX_ADAPTIVE_QUESTIONS })}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Difficulty: Level {currentLevel} of 5
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Input Button */}
          <button
            onClick={handleVoiceAnswer}
            title="Answer with voice"
            className={`p-2.5 rounded-full border shadow-sm transition-all min-h-[40px] min-w-[40px] ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse border-rose-600'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <AudioHelpButton text={currentQuestion.prompt} size="sm" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((history.length + 1) / MAX_ADAPTIVE_QUESTIONS) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 leading-relaxed">
          {currentQuestion.prompt}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrect = opt.id === currentQuestion.correctOptionId;

            let bg = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900';
            if (isRevealed) {
              if (isCorrect) {
                bg = 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm';
              } else if (isSelected) {
                bg = 'bg-rose-50 border-rose-500 text-rose-950 shadow-sm';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isRevealed}
                className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-xl border font-bold text-base sm:text-lg transition-all text-left min-h-[56px] ${bg}`}
              >
                <span>{opt.text}</span>
                {isRevealed && (
                  <div>
                    {isCorrect && <Check className="w-6 h-6 text-emerald-600 stroke-[3]" />}
                    {isSelected && !isCorrect && <X className="w-6 h-6 text-rose-600 stroke-[3]" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
