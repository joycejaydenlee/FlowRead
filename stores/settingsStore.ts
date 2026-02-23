import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ThemeMode, InterfaceLanguage, VoiceLanguage, DEFAULT_SETTINGS } from '@/types';
import { STORAGE_KEYS } from '@/constants/config';
import { themeColors, ThemeColors } from '@/constants/themes';

interface SettingsStore extends AppSettings {
  isLoaded: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  setInterfaceLanguage: (lang: InterfaceLanguage) => void;
  setVoiceLanguage: (lang: VoiceLanguage) => void;
  setFontSize: (size: number) => void;
  setLineHeightMultiplier: (multiplier: number) => void;
  setLetterSpacing: (spacing: number) => void;
  setSpeechRate: (rate: number) => void;
  loadFromStorage: () => Promise<void>;
}

const persistSettings = async (settings: AppSettings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

const getSettingsSnapshot = (state: SettingsStore): AppSettings => ({
  theme: state.theme,
  interfaceLanguage: state.interfaceLanguage,
  voiceLanguage: state.voiceLanguage,
  fontSize: state.fontSize,
  lineHeightMultiplier: state.lineHeightMultiplier,
  letterSpacing: state.letterSpacing,
  speechRate: state.speechRate,
});

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,
  colors: themeColors[DEFAULT_SETTINGS.theme],

  setTheme: (theme) => {
    set({ theme, colors: themeColors[theme] });
    persistSettings(getSettingsSnapshot({ ...get(), theme }));
  },

  setInterfaceLanguage: (interfaceLanguage) => {
    set({ interfaceLanguage });
    persistSettings(getSettingsSnapshot({ ...get(), interfaceLanguage }));
  },

  setVoiceLanguage: (voiceLanguage) => {
    set({ voiceLanguage });
    persistSettings(getSettingsSnapshot({ ...get(), voiceLanguage }));
  },

  setFontSize: (fontSize) => {
    set({ fontSize });
    persistSettings(getSettingsSnapshot({ ...get(), fontSize }));
  },

  setLineHeightMultiplier: (lineHeightMultiplier) => {
    set({ lineHeightMultiplier });
    persistSettings(getSettingsSnapshot({ ...get(), lineHeightMultiplier }));
  },

  setLetterSpacing: (letterSpacing) => {
    set({ letterSpacing });
    persistSettings(getSettingsSnapshot({ ...get(), letterSpacing }));
  },

  setSpeechRate: (speechRate) => {
    set({ speechRate });
    persistSettings(getSettingsSnapshot({ ...get(), speechRate }));
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Migrate from old format
        const theme: ThemeMode =
          parsed.theme ||
          (parsed.themeColor === '#2C2C2C' ? 'dark' :
           parsed.themeColor === '#FFFFFF' ? 'light' : 'warm');
        const interfaceLanguage: InterfaceLanguage = parsed.interfaceLanguage || parsed.language || DEFAULT_SETTINGS.interfaceLanguage;
        const voiceLanguage: VoiceLanguage = parsed.voiceLanguage || parsed.voiceLang || DEFAULT_SETTINGS.voiceLanguage;

        set({
          theme,
          interfaceLanguage,
          voiceLanguage,
          fontSize: parsed.fontSize ?? DEFAULT_SETTINGS.fontSize,
          lineHeightMultiplier: parsed.lineHeightMultiplier ?? DEFAULT_SETTINGS.lineHeightMultiplier,
          letterSpacing: parsed.letterSpacing ?? DEFAULT_SETTINGS.letterSpacing,
          speechRate: parsed.speechRate ?? DEFAULT_SETTINGS.speechRate,
          colors: themeColors[theme],
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
      set({ isLoaded: true });
    }
  },
}));
