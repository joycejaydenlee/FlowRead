import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, HistoryItem } from '@/types';
import { STORAGE_KEYS } from '@/constants/config';

export async function loadSettings(): Promise<Partial<AppSettings> | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to load settings:', e);
    return null;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export async function loadHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load history:', e);
    return [];
  }
}

export async function saveHistory(history: HistoryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}
