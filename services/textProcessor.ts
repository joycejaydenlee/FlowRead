/**
 * Determines if text is predominantly English (>30% Latin characters).
 */
export function isEnglishDominant(text: string): boolean {
  const englishCharCount = (text.match(/[a-zA-Z]/g) || []).length;
  return englishCharCount > text.length * 0.3;
}

/**
 * Clean text by normalizing whitespace and punctuation.
 */
export function cleanText(text: string, isEnglish: boolean): string {
  if (isEnglish) {
    return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  }
  // Chinese: normalize punctuation and remove spaces
  return text
    .replace(/\n/g, '')
    .replace(/,/g, '，')
    .replace(/;/g, '；')
    .replace(/\?/g, '？')
    .replace(/!/g, '！')
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Segment text into sentences based on language detection.
 * Chinese text splits on full-width punctuation.
 * English text splits on sentence-ending punctuation.
 */
export function segmentText(text: string): string[] {
  if (!text || text.trim().length === 0) return [];

  const isEnglish = isEnglishDominant(text);
  const cleaned = cleanText(text, isEnglish);

  let sentences: string[];

  if (isEnglish) {
    // Split on sentence-ending punctuation followed by space, or on commas/semicolons for shorter segments
    sentences = cleaned
      .split(/(?<=[.!?])\s+|(?<=[,;])\s+/)
      .map((s) => s.trim());
  } else {
    // Chinese: split on full-width punctuation, keeping the punctuation with the sentence
    sentences = cleaned
      .split(/(?<=[。！？；，])/)
      .map((s) => s.trim());
  }

  return sentences.filter((s) => s.length > 0);
}
