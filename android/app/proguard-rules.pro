# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.kts.

# Keep TensorFlow Lite classes
-keep class org.tensorflow.lite.** { *; }
-keepclassmembers class org.tensorflow.lite.** { *; }

# Keep TensorFlow Lite GPU classes (including inner classes)
-keep class org.tensorflow.lite.gpu.** { *; }
-keep class org.tensorflow.lite.gpu.GpuDelegateFactory { *; }
-keep class org.tensorflow.lite.gpu.GpuDelegateFactory$* { *; }
-keep class org.tensorflow.lite.gpu.GpuDelegateFactory$Options { *; }
-keep class org.tensorflow.lite.gpu.GpuDelegateFactory$Options$* { *; }
-keep class org.tensorflow.lite.gpu.GpuDelegateFactory$Options$GpuBackend { *; }
-keep class org.tensorflow.lite.gpu.GpuDelegate { *; }
-keepclassmembers class org.tensorflow.lite.gpu.** { *; }

# Keep inner classes for TensorFlow Lite GPU
-keep class org.tensorflow.lite.gpu.**$* { *; }

# Suppress warnings for optional GPU delegate classes
-dontwarn org.tensorflow.lite.gpu.**
-dontwarn org.tensorflow.lite.gpu.GpuDelegateFactory$Options
-dontwarn org.tensorflow.lite.gpu.GpuDelegateFactory$Options$GpuBackend

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Flutter classes
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Keep annotation default values
-keepattributes AnnotationDefault

# Keep line numbers for stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

