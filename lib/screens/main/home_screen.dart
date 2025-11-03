import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../models/farmer_profile.dart';
import '../../models/forecast_cache.dart';
import '../../services/database_service.dart';
import '../../services/ml_service.dart';
import '../../services/api_service.dart';
import '../../services/sync_service.dart';
import '../forecast/forecasts_screen.dart';
import '../recommendations/recommendations_screen.dart';
import '../settings/settings_screen.dart';
import '../insurance/insurance_predictor_screen.dart';
import '../../widgets/mini_chart.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  FarmerProfile? _profile;
  ForecastCache? _currentForecast;
  bool _isOffline = false;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
    _checkConnectivity();
  }

  Future<void> _loadData() async {
    final profile = DatabaseService.getFarmerProfile();
    setState(() {
      _profile = profile;
    });

    // Always generate forecast, even if profile is null (use defaults)
    if (profile != null) {
      await _loadForecast(profile);
    } else {
      // Fallback: generate forecast with default values
      await _loadForecastWithDefaults();
    }
  }

  Future<void> _loadForecast(FarmerProfile profile) async {
    // Try to get cached forecast first
    var forecast = DatabaseService.getLatestForecastForVillage(profile.village);

    // If no cached forecast or it's too old, generate new one
    if (forecast == null ||
        forecast.validUntil.isBefore(DateTime.now())) {
      // Generate on-device forecast
      forecast = await MLService.generateForecast(
        village: profile.village,
        lat: 23.0, // Default for Anand, Gujarat
        lon: 72.6,
      );

      if (forecast != null) {
        await DatabaseService.saveForecastCache(forecast);
      }
    }

    // Also try to fetch from API if online
    if (!_isOffline) {
      try {
        final apiService = ApiService();
        final apiForecast = await apiService.getForecast(
          lat: 23.0,
          lon: 72.6,
          village: profile.village,
        );

        if (apiForecast != null) {
          forecast = apiForecast;
          await DatabaseService.saveForecastCache(forecast);
        }
      } catch (e) {
        // ignore: avoid_print
        print('Error fetching forecast from API: $e');
      }
    }

    setState(() {
      _currentForecast = forecast;
    });
  }

  Future<void> _checkConnectivity() async {
    final connectivityResults = await Connectivity().checkConnectivity();
    setState(() {
      _isOffline = connectivityResults.contains(ConnectivityResult.none);
    });
  }

  Widget _buildOfflineBanner() {
    if (!_isOffline) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      color: Colors.yellow.shade200,
      child: const Text(
        'Using cached data',
        style: TextStyle(fontSize: 12),
        textAlign: TextAlign.center,
      ),
    );
  }

  Future<void> _loadForecastWithDefaults() async {
    // Generate forecast with default location when profile is not available
    final forecast = await MLService.generateForecast(
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

    setState(() {
      _currentForecast = forecast;
    });
  }

  Widget _buildTodayForecastCard() {
    if (_currentForecast == null || _currentForecast!.dailyForecasts.isEmpty) {
      return Card(
        margin: const EdgeInsets.all(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text(
                'Loading forecast...',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      );
    }

    final today = _currentForecast!.dailyForecasts.first;
    final now = DateTime.now();

    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Today's forecast",
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              now.toString().split(' ')[0], // Date
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildWeatherItem('Temp', '${today.tempMax.round()}°C'),
                _buildWeatherItem('Rain', '${(today.precipProb * 100).round()}%'),
                _buildWeatherItem('Wind', '${today.windKmh.round()} km/h'),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 100,
              child: MiniChart(
                forecasts: _currentForecast!.dailyForecasts,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ForecastsScreen(),
                      ),
                    );
                  },
                  child: const Text('View Full Forecast'),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const RecommendationsScreen(),
                      ),
                    );
                  },
                  child: const Text('Get Personalized Recommendations'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  // Implement voice help
                },
                icon: const Icon(Icons.volume_up),
                label: const Text('Voice Help Available (Hindi/English)'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeatherItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 12),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ClimaPredict: AI for Rural Resilience'),
        backgroundColor: const Color(0xFF2E7D32),
      ),
      body: Column(
        children: [
          _buildOfflineBanner(),
          Expanded(
            child: _selectedIndex == 0
                ? RefreshIndicator(
                    onRefresh: () async {
                      await _loadForecast(_profile!);
                      await SyncService.triggerManualSync();
                    },
                    child: ListView(
                      children: [
                        // Top area: Location and accuracy
                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Village: ${_profile?.village ?? "Demo Village"}, ${_profile?.state ?? "Gujarat"}',
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Text('Accuracy meter: '),
                                  Text(
                                    '85%',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.green,
                                    ),
                                  ),
                                  const Text(' (NASA + Local Sensors)'),
                                ],
                              ),
                            ],
                          ),
                        ),
                        _buildTodayForecastCard(),
                      ],
                    ),
                  )
                : _buildPlaceholderScreen(),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });

          // Navigate to different screens
          if (index == 1) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const ForecastsScreen()),
            ).then((_) => setState(() => _selectedIndex = 0));
          } else if (index == 2) {
            // Alerts screen - could navigate to insurance predictor
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => const InsurancePredictorScreen()),
            ).then((_) => setState(() => _selectedIndex = 0));
          } else if (index == 3) {
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => const RecommendationsScreen()),
            ).then((_) => setState(() => _selectedIndex = 0));
          } else if (index == 4) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SettingsScreen()),
            ).then((_) => setState(() => _selectedIndex = 0));
          }
        },
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.cloud),
            label: 'Forecasts',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.warning),
            label: 'Alerts',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.lightbulb),
            label: 'Recommendations',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholderScreen() {
    return const Center(
      child: Text('This screen is under development'),
    );
  }
}

