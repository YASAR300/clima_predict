import 'package:flutter/material.dart';
import 'services/database_service.dart';
import 'services/settings_service.dart';
import 'pages/forecast_page.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await DatabaseService.init();
  await SettingsService.init();
  runApp(const ClimaPredictApp());
}

class ClimaPredictApp extends StatelessWidget {
  const ClimaPredictApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = ThemeData.dark().copyWith(
      scaffoldBackgroundColor: Colors.black,
      appBarTheme: const AppBarTheme(backgroundColor: Colors.black, foregroundColor: Colors.white),
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0F9D58), brightness: Brightness.dark),
    );
    return MaterialApp(
      title: 'ClimaPredict',
      theme: theme,
      debugShowCheckedModeBanner: false,
      home: const ForecastPage(),
    );
  }
}
