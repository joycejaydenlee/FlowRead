import { ThemeMode } from '@/types';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentLight: string;
  border: string;
  controlBg: string;
  controlText: string;
  overlay: string;
}

export const themeColors: Record<ThemeMode, ThemeColors> = {
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    accent: '#5D4037',
    accentLight: '#D2B48C',
    border: '#E5E7EB',
    controlBg: '#F3F4F6',
    controlText: '#374151',
    overlay: 'rgba(0,0,0,0.4)',
  },
  warm: {
    background: '#F5F5DC',
    surface: '#FFFFFF',
    text: '#3E2723',
    textSecondary: '#8D6E63',
    accent: '#5D4037',
    accentLight: '#D2B48C',
    border: '#E0DCC8',
    controlBg: '#E8DCC8',
    controlText: '#5D4037',
    overlay: 'rgba(0,0,0,0.4)',
  },
  dark: {
    background: '#1A1A2E',
    surface: '#2D2D44',
    text: '#E8E8F0',
    textSecondary: '#9CA3AF',
    accent: '#D2B48C',
    accentLight: '#5D4037',
    border: '#374151',
    controlBg: '#374151',
    controlText: '#E8E8F0',
    overlay: 'rgba(0,0,0,0.6)',
  },
};
