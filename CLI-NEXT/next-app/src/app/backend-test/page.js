'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiConfig } from '@/config/apiConfig';
import { apiService } from '@/services/apiService';
import { weatherService } from '@/services/weatherService';
import { getActiveLocation } from '@/utils/locationPreferences';

export default function BackendTest() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults(null);

    // Test backend API health
    const health = await apiService.checkHealth();

    // Test backend forecast endpoint (with sample data)
    const backendForecast = await apiService.getForecast({
      lat: '19.0760',
      lon: '72.8777',
      village: 'Mumbai'
    });

    // Test backend metrics endpoint
    const metrics = await apiService.getMetrics();

    // Test Next.js Weather API - Current Weather
    const activeLocation = getActiveLocation();
    const currentWeather = await weatherService.getCurrentWeather(activeLocation);

    // Test Next.js Weather API - Forecast
    const weatherForecast = await weatherService.getForecast(activeLocation);

    // Test Next.js Weather API - Hourly
    const hourlyForecast = await weatherService.getHourlyForecast(activeLocation);

    const results = {
      backend: {
        health,
        forecast: backendForecast,
        metrics,
      },
      weather: {
        current: currentWeather,
        forecast: weatherForecast,
        hourly: hourlyForecast,
      },
    };

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white pb-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">API Test</h1>
        </header>

        {/* API Info */}
        <div className="px-5 mb-6">
          <div className="bg-[#252525] rounded-2xl p-4">
            <div className="text-sm text-[#B0B0B0] mb-2">Backend API</div>
            <div className="text-base font-mono text-white break-all mb-4">{apiConfig.baseUrl}</div>
            <div className="text-sm text-[#B0B0B0] mb-2">Weather API (Next.js)</div>
            <div className="text-base font-mono text-white break-all">/api/weather/*</div>
          </div>
        </div>

        {/* Test Button */}
        <div className="px-5 mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="w-full bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-xl p-4 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing APIs...' : 'Run All Tests'}
          </button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="px-5 space-y-4 pb-6">
            {/* Backend API Tests */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Backend API Tests</h2>
              <div className="space-y-3">
                {/* Health Endpoint */}
                <div className="bg-[#252525] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-base font-medium text-white">Health Endpoint</div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      testResults.backend.health.success ? 'bg-[#00D09C]/20 text-[#00D09C]' : 'bg-[#FF6B35]/20 text-[#FF6B35]'
                    }`}>
                      {testResults.backend.health.success ? 'OK' : 'FAILED'}
                    </div>
                  </div>
                  {testResults.backend.health.success ? (
                    <div className="text-sm text-[#B0B0B0]">
                      Status: {JSON.stringify(testResults.backend.health.data)}
                    </div>
                  ) : (
                    <div className="text-sm text-[#FF6B35]">
                      Error: {testResults.backend.health.error}
                    </div>
                  )}
                </div>

                {/* Forecast Endpoint */}
                <div className="bg-[#252525] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-base font-medium text-white">Backend Forecast</div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      testResults.backend.forecast.success ? 'bg-[#00D09C]/20 text-[#00D09C]' : 'bg-[#FF6B35]/20 text-[#FF6B35]'
                    }`}>
                      {testResults.backend.forecast.success ? 'OK' : 'FAILED'}
                    </div>
                  </div>
                  {testResults.backend.forecast.success ? (
                    <div className="text-sm text-[#B0B0B0]">
                      Data received: Yes
                    </div>
                  ) : (
                    <div className="text-sm text-[#FF6B35]">
                      Error: {testResults.backend.forecast.error}
                    </div>
                  )}
                </div>

                {/* Metrics Endpoint */}
                <div className="bg-[#252525] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-base font-medium text-white">Metrics Endpoint</div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      testResults.backend.metrics.success ? 'bg-[#00D09C]/20 text-[#00D09C]' : 'bg-[#FF6B35]/20 text-[#FF6B35]'
                    }`}>
                      {testResults.backend.metrics.success ? 'OK' : 'FAILED'}
                    </div>
                  </div>
                  {testResults.backend.metrics.success ? (
                    <div className="text-sm text-[#B0B0B0]">
                      Metrics received: Yes
                    </div>
                  ) : (
                    <div className="text-sm text-[#FF6B35]">
                      Error: {testResults.backend.metrics.error}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Weather API Tests */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Weather API Tests (OpenWeather)</h2>
              <div className="space-y-3">
                {/* Current Weather */}
                <div className="bg-[#252525] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-base font-medium text-white">Current Weather</div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      testResults.weather.current.success ? 'bg-[#00D09C]/20 text-[#00D09C]' : 'bg-[#FF6B35]/20 text-[#FF6B35]'
                    }`}>
                      {testResults.weather.current.success ? 'OK' : 'FAILED'}
                    </div>
                  </div>
                  {testResults.weather.current.success ? (
                    <div className="text-sm text-[#B0B0B0]">
                      {testResults.weather.current.data?.temperature}°C - {testResults.weather.current.data?.location}
                    </div>
                  ) : (
                    <div className="text-sm text-[#FF6B35]">
                      Error: {testResults.weather.current.error}
                    </div>
                  )}
                </div>

                {/* Forecast */}
                <div className="bg-[#252525] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-base font-medium text-white">7-Day Forecast</div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      testResults.weather.forecast.success ? 'bg-[#00D09C]/20 text-[#00D09C]' : 'bg-[#FF6B35]/20 text-[#FF6B35]'
                    }`}>
                      {testResults.weather.forecast.success ? 'OK' : 'FAILED'}
                    </div>
                  </div>
                  {testResults.weather.forecast.success ? (
                    <div className="text-sm text-[#B0B0B0]">
                      {testResults.weather.forecast.data?.length || 0} days forecast received
                    </div>
                  ) : (
                    <div className="text-sm text-[#FF6B35]">
                      Error: {testResults.weather.forecast.error}
                    </div>
                  )}
                </div>

                {/* Hourly Forecast */}
                <div className="bg-[#252525] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-base font-medium text-white">24-Hour Forecast</div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      testResults.weather.hourly.success ? 'bg-[#00D09C]/20 text-[#00D09C]' : 'bg-[#FF6B35]/20 text-[#FF6B35]'
                    }`}>
                      {testResults.weather.hourly.success ? 'OK' : 'FAILED'}
                    </div>
                  </div>
                  {testResults.weather.hourly.success ? (
                    <div className="text-sm text-[#B0B0B0]">
                      {testResults.weather.hourly.data?.length || 0} hours forecast received
                    </div>
                  ) : (
                    <div className="text-sm text-[#FF6B35]">
                      Error: {testResults.weather.hourly.error}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#252525] rounded-2xl p-4 mt-4">
              <div className="text-base font-semibold text-white mb-2">Summary</div>
              <div className="text-sm text-[#B0B0B0] space-y-1">
                {testResults.backend.health.success && testResults.weather.current.success ? (
                  <>
                    <div>✅ Backend API: Connected</div>
                    <div>✅ Weather API: Working</div>
                    <div>✅ All systems operational!</div>
                  </>
                ) : (
                  <>
                    <div>⚠️ Some endpoints failed</div>
                    <div>Check API keys and network connection</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="px-5 mb-6">
          <div className="bg-[#252525] rounded-2xl p-4">
            <div className="text-sm font-semibold text-white mb-2">ℹ️ Instructions</div>
            <div className="text-xs text-[#B0B0B0] space-y-1">
              <div>• Make sure .env.local has OPENWEATHER_API_KEY</div>
              <div>• Backend API: {apiConfig.baseUrl}</div>
              <div>• Weather API uses OpenWeather (server-side)</div>
              <div>• Check browser console for detailed errors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
