import * as FileSystem from 'expo-file-system/legacy';
import { GOOGLE_VISION_API_KEY } from '@/constants/config';

const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

/**
 * Send an image file to Google Cloud Vision for text detection.
 */
export async function recognizeImage(imageUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return recognizeImageFromBase64(base64);
}

/**
 * Send a base64-encoded image to Google Cloud Vision for text detection.
 */
export async function recognizeImageFromBase64(
  base64: string
): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64 },
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vision API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const fullText = data.responses?.[0]?.fullTextAnnotation?.text;

  if (!fullText) {
    throw new Error('No text detected in image');
  }

  return fullText;
}
