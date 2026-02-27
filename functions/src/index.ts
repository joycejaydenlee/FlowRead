/**
 * Google Cloud TTS Backend — Pro Users Only
 *
 * Voice: cmn-CN Chirp 3 HD (Simplified Chinese required)
 * Region: asia-east2 (Hong Kong) for low latency
 *
 * PRE-REQUISITES (one-time setup in Google Cloud Console):
 *  1. Enable "Cloud Text-to-Speech API"
 *  2. Enable "Cloud Storage API"
 *  3. The default App Engine service account needs:
 *     - roles/storage.objectAdmin
 *     - roles/iam.serviceAccountTokenCreator  (for signed URLs)
 *  4. Sync RevenueCat isPro → Firestore `users/{uid}.isPro`
 *     via RevenueCat Webhooks → a separate Cloud Function, or
 *     via the official RevenueCat Firebase Extension.
 */

// opencc-js types live in src/opencc-js.d.ts

import { setGlobalOptions } from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import TextToSpeech from "@google-cloud/text-to-speech";
import CryptoJS from "crypto-js";
import { Converter } from "opencc-js";

// ── Global settings ──────────────────────────────────────────────────────────
setGlobalOptions({ maxInstances: 10, region: "asia-east2" });

// ── Firebase Admin init ──────────────────────────────────────────────────────
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// ── Singletons (re-used across warm instances) ───────────────────────────────
const ttsClient = new TextToSpeech.TextToSpeechClient();

// Convert Traditional Chinese (HK) → Simplified (Mainland).
// Chirp 3 HD is trained on Simplified; this prevents garbled output.
const toSimplified = Converter({ from: "hk", to: "cn" });

// ── Types ────────────────────────────────────────────────────────────────────
interface GenerateSpeechRequest {
  text: string;
  /** Default: cmn-CN-Chirp3-HD-Fenrir */
  voiceName?: string;
  /** Playback speed 0.25–4.0, default 1.0 */
  speed?: number;
}

interface GenerateSpeechResponse {
  url: string;
  cached: boolean;
}

// ── Cloud Function ────────────────────────────────────────────────────────────
export const generateSpeech = onCall<
  GenerateSpeechRequest,
  Promise<GenerateSpeechResponse>
>(
  { region: "asia-east2" },
  async (request) => {

    // ── 1. Authentication ───────────────────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const uid = request.auth.uid;

    // ── 2. Pro check ────────────────────────────────────────────────────────
    // isPro is written to Firestore by the RevenueCat webhook / extension.
    // See PRE-REQUISITES #4 above.
    const userSnap = await db.collection("users").doc(uid).get();
    const isPro = userSnap.exists && userSnap.data()?.isPro === true;

    if (!isPro) {
      throw new HttpsError(
        "permission-denied",
        "Pro subscription required for Neural Cloud Voice."
      );
    }

    // ── 3. Input validation ─────────────────────────────────────────────────
    const {
      text,
      voiceName = "cmn-CN-Chirp3-HD-Fenrir",
      speed = 1.0,
    } = request.data;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new HttpsError("invalid-argument", "text must be a non-empty string.");
    }
    if (speed < 0.25 || speed > 4.0) {
      throw new HttpsError("invalid-argument", "speed must be between 0.25 and 4.0.");
    }

    // ── 4. Cache check (Storage) ────────────────────────────────────────────
    const cacheKey = CryptoJS.MD5(`${text}${voiceName}${speed}`).toString();
    const filePath = `tts-cache/${cacheKey}.mp3`;
    const bucket = storage.bucket();
    const file = bucket.file(filePath);

    const [exists] = await file.exists();
    if (exists) {
      logger.info("[TTS] Cache hit", { uid, cacheKey });
      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });
      return { url: signedUrl, cached: true };
    }

    // ── 5. Traditional → Simplified conversion ──────────────────────────────
    // cmn-CN Chirp 3 is trained on Simplified Chinese.
    // Input from the app is Traditional (HK), so we convert here.
    const simplifiedText = toSimplified(text);

    // ── 6. Google Cloud Text-to-Speech ──────────────────────────────────────
    logger.info("[TTS] Generating audio", { uid, voiceName, speed, chars: text.length });

    const [response] = await ttsClient.synthesizeSpeech({
      input: { text: simplifiedText },
      voice: {
        languageCode: "cmn-CN",
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: speed,
      },
    });

    if (!response.audioContent) {
      throw new HttpsError("internal", "TTS API returned empty audio content.");
    }

    // ── 7. Save to Firebase Storage ─────────────────────────────────────────
    await file.save(response.audioContent as Buffer, {
      metadata: { contentType: "audio/mpeg" },
    });

    // ── 8. Return signed URL (1-hour TTL) ───────────────────────────────────
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000,
    });

    logger.info("[TTS] Audio saved and signed URL generated", { uid, filePath });
    return { url: signedUrl, cached: false };
  }
);
