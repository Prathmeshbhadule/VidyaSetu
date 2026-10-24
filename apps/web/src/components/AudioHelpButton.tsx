import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speechService } from '../services/speech.js';
import { useAuthStore } from '../store/useAuthStore.js';

interface AudioHelpButtonProps {
  text: string;
  audioUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AudioHelpButton: React.FC<AudioHelpButtonProps> = ({
  text,
  audioUrl,
  className = '',
  size = 'md',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const language = useAuthStore((state) => state.language);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      speechService.stop();
      setIsPlaying(false);
    } else {
      speechService.speak(text, language, audioUrl);
      setIsPlaying(true);
      // Auto-reset state after reasonable duration
      setTimeout(() => setIsPlaying(false), 5000);
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'w-9 h-9 min-h-[36px] min-w-[36px]'
      : size === 'lg'
      ? 'w-14 h-14 min-h-[56px] min-w-[56px]'
      : 'w-11 h-11 min-h-[44px] min-w-[44px]';

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={isPlaying ? 'Stop audio' : 'Listen aloud'}
      aria-label={isPlaying ? 'Stop audio' : 'Listen aloud'}
      className={`inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 active:bg-amber-300 border border-amber-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 ${sizeClasses} ${className}`}
    >
      {isPlaying ? (
        <VolumeX className="w-5 h-5 text-rose-600 animate-pulse" />
      ) : (
        <Volume2 className="w-5 h-5 text-amber-700" />
      )}
    </button>
  );
};
