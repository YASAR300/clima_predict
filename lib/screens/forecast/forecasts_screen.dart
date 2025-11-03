import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:share_plus/share_plus.dart';
import '../../models/forecast_cache.dart';
import '../../services/database_service.dart';
import '../../services/ml_service.dart';
import '../../widgets/forecast_card.dart';

class ForecastsScreen extends StatefulWidget {
  const ForecastsScreen({super.key});

  @override
  State<ForecastsScreen> createState() => _ForecastsScreenState();
}

class _ForecastsScreenState extends State<ForecastsScreen> {
  ForecastCache? _forecast;
  bool _showHistorical = false;

  @override
  void initState() {
    super.initState();
    _loadForecast();
  }

  Future<void> _loadForecast() async {
    final profile = DatabaseService.getFarmerProfile();
    ForecastCache? forecast;
    
    if (profile != null) {
      forecast = DatabaseService.getLatestForecastForVillage(profile.village);
    } else {
      // Fallback: get any cached forecast or generate new one
      final allForecasts = DatabaseService.getAllForecasts();
      if (allForecasts.isNotEmpty) {
        forecast = allForecasts.first;
      } else {
        // Generate a demo forecast
        forecast = await MLService.generateForecast(
          village: 'Demo Village',
          lat: 23.0,
          lon: 72.6,
        );
        if (forecast != null) {
          try {
            await DatabaseService.saveForecastCache(forecast);
          } catch (e) {
            debugPrint('Could not cache forecast: $e');
          }
        }
      }
    }
    
    setState(() {
      _forecast = forecast;
    });
  }

  void _shareForecast() {
    if (_forecast == null) return;

    final shareText = 'ClimaPredict Forecast for ${_forecast!.village}\n\n'
        '${_forecast!.dailyForecasts.map((f) => '${f.date}: ${f.tempMin.round()}°-${f.tempMax.round()}°C, Rain: ${(f.precipProb * 100).round()}%').join('\n')}';

    Share.share(shareText, subject: 'ClimaPredict Forecast');
  }

  void _rateAccuracy() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Rate Accuracy'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('How accurate was this forecast?'),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(5, (index) {
                return IconButton(
                  icon: Icon(
                    Icons.star,
                    color: Colors.grey, // In real app, track selected rating
                  ),
                  onPressed: () {
                    // Submit rating
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Thank you for your feedback!')),
                    );
                  },
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Forecasts & Alerts'),
        backgroundColor: const Color(0xFF2E7D32),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: _shareForecast,
            tooltip: 'Share',
          ),
        ],
      ),
      body: _forecast == null
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              children: [
                // Toggle for historical data
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Historical data',
                        style: TextStyle(fontSize: 16),
                      ),
                      Switch(
                        value: _showHistorical,
                        onChanged: (value) {
                          setState(() {
                            _showHistorical = value;
                          });
                        },
                      ),
                    ],
                  ),
                ),
                // Weekly forecast cards
                ..._forecast!.dailyForecasts.map((dailyForecast) {
                  return Column(
                    children: [
                      ForecastCard(forecast: dailyForecast),
                      // Alert badges if risk is high
                      if (dailyForecast.riskScore > 0.6)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.red.shade100,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.warning, color: Colors.red),
                                const SizedBox(width: 8),
                                Text(
                                  dailyForecast.precipProb > 0.6
                                      ? 'Flood Risk'
                                      : 'Heatwave Risk',
                                  style: const TextStyle(color: Colors.red),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  );
                }),
                // Rating button
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: ElevatedButton.icon(
                    onPressed: _rateAccuracy,
                    icon: const Icon(Icons.star),
                    label: const Text('Rate accuracy (1-5 stars)'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2E7D32),
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}

