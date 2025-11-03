class ApiConfig {
  // Read from compile-time environment if provided, else default
  static const String _compiledBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000', // Android emulator localhost
  );

  static String get baseUrl => _compiledBaseUrl;
  
  // For production, use: https://climapredict-api.onrender.com
  // For physical device, use: http://YOUR_IP:3000

  // API endpoints
  static String get forecastEndpoint => '$baseUrl/api/v1/forecast';
  static String get feedbackEndpoint => '$baseUrl/api/v1/feedback';
  static String get sensorEndpoint => '$baseUrl/api/v1/sensor';
  static String get syncEndpoint => '$baseUrl/api/v1/sync';
  static String get modelEndpoint => '$baseUrl/api/v1/model/latest';
  static String get claimEstimateEndpoint => '$baseUrl/api/v1/claim_estimate';
  static String get metricsEndpoint => '$baseUrl/api/v1/metrics';

  // Health check
  static String get healthEndpoint => '$baseUrl/health';
}

