import AVFoundation
import CoreImage
import Foundation
import NitroModules
import Vision
import VisionCamera

final class HybridOcrPlugin: HybridOcrPluginSpec {
  func detectText(frame: any HybridFrameSpec, options: OcrOptions?) throws -> OcrResult? {
    guard let nativeFrame = frame as? any NativeFrame else {
      throw RuntimeError.error(withMessage: "Frame is not of type `NativeFrame`!")
    }
    guard let sampleBuffer = nativeFrame.sampleBuffer else {
      return nil
    }
    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      return nil
    }
    let ciImage = CIImage(cvPixelBuffer: pixelBuffer)

    let includeBoxes = options?.includeBoxes ?? false
    let includeConfidence = options?.includeConfidence ?? false

    let orientation = cgImagePropertyOrientation(
      cameraOrientation: frame.orientation,
      isMirrored: frame.isMirrored
    )
    let handler = VNImageRequestHandler(ciImage: ciImage, orientation: orientation, options: [:])

    final class LineAccumulator {
      var lines: [OcrLine] = []
    }
    let accumulator = LineAccumulator()

    let request = VNRecognizeTextRequest { request, error in
      if let error {
        NSLog("OCR recognition failed: %@", String(describing: error))
        return
      }
      guard let results = request.results as? [VNRecognizedTextObservation] else { return }
      for observation in results {
        guard let topCandidate = observation.topCandidates(1).first else { continue }
        let box: OcrBox? = includeBoxes ? self.ocrBox(fromNormalizedVisionRect: observation.boundingBox) : nil
        let conf: Double? = includeConfidence ? Double(topCandidate.confidence) : nil
        let line = OcrLine(text: topCandidate.string, box: box, words: nil, confidence: conf)
        accumulator.lines.append(line)
      }
    }

    if let level = options?.recognitionLevel {
      switch level {
      case .accurate:
        request.recognitionLevel = .accurate
      case .fast:
        request.recognitionLevel = .fast
      }
    }
    if let languages = options?.recognitionLanguages {
      request.recognitionLanguages = languages
    }
    if let correction = options?.usesLanguageCorrection {
      request.usesLanguageCorrection = correction
    }

    do {
      try handler.perform([request])
    } catch {
      NSLog("Failed to perform OCR recognition: %@", String(describing: error))
      return nil
    }

    let lineResults = accumulator.lines

    if lineResults.isEmpty {
      return nil
    }

    let joinedText = lineResults.map(\.text).joined(separator: " ")
    if includeBoxes {
      let block = OcrBlock(text: joinedText, box: nil, lines: lineResults)
      return OcrResult(text: joinedText, blocks: [block])
    }
    return OcrResult(text: joinedText, blocks: nil)
  }

  private func ocrBox(fromNormalizedVisionRect rect: CGRect) -> OcrBox {
    OcrBox(
      x: Double(rect.origin.x),
      y: Double(rect.origin.y),
      width: Double(rect.size.width),
      height: Double(rect.size.height)
    )
  }

  /// Matches VisionCamera's internal `CameraOrientation.toCGOrientation(isMirrored:)` mapping, using
  /// the public `HybridFrameSpec.orientation` / `isMirrored` API (metadata fields are not public).
  private func cgImagePropertyOrientation(
    cameraOrientation: CameraOrientation,
    isMirrored: Bool
  ) -> CGImagePropertyOrientation {
    switch cameraOrientation {
    case .up:
      return isMirrored ? .upMirrored : .up
    case .down:
      return isMirrored ? .downMirrored : .down
    case .left:
      return isMirrored ? .leftMirrored : .left
    case .right:
      return isMirrored ? .rightMirrored : .right
    }
  }
}
