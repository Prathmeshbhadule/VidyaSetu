import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  CheckCircle2,
  FastForward,
  Rewind,
  Settings,
} from 'lucide-react';
import { speechService } from '../services/speech.js';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  subject: string;
  durationSec: number;
  thumbnailUrl?: string;
  onComplete?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  subject,
  durationSec = 180,
  thumbnailUrl,
  onComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [quality, setQuality] = useState<'240p' | '360p'>('240p');
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  // Storage key for resume position
  const storageKey = `vidya_video_pos_${videoId}`;

  useEffect(() => {
    // Restore resume position
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const pos = parseFloat(saved);
      if (pos > 5 && pos < durationSec - 10) {
        setCurrentTime(pos);
        const mins = Math.floor(pos / 60);
        const secs = Math.floor(pos % 60);
        setResumeNotice(`Resumed at ${mins}:${secs < 10 ? '0' : ''}${secs}`);
        setTimeout(() => setResumeNotice(null), 4000);
      }
    }
  }, [videoId, durationSec, storageKey]);

  // Periodic persistence of resume position
  useEffect(() => {
    if (currentTime > 0) {
      localStorage.setItem(storageKey, currentTime.toString());
    }
    if (currentTime >= durationSec && !isCompleted) {
      setIsCompleted(true);
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
  }, [currentTime, durationSec, isCompleted, onComplete, storageKey]);

  // Canvas-based educational offline video animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimestampRef.current = null;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localTime = currentTime;

    const renderFrame = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const deltaSec = ((timestamp - lastTimestampRef.current) / 1000) * playbackRate;
      lastTimestampRef.current = timestamp;

      localTime += deltaSec;
      if (localTime >= durationSec) {
        localTime = durationSec;
        setCurrentTime(durationSec);
        setIsPlaying(false);
        setIsCompleted(true);
        if (onComplete) onComplete();
        return;
      }
      setCurrentTime(localTime);

      const w = canvas.width;
      const h = canvas.height;

      // Clean background
      ctx.fillStyle = '#0f172a'; // Deep slate
      ctx.fillRect(0, 0, w, h);

      // Blackboard / Educational Frame
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#064e3b'); // Dark chalkboard emerald
      gradient.addColorStop(1, '#022c22');
      ctx.fillStyle = gradient;
      ctx.roundRect ? ctx.roundRect(16, 16, w - 32, h - 32, 16) : ctx.fillRect(16, 16, w - 32, h - 32);
      ctx.fill();

      // Chalkboard Border
      ctx.strokeStyle = '#d97706'; // Warm Amber wood
      ctx.lineWidth = 8;
      ctx.stroke();

      // Draw Subject Badge
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`VIDYA SETU LECTURE • ${subject} (${quality})`, 36, 48);

      // Animated Subject Visualization
      const animProgress = (localTime % 6) / 6; // 6-second animation cycle

      if (subject.toUpperCase().includes('MATH')) {
        // Animated Counting Apples & Math Problem
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Fun with Numbers & Addition (अंक व बेरीज)', w / 2, 90);

        const appleCount = 3 + Math.floor((localTime / 15) % 5);
        ctx.font = '40px sans-serif';
        for (let i = 0; i < appleCount; i++) {
          const x = w / 2 - (appleCount * 30) + i * 60 + 20;
          const bounce = Math.sin(animProgress * Math.PI * 2 + i) * 12;
          ctx.fillText('🍎', x, 170 + bounce);
        }

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(`Count the apples: ${appleCount} Apples!`, w / 2, 240);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#a7f3d0';
        ctx.fillText(`${appleCount} + 2 more = ${appleCount + 2}`, w / 2, 280);
      } else if (subject.toUpperCase().includes('SCIENCE')) {
        // Animated Growing Plant / Sunlight
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Parts of a Plant & Photosynthesis (झाडाचे अवयव)', w / 2, 90);

        // Sun
        const sunRadius = 24 + Math.sin(animProgress * Math.PI * 2) * 4;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(w - 100, 90, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Sunlight rays
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w - 100, 90);
        ctx.lineTo(w / 2 + 20, 200);
        ctx.stroke();

        // Plant stem and leaves
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(w / 2, 300);
        ctx.lineTo(w / 2, 160);
        ctx.stroke();

        ctx.font = '44px sans-serif';
        ctx.fillText('🌿', w / 2 - 25, 200);
        ctx.fillText('🌸', w / 2 - 22, 150);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('Roots absorb water • Leaves make food using sunlight', w / 2, 290);
      } else {
        // Language & Phonics Alphabet Animation
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Alphabet, Phonics & Words (वर्णमाला व ध्वनी)', w / 2, 90);

        const letters = ['क', 'ख', 'ग', 'घ', 'च', 'म', 'ल'];
        const activeIdx = Math.floor((localTime / 4) % letters.length);
        const letter = letters[activeIdx];

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 84px sans-serif';
        ctx.fillText(letter, w / 2, 190);

        ctx.fillStyle = '#6ee7b7';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`Say the sound: /${letter}/ loudly!`, w / 2, 240);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('कमळ (Lotus) • घर (Home) • मोर (Peacock)', w / 2, 280);
      }

      // Audio waveform indicator if playing
      if (!isMuted) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 40; x < 140; x += 6) {
          const barHeight = Math.sin((localTime * 10) + x) * 10;
          ctx.moveTo(x, h - 45);
          ctx.lineTo(x, h - 45 - Math.abs(barHeight));
        }
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, durationSec, playbackRate, isMuted, quality, subject, onComplete]);

  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    if (next && !isMuted) {
      speechService.speak(
        `${title}. Video lecture playing in offline mode. Listen carefully to unlock your practice quiz.`,
        'hi'
      );
    } else {
      speechService.stop();
    }
  };

  const skipSeconds = (sec: number) => {
    const next = Math.max(0, Math.min(durationSec, currentTime + sec));
    setCurrentTime(next);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-slate-950 rounded-3xl overflow-hidden border-2 border-amber-300 shadow-2xl relative select-none">
      {/* Resume Toast */}
      {resumeNotice && (
        <div className="absolute top-4 left-4 z-30 bg-orange-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-fade-in flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{resumeNotice}</span>
        </div>
      )}

      {/* Completion Banner */}
      {isCompleted && (
        <div className="absolute inset-0 z-30 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/40 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-black text-amber-300">Video Lecture Finished!</h3>
          <p className="text-xs text-slate-300 max-w-sm mt-1">
            Great job! You have completed this lecture. Your practice quiz is now unlocked.
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setCurrentTime(0);
                setIsCompleted(false);
                setIsPlaying(true);
              }}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs"
            >
              Replay Lecture
            </button>
            {onComplete && (
              <button
                onClick={onComplete}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md"
              >
                Take Practice Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video / Canvas Stage */}
      <div
        className="relative w-full aspect-video bg-black flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
        onMouseEnter={() => setShowControls(true)}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full object-contain"
        />

        {/* Big Center Play Overlay */}
        {!isPlaying && !isCompleted && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
            >
              <Play className="w-9 h-9 fill-white ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Control Overlay Bar */}
      <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 text-white">
        {/* Progress Bar & Seek Slider */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 min-w-[36px]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={durationSec}
            step={1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-orange-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono font-bold text-slate-400 min-w-[36px]">
            {formatTime(durationSec)}
          </span>
        </div>

        {/* Control Buttons & Quality Settings */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => skipSeconds(-10)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="10s Back"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={() => skipSeconds(10)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="10s Forward"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="bg-slate-800 text-slate-200 text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
            >
              <option value="0.75">0.75x</option>
              <option value="1">1.0x (Normal)</option>
              <option value="1.25">1.25x</option>
            </select>

            {/* Quality Selector (240p/360p rural optimization) */}
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => setQuality('240p')}
                className={`px-2 py-1 text-[11px] font-black rounded-md transition-all ${
                  quality === '240p' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                240p
              </button>
              <button
                onClick={() => setQuality('360p')}
                className={`px-2 py-1 text-[11px] font-black rounded-md transition-all ${
                  quality === '360p' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                360p
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
