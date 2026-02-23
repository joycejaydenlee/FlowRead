import * as Speech from 'expo-speech';
import { VoiceLanguage } from '@/types';

/**
 * Detect whether a sentence should be spoken in English or the user's chosen Chinese voice.
 */
export function detectLanguageForSpeech(
  text: string,
  voiceLanguage: VoiceLanguage
): string {
  const hasEnglish = /[a-zA-Z]/.test(text);
  const englishRatio =
    (text.match(/[a-zA-Z]/g) || []).length / text.length;
  // If >50% English characters, use English voice
  if (hasEnglish && englishRatio > 0.5) return 'en-US';
  return voiceLanguage;
}

/**
 * Speak a sentence with the given options.
 */
export function speakSentence(
  text: string,
  options: {
    language: string;
    rate: number;
    onDone?: () => void;
    onError?: (error: any) => void;
  }
): void {
  Speech.stop();
  Speech.speak(text, {
    language: options.language,
    rate: options.rate,
    onDone: options.onDone,
    onError: options.onError,
  });
}

/**
 * Stop all speech immediately.
 */
export function stopSpeech(): void {
  Speech.stop();
}

/**
 * Pause current speech (iOS only).
 */
export async function pauseSpeech(): Promise<void> {
  await Speech.pause();
}

/**
 * Resume paused speech (iOS only).
 */
export async function resumeSpeech(): Promise<void> {
  await Speech.resume();
}
