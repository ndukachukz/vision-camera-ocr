package com.chuksdengr.visioncameraocr

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.margelo.nitro.com.chuksdengr.visioncameraocr.VisionCameraOcrOnLoad

/**
 * Ensures the VisionCameraOcr Nitro JNI library is loaded when the host app starts.
 */
class VisionCameraOcrPackage : ReactPackage {
  init {
    VisionCameraOcrOnLoad.initializeNative()
  }

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    emptyList()

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    emptyList()
}
