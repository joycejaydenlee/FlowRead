export type ThemeMode = 'light' | 'dark' | 'warm';
export type InterfaceLanguage = 'zh-CN' | 'zh-HK' | 'en-US';
export type VoiceLanguage = 'zh-CN' | 'zh-HK' | 'en-US';
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'stopped';

export interface AppSettings {
  theme: ThemeMode;
  interfaceLanguage: InterfaceLanguage;
  voiceLanguage: VoiceLanguage;
  fontSize: number;
  lineHeightMultiplier: number;
  letterSpacing: number;
  speechRate: number;
}

export interface HistoryItem {
  id: string;
  text: string;
  preview: string;
  title: string;
  timestamp: number;
  totalSentences: number;
  lastReadIndex: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'warm',
  interfaceLanguage: 'zh-CN',
  voiceLanguage: 'zh-HK',
  fontSize: 24,
  lineHeightMultiplier: 1.8,
  letterSpacing: 1,
  speechRate: 0.9,
};
