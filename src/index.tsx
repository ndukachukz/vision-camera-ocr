import { NitroModules } from 'react-native-nitro-modules';
import type { Frame } from 'react-native-vision-camera';

import type { OcrOptions, OcrPlugin, OcrResult } from './specs/OcrPlugin.nitro';

export type {
  OcrBlock,
  OcrBox,
  OcrLine,
  OcrOptions,
  OcrRecognitionLevel,
  OcrResult,
  OcrWord,
} from './specs/OcrPlugin.nitro';

const ocrPlugin = NitroModules.createHybridObject<OcrPlugin>('OcrPlugin');

/**
 * Performs OCR (Optical Character Recognition) on camera frames.
 * Detects and extracts text from images in real-time.
 *
 * @param frame - The camera frame to process
 * @param options - Optional tuning (boxes, confidence, iOS recognition settings)
 * @returns Recognized text result, or null if no text was found
 */
export function performOcr(
  frame: Frame,
  options?: OcrOptions
): OcrResult | null {
  'worklet';
  return ocrPlugin.detectText(frame, options ?? undefined) ?? null;
}
