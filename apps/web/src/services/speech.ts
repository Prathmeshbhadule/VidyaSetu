export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isAvailable(): boolean {
    return this.synth !== null;
  }

  public speak(text: string, language: string = 'hi', audioFallbackUrl?: string): void {
    if (!text || text.trim().length === 0) return;

    this.stop();

    if (this.synth) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9; // Slightly slower, clearer tempo for children

      // Try selecting native voice if available
      const voices = this.synth.getVoices();
      const matchedVoice = voices.find((v) => v.lang.startsWith(language));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onerror = () => {
        if (audioFallbackUrl) {
          this.playAudioFile(audioFallbackUrl);
        }
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } else if (audioFallbackUrl) {
      this.playAudioFile(audioFallbackUrl);
    }
  }

  public playAudioFile(url: string): void {
    try {
      const audio = new Audio(url);
      audio.play().catch(() => {
        // Autoplay policy or missing audio file
      });
    } catch {
      // Audio playback failed
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speechService = new SpeechService();

export const speakText = (text: string, language?: string, audioFallbackUrl?: string): void => {
  speechService.speak(text, language, audioFallbackUrl);
};

export const stopSpeaking = (): void => {
  speechService.stop();
};
