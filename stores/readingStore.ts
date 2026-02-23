import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem, PlaybackState } from '@/types';
import { STORAGE_KEYS, LIMITS } from '@/constants/config';

interface ReadingStore {
  sentences: string[];
  activeIndex: number;
  playbackState: PlaybackState;
  isAutoPlay: boolean;
  sourceText: string;
  history: HistoryItem[];
  isHistoryLoaded: boolean;

  setSentences: (sentences: string[], sourceText: string) => void;
  setActiveIndex: (index: number) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setAutoPlay: (auto: boolean) => void;
  nextSentence: () => boolean;
  previousSentence: () => boolean;
  addToHistory: (text: string, sentenceCount: number) => void;
  deleteHistory: (id: string) => void;
  deleteMultipleHistory: (ids: string[]) => void;
  renameHistory: (id: string, newTitle: string) => void;
  loadHistory: () => Promise<void>;
  loadProgress: () => Promise<void>;
  clear: () => void;
}

const saveProgress = (
  state: { sentences: string[]; sourceText: string; activeIndex: number },
  store: { history: HistoryItem[]; },
  setFn: (partial: Partial<ReadingStore>) => void,
) => {
  AsyncStorage.setItem(
    STORAGE_KEYS.READING_PROGRESS,
    JSON.stringify({
      sentences: state.sentences,
      sourceText: state.sourceText,
      activeIndex: state.activeIndex,
    })
  ).catch(console.error);

  // Sync lastReadIndex to matching history item
  const match = store.history.find((h) => h.text === state.sourceText);
  if (match && match.lastReadIndex !== state.activeIndex) {
    const newHistory = store.history.map((h) =>
      h.id === match.id ? { ...h, lastReadIndex: state.activeIndex } : h
    );
    setFn({ history: newHistory });
    persistHistory(newHistory);
  }
};

const persistHistory = (history: HistoryItem[]) => {
  AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history)).catch(console.error);
};

export const useReadingStore = create<ReadingStore>((set, get) => ({
  sentences: [],
  activeIndex: 0,
  playbackState: 'idle',
  isAutoPlay: true,
  sourceText: '',
  history: [],
  isHistoryLoaded: false,

  setSentences: (sentences, sourceText) => {
    set({ sentences, sourceText, activeIndex: 0, playbackState: 'idle' });
    saveProgress({ sentences, sourceText, activeIndex: 0 }, get(), set);
  },

  setActiveIndex: (activeIndex) => {
    set({ activeIndex });
    const { sentences, sourceText } = get();
    saveProgress({ sentences, sourceText, activeIndex }, get(), set);
  },

  setPlaybackState: (playbackState) => {
    set({ playbackState });
  },

  setAutoPlay: (isAutoPlay) => {
    set({ isAutoPlay });
  },

  nextSentence: () => {
    const { activeIndex, sentences, sourceText } = get();
    if (activeIndex < sentences.length - 1) {
      const newIndex = activeIndex + 1;
      set({ activeIndex: newIndex });
      saveProgress({ sentences, sourceText, activeIndex: newIndex }, get(), set);
      return true;
    }
    return false;
  },

  previousSentence: () => {
    const { activeIndex, sentences, sourceText } = get();
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      set({ activeIndex: newIndex });
      saveProgress({ sentences, sourceText, activeIndex: newIndex }, get(), set);
      return true;
    }
    return false;
  },

  addToHistory: (text, sentenceCount) => {
    const { history } = get();
    const preview = text.substring(0, 100).replace(/\n/g, ' ');
    const existing = history.find((h) => h.text === text);
    const newItem: HistoryItem = {
      id: existing?.id || Date.now().toString(),
      text,
      preview,
      title: existing?.title || preview.substring(0, 30),
      timestamp: Date.now(),
      totalSentences: sentenceCount,
      lastReadIndex: existing?.lastReadIndex ?? 0,
    };
    const filtered = history.filter((h) => h.text !== text);
    const newHistory = [newItem, ...filtered].slice(0, LIMITS.MAX_HISTORY_ITEMS);
    set({ history: newHistory });
    persistHistory(newHistory);
  },

  deleteHistory: (id) => {
    const { history } = get();
    const newHistory = history.filter((h) => h.id !== id);
    set({ history: newHistory });
    persistHistory(newHistory);
  },

  deleteMultipleHistory: (ids) => {
    const { history } = get();
    const idSet = new Set(ids);
    const newHistory = history.filter((h) => !idSet.has(h.id));
    set({ history: newHistory });
    persistHistory(newHistory);
  },

  renameHistory: (id, newTitle) => {
    const { history } = get();
    const newHistory = history.map((h) =>
      h.id === id ? { ...h, title: newTitle } : h
    );
    set({ history: newHistory });
    persistHistory(newHistory);
  },

  loadHistory: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const history: HistoryItem[] = parsed.map((item: string | HistoryItem, i: number) => {
          if (typeof item === 'string') {
            return {
              id: `migrated_${i}`,
              text: item,
              preview: item.substring(0, 100),
              title: item.substring(0, 30),
              timestamp: Date.now() - i * 60000,
              totalSentences: 0,
              lastReadIndex: 0,
            };
          }
          // Migrate items missing new fields
          return {
            ...item,
            totalSentences: item.totalSentences ?? 0,
            lastReadIndex: item.lastReadIndex ?? 0,
            title: item.title || item.preview || item.text?.substring(0, 30) || '',
          };
        });
        set({ history, isHistoryLoaded: true });
      } else {
        set({ isHistoryLoaded: true });
      }
    } catch (e) {
      console.error('Failed to load history:', e);
      set({ isHistoryLoaded: true });
    }
  },

  loadProgress: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
      if (raw) {
        const { sentences, sourceText, activeIndex } = JSON.parse(raw);
        if (sentences?.length > 0) {
          set({ sentences, sourceText, activeIndex, playbackState: 'idle' });
        }
      }
    } catch (e) {
      console.error('Failed to load reading progress:', e);
    }
  },

  clear: () => {
    set({
      sentences: [],
      activeIndex: 0,
      playbackState: 'idle',
      sourceText: '',
    });
    AsyncStorage.removeItem(STORAGE_KEYS.READING_PROGRESS).catch(console.error);
  },
}));
