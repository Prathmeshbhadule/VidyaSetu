import React, { useState, useRef, useEffect } from 'react';
import { offlineDb } from '../db/offline-db.js';
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
  videoUrl?: string;
  onComplete?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  subject,
  durationSec = 180,
  thumbnailUrl,
  videoUrl: propVideoUrl,
  onComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [effectiveDuration, setEffectiveDuration] = useState(durationSec);
  const [quality, setQuality] = useState<'240p' | '360p'>('240p');
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);

  // Actual local video URL (from props or IndexedDB Blob)
  const [activeMediaUrl, setActiveMediaUrl] = useState<string | null>(propVideoUrl || null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const storageKey = `vidya_video_pos_${videoId}`;

  // Check if an actual local video file was stored in offlineDb.videos
  useEffect(() => {
    let objectUrlToRevoke: string | null = null;

    async function checkOfflineVideoBlob() {
      if (propVideoUrl) {
        setActiveMediaUrl(propVideoUrl);
        return;
      }

      // Check by videoId or by lessonId
      const v =
        (await offlineDb.videos.get(videoId)) ||
        (await offlineDb.videos.where('lessonId').equals(videoId).first());

      if (v) {
        if (v.videoBlob) {
          const url = URL.createObjectURL(v.videoBlob);
          objectUrlToRevoke = url;
          setActiveMediaUrl(url);
        } else if (v.videoUrl) {
          setActiveMediaUrl(v.videoUrl);
        }
      }
    }

    checkOfflineVideoBlob();

    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [videoId, propVideoUrl]);

  useEffect(() => {
    // Restore resume position
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const pos = parseFloat(saved);
      if (pos > 5 && pos < effectiveDuration - 10) {
        setCurrentTime(pos);
        if (videoRef.current) {
          videoRef.current.currentTime = pos;
        }
        const mins = Math.floor(pos / 60);
        const secs = Math.floor(pos % 60);
        setResumeNotice(`Resumed at ${mins}:${secs < 10 ? '0' : ''}${secs}`);
        setTimeout(() => setResumeNotice(null), 4000);
      }
    }
  }, [videoId, effectiveDuration, storageKey]);

  // Periodic persistence of resume position
  useEffect(() => {
    if (currentTime > 0) {
      localStorage.setItem(storageKey, currentTime.toString());
    }
    if (currentTime >= effectiveDuration && !isCompleted) {
      setIsCompleted(true);
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
  }, [currentTime, effectiveDuration, isCompleted, onComplete, storageKey]);

  // Canvas educational fallback loop (when no real video file is present)
  useEffect(() => {
    if (activeMediaUrl) return; // If real video is playing, canvas loop is not needed

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
      setCurrentTime(localTime);

      // Draw background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated educational visuals
      const cycle = (localTime % 20) / 20;

      if (subject === 'MATH') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#60a5fa';
        ctx.textAlign = 'center';
        ctx.fillText('🔢 संख्याज्ञान व गणिताची मजेदार ओळख', canvas.width / 2, 60);

        const count = Math.min(10, Math.floor(localTime / 2) + 1);
        ctx.font = '36px sans-serif';
        for (let i = 0; i < count; i++) {
          const x = 80 + (i % 5) * 110;
          const y = 140 + Math.floor(i / 5) * 90;
          ctx.fillText('🍎', x, y);
          ctx.font = 'bold 16px sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(`${i + 1}`, x + 5, y + 30);
          ctx.font = '36px sans-serif';
        }

        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`मोजलेले सफरचंद: ${count} / १०`, canvas.width / 2, 310);
      } else if (subject === 'SCIENCE') {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0284c7');
        gradient.addColorStop(0.6, '#38bdf8');
        gradient.addColorStop(1, '#15803d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const sunX = 100 + cycle * 440;
        ctx.font = '48px sans-serif';
        ctx.fillText('☀️', sunX, 70);

        ctx.font = '40px sans-serif';
        ctx.fillText('☁️', 200, 110);
        ctx.fillText('☁️', 420, 95);

        ctx.font = '54px sans-serif';
        ctx.fillText('🌳', 150, 290);
        ctx.fillText('🌿', 260, 310);
        ctx.fillText('🌲', 480, 290);

        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('🌱 जलचक्र: सूर्यप्रकाश + पाणी = हिरवी झाडे व पाऊस', canvas.width / 2, 340);
      } else {
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#e0e7ff';
        ctx.textAlign = 'center';
        ctx.fillText('📖 मराठी व इंग्रजी वर्णमाला वाचन', canvas.width / 2, 60);

        const letters = ['क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ'];
        const activeIdx = Math.floor(localTime / 2) % letters.length;

        ctx.font = 'bold 84px sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(letters[activeIdx], canvas.width / 2, 190);

        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`अक्षर उच्चार: /${letters[activeIdx]}/`, canvas.width / 2, 260);
      }

      if (localTime < effectiveDuration) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
      } else {
        setIsPlaying(false);
        setIsCompleted(true);
      }
    };

    animationFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, effectiveDuration, playbackRate, subject, activeMediaUrl]);

  const togglePlay = () => {
    if (activeMediaUrl && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (activeMediaUrl && videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const skipSeconds = (seconds: number) => {
    const next = Math.max(0, Math.min(effectiveDuration, currentTime + seconds));
    setCurrentTime(next);
    if (activeMediaUrl && videoRef.current) {
      videoRef.current.currentTime = next;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800 select-none">
      {/* Resume Notice Banner */}
      {resumeNotice && (
        <div className="absolute top-4 left-4 z-30 bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-blue-400/40 animate-fade-in flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{resumeNotice}</span>
        </div>
      )}

      {/* Completion Modal Overlay */}
      {isCompleted && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/40 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            तासिका पूर्ण झाली! (Lecture Completed)
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-sm">
            शाब्बास! आपण संपूर्ण व्हिडिओ पाहिला आहे. आता सराव चाचणी सोडवून स्वतःचे मूल्यमापन करा.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentTime(0);
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                }
                setIsCompleted(false);
                setIsPlaying(true);
              }}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs"
            >
              पुन्हा पहा (Replay)
            </button>
            {onComplete && (
              <button
                onClick={onComplete}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md"
              >
                सराव चाचणी सोडवा (Solve DPP Quiz)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video Stage: Actual <video> element if local file exists, else Canvas */}
      <div
        className="relative w-full aspect-video bg-black flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={togglePlay}
        onMouseEnter={() => setShowControls(true)}
      >
        {activeMediaUrl ? (
          <video
            ref={videoRef}
            src={activeMediaUrl}
            className="w-full h-full object-contain"
            playsInline
            muted={isMuted}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current && videoRef.current.duration) {
                setEffectiveDuration(Math.floor(videoRef.current.duration));
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              setIsCompleted(true);
              if (onComplete) onComplete();
            }}
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-full object-contain"
          />
        )}

        {/* Big Center Play Button Overlay */}
        {!isPlaying && !isCompleted && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ring-4 ring-blue-500/30"
            >
              <Play className="w-9 h-9 fill-white ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 text-white">
        {/* Progress Slider */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 min-w-[36px]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={effectiveDuration}
            step={1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-blue-600 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono font-bold text-slate-400 min-w-[36px]">
            {formatTime(effectiveDuration)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all min-h-[40px] min-w-[40px] flex items-center justify-center shadow-md"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => skipSeconds(-10)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all min-h-[38px]"
              title="Rewind 10s"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={() => skipSeconds(10)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all min-h-[38px]"
              title="Forward 10s"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all min-h-[38px]"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-[10px] font-bold">
              {[1, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setPlaybackRate(rate);
                    if (videoRef.current) {
                      videoRef.current.playbackRate = rate;
                    }
                  }}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    playbackRate === rate ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Offline Quality Badge */}
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              ● {activeMediaUrl ? 'Local MP4' : '240p/360p'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
