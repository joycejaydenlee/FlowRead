// Google Cloud Vision API key (loaded from .env)
export const GOOGLE_VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY ?? '';

// AsyncStorage keys (preserved for migration compatibility)
export const STORAGE_KEYS = {
  SETTINGS: 'flowread_settings',
  HISTORY: 'flowread_history',
  READING_PROGRESS: 'flowread_reading_progress',
} as const;

// Default limits
export const LIMITS = {
  MAX_HISTORY_ITEMS: 10,
  MIN_FONT_SIZE: 14,
  MAX_FONT_SIZE: 40,
  FONT_SIZE_STEP: 2,
  MIN_LINE_HEIGHT: 1.0,
  MAX_LINE_HEIGHT: 3.0,
  LINE_HEIGHT_STEP: 0.1,
  MIN_LETTER_SPACING: 0,
  MAX_LETTER_SPACING: 10,
  LETTER_SPACING_STEP: 1,
  MIN_SPEECH_RATE: 0.1,
  MAX_SPEECH_RATE: 2.0,
  SPEECH_RATE_STEP: 0.1,
} as const;
