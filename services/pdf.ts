import PdfPageImage from 'react-native-pdf-page-image';
import { recognizeText } from 'rn-mlkit-ocr';

/**
 * Extract text from a PDF by rendering each page as an image
 * and running on-device OCR (Google ML Kit) on it.
 */
export async function extractPdfText(
  uri: string,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  const { pageCount } = await PdfPageImage.open(uri);

  try {
    const pages: string[] = [];

    for (let i = 0; i < pageCount; i++) {
      onProgress?.(i + 1, pageCount);

      const pageImage = await PdfPageImage.generate(uri, i, 2.0);
      const result = await recognizeText(pageImage.uri, 'chinese');

      if (result.text) {
        pages.push(result.text);
      }
    }

    return pages.join('\n\n');
  } finally {
    await PdfPageImage.close(uri);
  }
}
