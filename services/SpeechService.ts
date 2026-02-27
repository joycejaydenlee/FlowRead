/**
 * SpeechService — Free vs Pro TTS Switch
 *
 * Free  → Expo Speech (device-native, offline, zh-HK)
 * Pro   → Google Cloud Chirp 3 HD via Firebase Function (cmn-CN-Chirp3-HD-Fenrir)
 *
 * SETUP REQUIRED:
 *  1. Add these to your .env file:
 *       EXPO_PUBLIC_FIREBASE_API_KEY=...
 *       EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=myreaderapp-486700.firebaseapp.com
 *       EXPO_PUBLIC_FIREBASE_PROJECT_ID=myreaderapp-486700
 *       EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=myreaderapp-486700.appspot.com
 *       EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
 *       EXPO_PUBLIC_FIREBASE_APP_ID=...
 *  2. Call `initSpeechService(firebaseAuthToken)` after user signs into Firebase Auth.
 *     The simplest option: Firebase Anonymous Auth on app launch.
 */

import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getFunctions,
  httpsCallable,
  type Functions,
} from "firebase/functions";

// ── Firebase configuration ────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

function getFirebaseApp(): FirebaseApp {
  return getApps().length === 0
    ? initializeApp(FIREBASE_CONFIG)
    : getApps()[0];
}

function getCloudFunctions(): Functions {
  // asia-east2 = Hong Kong — matches the deployed function region
  return getFunctions(getFirebaseApp(), "asia-east2");
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SpeechRequest {
  text: string;
  voiceName?: string;
  speed?: number;
}
interface SpeechResponse {
  url: string;
  cached: boolean;
}

interface PlayOptions {
  /** Playback speed 0.25–4.0. Default: 1.0 */
  speed?: number;
  /** Override the default Chirp 3 HD voice. */
  voiceName?: string;
  /** Language tag for FREE (native) TTS only. Default: zh-HK */
  nativeLanguage?: string;
}

// ── Module-level state ────────────────────────────────────────────────────────
let currentSound: Audio.Sound | null = null;

/** Cache: sentence text → signed Storage URL (background prefetch results). */
const prefetchCache = new Map<string, string>();

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Play a sentence using the appropriate TTS engine.
 *
 * - Free users → Expo Speech (offline, device voice, zh-HK)
 * - Pro users  → Chirp 3 HD cloud voice via Firebase Function
 *
 * @param text    The sentence to speak.
 * @param isPro   Whether the current user has an active Pro subscription.
 * @param options Optional speed / voice overrides.
 */
export async function playSpeech(
  text: string,
  isPro: boolean,
  options: PlayOptions = {}
): Promise<void> {
  if (!isPro) {
    // ── Free path: native device TTS (offline, no cost) ──────────────────────
    Speech.stop();
    Speech.speak(text, {
      language: options.nativeLanguage ?? "zh-HK",
      rate: options.speed ?? 1.0,
    });
    return;
  }

  // ── Pro path: Chirp 3 HD cloud TTS ─────────────────────────────────────────
  try {
    await _playCloudTTS(text, options);
  } catch (err) {
    // Graceful fallback: cloud failed → native TTS so reading is never blocked
    console.warn("[SpeechService] Cloud TTS failed, falling back to native:", err);
    Speech.speak(text, { language: options.nativeLanguage ?? "zh-HK" });
  }
}

/**
 * Pre-fetch the signed URL for the *next* sentence in the background.
 * When `playSpeech` is later called for that same text it will play instantly.
 *
 * Call this while the *current* sentence is being spoken.
 *
 * @param nextText Sentence to pre-generate audio for.
 * @param options  Should match the options you'll pass to `playSpeech`.
 */
export function prefetchSpeech(
  nextText: string,
  options: PlayOptions = {}
): void {
  if (prefetchCache.has(nextText)) return; // already in cache

  const generateSpeechFn = httpsCallable<SpeechRequest, SpeechResponse>(
    getCloudFunctions(),
    "generateSpeech"
  );

  // Fire-and-forget; errors are non-fatal
  generateSpeechFn({
    text: nextText,
    voiceName: options.voiceName ?? "cmn-CN-Chirp3-HD-Fenrir",
    speed: options.speed ?? 1.0,
  })
    .then((result) => {
      prefetchCache.set(nextText, result.data.url);
      console.log("[SpeechService] Prefetched:", nextText.slice(0, 30));
    })
    .catch((err) => {
      console.warn("[SpeechService] Prefetch failed:", err);
    });
}

/** Stop all TTS (native and cloud). Release audio resources. */
export async function stopSpeechService(): Promise<void> {
  Speech.stop();
  if (currentSound) {
    await currentSound.stopAsync().catch(() => {});
    await currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function _playCloudTTS(text: string, options: PlayOptions): Promise<void> {
  let url: string;

  if (prefetchCache.has(text)) {
    // Cache hit — instant playback
    url = prefetchCache.get(text)!;
    prefetchCache.delete(text); // consume so the Map stays lean
    console.log("[SpeechService] Playing from prefetch cache");
  } else {
    // Cache miss — fetch now (adds ~300–800ms latency)
    const generateSpeechFn = httpsCallable<SpeechRequest, SpeechResponse>(
      getCloudFunctions(),
      "generateSpeech"
    );
    const result = await generateSpeechFn({
      text,
      voiceName: options.voiceName ?? "cmn-CN-Chirp3-HD-Fenrir",
      speed: options.speed ?? 1.0,
    });
    url = result.data.url;
  }

  await _playFromUrl(url);
}

async function _playFromUrl(url: string): Promise<void> {
  // Unload any previously playing sound to prevent audio overlap
  if (currentSound) {
    await currentSound.stopAsync().catch(() => {});
    await currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }

  // Required on iOS: play audio even when the device is in silent mode
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
  });

  const { sound } = await Audio.Sound.createAsync(
    { uri: url },
    { shouldPlay: true }
  );
  currentSound = sound;

  // Auto-cleanup when playback finishes
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync().catch(() => {});
      if (currentSound === sound) currentSound = null;
    }
  });
}
