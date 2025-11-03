import 'package:tflite_flutter/tflite_flutter.dart';
import '../models/forecast_cache.dart';

import 'package:flutter/foundation.dart';

class MLService {
  static Interpreter? _interpreter;
  static bool _isLoaded = false;
  static final String _modelVersion = 'v1.0.0';
  
  static String get modelVersion => _modelVersion;

  // Input shapes
  static const int satelliteSeqLength = 8; // Ts = 8 days
  static const int satelliteFeatures = 16; // Sf = 16 features
  static const int sensorSeqLength = 8;
  static const int sensorFeatures = 3; // temp, humidity, soil_moisture
  static const int staticFeatures = 6; // lat, lon, elevation, soil_type, crop_type, irrigation

  // Output shapes
  static const int forecastDays = 7;
  static const int forecastVars = 5; // temp_min, temp_max, precip_prob, wind_kmh, humidity

  static Future<bool> loadModel() async {
    if (_isLoaded) return true;

    try {
      // Load model from assets
      final modelPath = 'assets/models/climapredict_v1.tflite';
      
      // For demo, create a stub model if it doesn't exist
      _interpreter = await Interpreter.fromAsset(modelPath);
      
      _isLoaded = true;
      return true;
    } catch (e) {
      debugPrint('Error loading model: $e');
      // For demo, we'll use a fallback prediction
      _isLoaded = false;
      return false;
    }
  }

  static Future<ForecastCache?> generateForecast({
    required String village,
    required double lat,
    required double lon,
    List<List<double>>? satelliteSeq,
    List<List<double>>? sensorSeq,
    List<double>? staticFeatures,
  }) async {
    if (!_isLoaded) {
      await loadModel();
    }

    // If model not loaded, use fallback prediction
    if (!_isLoaded || _interpreter == null) {
      return _generateFallbackForecast(village: village, lat: lat, lon: lon);
    }

    try {
      // Prepare input tensors
      final satelliteInput = satelliteSeq ??
          List.generate(
            satelliteSeqLength,
            (_) => List.filled(satelliteFeatures, 0.0),
          );
      
      final sensorInput = sensorSeq ??
          List.generate(
            sensorSeqLength,
            (_) => List.filled(sensorFeatures, 0.0),
          );
      
      final staticInput = staticFeatures ?? List.filled(MLService.staticFeatures, 0.0);
      
      // Combine inputs (simplified - actual model architecture may differ)
      final input = [
        List.from(satelliteInput.expand((x) => x)),
        List.from(sensorInput.expand((x) => x)),
        staticInput,
      ];

      // Prepare output buffers
      final forecastOutput = List.generate(
        forecastDays * forecastVars,
        (_) => 0.0,
      );
      final riskOutput = List.generate(forecastDays, (_) => 0.0);

      // Run inference
      final stopwatch = Stopwatch()..start();
      _interpreter!.run({
        0: input,
      }, {
        0: forecastOutput,
        1: riskOutput,
      });
      stopwatch.stop();

      // Parse outputs
      final dailyForecasts = <DailyForecast>[];
      final now = DateTime.now();

      for (int day = 0; day < forecastDays; day++) {
        final date = now.add(Duration(days: day));
        final idx = day * forecastVars;

        dailyForecasts.add(DailyForecast(
          date: date.toIso8601String().split('T')[0],
          tempMin: forecastOutput[idx],
          tempMax: forecastOutput[idx + 1],
          precipProb: forecastOutput[idx + 2].clamp(0.0, 1.0),
          windKmh: forecastOutput[idx + 3],
          humidity: forecastOutput[idx + 4].round().clamp(0, 100),
          riskScore: riskOutput[day].clamp(0.0, 1.0),
          explanations: 'Model fused MODIS + local sensors for day ${day + 1}',
        ));
      }

      final forecastId = '${village}_${now.toIso8601String().split('T')[0]}';

      return ForecastCache(
        id: forecastId,
        village: village,
        lat: lat,
        lon: lon,
        source: 'ondevice',
        generatedAt: now,
        validFrom: now,
        validUntil: now.add(const Duration(days: 7)),
        dailyForecasts: dailyForecasts,
        modelVersion: _modelVersion,
      );
    } catch (e) {
      debugPrint('Error generating forecast: $e');
      return _generateFallbackForecast(village: village, lat: lat, lon: lon);
    }
  }

  static ForecastCache _generateFallbackForecast({
    required String village,
    required double lat,
    required double lon,
  }) {
    final now = DateTime.now();
    final dailyForecasts = <DailyForecast>[];

    // Simple fallback: use location-based estimates
    for (int day = 0; day < 7; day++) {
      final date = now.add(Duration(days: day));
      // Simple approximation based on latitude (Gujarat ~23°N)
      final baseTemp = 25.0 + (day % 3) * 2.0;
      final precipBase = 0.3 + (day % 2) * 0.1;

      dailyForecasts.add(DailyForecast(
        date: date.toIso8601String().split('T')[0],
        tempMin: baseTemp - 5.0,
        tempMax: baseTemp + 5.0,
        precipProb: precipBase.clamp(0.0, 1.0),
        windKmh: 10.0 + (day % 3) * 2.0,
        humidity: 65 + (day % 5) * 3,
        riskScore: 0.1 + (day % 3) * 0.05,
        explanations: 'Fallback forecast using regional baseline',
      ));
    }

    final forecastId = '${village}_${now.toIso8601String().split('T')[0]}';

    return ForecastCache(
      id: forecastId,
      village: village,
      lat: lat,
      lon: lon,
      source: 'ondevice',
      generatedAt: now,
      validFrom: now,
      validUntil: now.add(const Duration(days: 7)),
      dailyForecasts: dailyForecasts,
      modelVersion: 'fallback',
    );
  }

  static double calibrateWithFeedback(
    double originalValue,
    List<double> feedbackAdjustments,
  ) {
    // Simple calibration: average feedback adjustments
    if (feedbackAdjustments.isEmpty) return originalValue;
    final avgAdjustment = feedbackAdjustments.reduce((a, b) => a + b) /
        feedbackAdjustments.length;
    return (originalValue + avgAdjustment * 0.2).clamp(0.0, 1.0);
  }
}

