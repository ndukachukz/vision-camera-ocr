import type { HybridObject } from 'react-native-nitro-modules';
import type { Frame } from 'react-native-vision-camera';

/** iOS-only; ignored on Android. */
export type OcrRecognitionLevel = 'fast' | 'accurate';

/**
 * Options for OCR text recognition.
 */
export interface OcrOptions {
  includeBoxes?: boolean;
  includeConfidence?: boolean;
  // iOS only options (ignored on Android)
  recognitionLevel?: OcrRecognitionLevel;
  recognitionLanguages?: string[];
  usesLanguageCorrection?: boolean;
}

export interface OcrBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrWord {
  text: string;
  box?: OcrBox;
  confidence?: number;
}

export interface OcrLine {
  text: string;
  box?: OcrBox;
  words?: OcrWord[];
  confidence?: number;
}

export interface OcrBlock {
  text: string;
  box?: OcrBox;
  lines?: OcrLine[];
}

export interface OcrResult {
  text: string;
  blocks?: OcrBlock[];
}

/**
 * A Nitro HybridObject that performs OCR on camera frames.
 *
 * Uses Apple Vision Framework on iOS and Google ML Kit on Android
 * for real-time text recognition.
 */
export interface OcrPlugin
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Performs OCR on a camera frame and returns recognized text.
   *
   * @param frame - The camera frame to process
   * @param options - Configuration options for the OCR engine
   * @returns The recognized text result, or undefined if no text found
   */
  detectText(frame: Frame, options?: OcrOptions): OcrResult | undefined;
}
