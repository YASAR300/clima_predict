import 'package:flutter/material.dart';
import 'services/database_service.dart';
import 'services/sync_service.dart';
import 'screens/main/home_screen.dart';
import 'screens/onboarding/welcome_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables from .env file
  // Environment now read via compile-time (ApiConfig). Keep silent if no .env.
  try {} catch (_) {}
  
  // Initialize Hive with error handling
  try {
    await DatabaseService.init();
  } catch (e) {
    debugPrint('Error initializing database: $e');
    // Continue anyway - app will work without persistence
  }
  
  // Initialize background sync
  try {
    await SyncService.initializeBackgroundSync();
  } catch (e) {
    debugPrint('Error initializing background sync: $e');
  }

  runApp(const ClimaPredictApp());
}

class ClimaPredictApp extends StatelessWidget {
  const ClimaPredictApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ClimaPredict: AI for Rural Resilience',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2E7D32), // Green accent
          primary: const Color(0xFF2E7D32),
          error: const Color(0xFFD32F2F), // Danger red
        ),
        scaffoldBackgroundColor: const Color(0xFFFAFAFA), // Neutral background
        useMaterial3: true,
        textTheme: const TextTheme(
          headlineLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          headlineMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          bodyLarge: TextStyle(fontSize: 16),
          bodyMedium: TextStyle(fontSize: 14),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(48, 48),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          ),
        ),
      ),
      home: const AppInitializer(),
    );
  }
}

class AppInitializer extends StatelessWidget {
  const AppInitializer({super.key});

  @override
  Widget build(BuildContext context) {
    // Check if user has completed onboarding
    final profile = DatabaseService.getFarmerProfile();
    
    if (profile == null) {
      return const WelcomeScreen();
    }
    
    return const HomeScreen();
  }
}
