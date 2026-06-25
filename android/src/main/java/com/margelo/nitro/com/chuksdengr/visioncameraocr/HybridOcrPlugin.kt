package com.margelo.nitro.com.chuksdengr.visioncameraocr

import android.graphics.Rect
import android.util.Log
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import com.margelo.nitro.camera.HybridFrameSpec
import com.margelo.nitro.camera.public.NativeFrame

@DoNotStrip
@Keep
class HybridOcrPlugin : HybridOcrPluginSpec() {
  private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

  override fun detectText(frame: HybridFrameSpec, options: OcrOptions?): OcrResult? {
    val includeBoxes = options?.includeBoxes ?: false

    val imageProxy = (frame as? NativeFrame)?.image ?: return null
    val mediaImage = imageProxy.image ?: return null

    return try {
      val inputImage =
        InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
      val visionText = Tasks.await(recognizer.process(inputImage))

      if (visionText.text.isEmpty()) {
        return null
      }

      if (!includeBoxes) {
        return OcrResult(visionText.text, null)
      }

      val blocks =
        visionText.textBlocks.map { block ->
          val blockBox = block.boundingBox?.toOcrBox()
          val lines =
            block.lines.map { line ->
              val lineBox = line.boundingBox?.toOcrBox()
              val words =
                line.elements.map { element ->
                  OcrWord(
                    text = element.text,
                    box = element.boundingBox?.toOcrBox(),
                    confidence = null,
                  )
                }
              OcrLine(
                text = line.text,
                box = lineBox,
                words = words.toTypedArray(),
                confidence = null,
              )
            }
          OcrBlock(
            text = block.text,
            box = blockBox,
            lines = lines.toTypedArray(),
          )
        }

      OcrResult(visionText.text, blocks.toTypedArray())
    } catch (e: Exception) {
      Log.e(TAG, "OCR recognition error: ${e.message}", e)
      null
    }
  }

  private fun Rect.toOcrBox(): OcrBox =
    OcrBox(
      x = left.toDouble(),
      y = top.toDouble(),
      width = (right - left).toDouble(),
      height = (bottom - top).toDouble(),
    )

  companion object {
    private const val TAG = "HybridOcrPlugin"
  }
}
