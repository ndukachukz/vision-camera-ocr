const mockDetectText = jest.fn();

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => ({
      detectText: (...args: unknown[]) => mockDetectText(...args),
    })),
  },
}));

import type { Frame } from 'react-native-vision-camera';
import { type OcrOptions, type OcrResult, performOcr } from '../index';

describe('@chuksdengr/vision-camera-ocr', () => {
  const mockFrame = {
    width: 1920,
    height: 1080,
  } as Frame;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDetectText.mockReturnValue({ text: 'test text' });
  });

  describe('performOcr', () => {
    it('should export performOcr function', () => {
      expect(performOcr).toBeDefined();
      expect(typeof performOcr).toBe('function');
    });

    it('should call detectText with frame and undefined options when options not provided', () => {
      performOcr(mockFrame);
      expect(mockDetectText).toHaveBeenCalledWith(mockFrame, undefined);
    });

    it('should call detectText with frame and provided options', () => {
      const options: OcrOptions = {
        includeBoxes: true,
        includeConfidence: true,
      };
      performOcr(mockFrame, options);
      expect(mockDetectText).toHaveBeenCalledWith(mockFrame, options);
    });

    it('should return result from detectText', () => {
      const result: OcrResult = {
        text: 'detected text',
        blocks: [
          {
            text: 'detected text',
            lines: [
              {
                text: 'detected text',
                words: [{ text: 'detected' }, { text: 'text' }],
              },
            ],
          },
        ],
      };
      mockDetectText.mockReturnValue(result);

      const output = performOcr(mockFrame);
      expect(output).toEqual(result);
    });

    it('should return null when detectText returns undefined (no text detected)', () => {
      mockDetectText.mockReturnValue(undefined);
      const output = performOcr(mockFrame);
      expect(output).toBeNull();
    });

    it('should handle iOS-specific options', () => {
      const options: OcrOptions = {
        recognitionLevel: 'accurate',
        recognitionLanguages: ['en-US', 'vi-VN'],
        usesLanguageCorrection: true,
      };
      performOcr(mockFrame, options);
      expect(mockDetectText).toHaveBeenCalledWith(mockFrame, options);
    });

    it('should handle includeBoxes option', () => {
      const resultWithBoxes: OcrResult = {
        text: 'test',
        blocks: [
          {
            text: 'test',
            box: { x: 0, y: 0, width: 100, height: 50 },
            lines: [
              {
                text: 'test',
                box: { x: 0, y: 0, width: 100, height: 50 },
                words: [
                  {
                    text: 'test',
                    box: { x: 0, y: 0, width: 50, height: 50 },
                  },
                ],
              },
            ],
          },
        ],
      };
      mockDetectText.mockReturnValue(resultWithBoxes);

      const output = performOcr(mockFrame, { includeBoxes: true });
      expect(output).toEqual(resultWithBoxes);
      expect(output?.blocks).toBeDefined();
      expect(output?.blocks?.[0]?.box).toBeDefined();
    });

    it('should handle includeConfidence option', () => {
      const resultWithConfidence: OcrResult = {
        text: 'test',
        blocks: [
          {
            text: 'test',
            lines: [
              {
                text: 'test',
                confidence: 0.95,
                words: [{ text: 'test', confidence: 0.95 }],
              },
            ],
          },
        ],
      };
      mockDetectText.mockReturnValue(resultWithConfidence);

      const output = performOcr(mockFrame, { includeConfidence: true });
      expect(output).toEqual(resultWithConfidence);
    });
  });
});
