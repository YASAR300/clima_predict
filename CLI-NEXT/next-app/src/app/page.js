'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNavigation from '@/components/BottomNavigation';
import { weatherAlerts } from '@/data/staticData';
import { apiService } from '@/services/apiService';
import { weatherService } from '@/services/weatherService';

export default function Home() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [airQuality, setAirQuality] = useState(null);

  useEffect(() => {
    // Check API health and fetch weather data
    const initializeData = async () => {
      setLoading(true);
      
      // Check backend API health
      const health = await apiService.checkHealth();
      setApiStatus(health.success ? 'connected' : 'disconnected');
      
      // Fetch real weather data
      const weather = await weatherService.getCurrentWeather();
      if (weather.success) {
        setWeatherData(weather.data);
        if (weather.data.airQuality) {
          setAirQuality({
            aqi: weather.data.airQuality.aqi * 20, // Convert 1-5 to 0-100 scale
            category: weather.data.airQuality.category,
            pm25: weather.data.airQuality.pm25,
            pm10: weather.data.airQuality.pm10,
            recommendation: getAQIRecommendation(weather.data.airQuality.aqi),
          });
        }
      }
      
      setLoading(false);
    };

    initializeData();
    
    // Refresh every 10 minutes
    const interval = setInterval(initializeData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getAQIRecommendation = (aqi) => {
    const recommendations = {
      1: 'Air quality is good. Enjoy outdoor activities.',
      2: 'Air quality is acceptable for most people.',
      3: 'Sensitive groups should limit outdoor activities',
      4: 'Everyone should limit outdoor activities',
      5: 'Avoid outdoor activities if possible',
    };
    return recommendations[aqi] || 'Check air quality before going outside';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⛅</div>
          <div className="text-lg text-[#B0B0B0]">Loading weather data...</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white pb-20">
        <div className="max-w-md mx-auto px-5 pt-5">
          <div className="text-center py-10">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-lg text-[#B0B0B0] mb-2">Unable to load weather data</div>
            <div className="text-sm text-[#707070] mb-4">Please check your internet connection</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#00D09C] text-[#0D0D0D] px-4 py-2 rounded-xl font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="px-5 pt-5 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white">ClimaPredict</h1>
              <div className="flex items-center mt-1 gap-2">
                <span className="text-[#00D09C] text-sm">📍</span>
                <span className="text-sm text-[#B0B0B0]">{weatherData.location}</span>
                {apiStatus === 'connected' && (
                  <span className="text-xs bg-[#00D09C]/20 text-[#00D09C] px-2 py-1 rounded">Live</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/alerts" className="p-2">
                <span className="text-xl">🔔</span>
              </Link>
              <Link href="/settings" className="p-2">
                <span className="text-xl">⚙️</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Current Weather Card */}
        <div className="px-5 mb-6">
          <Link href="/weather-details">
            <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-3xl p-6 shadow-[0_0_20px_rgba(0,208,156,0.3)]">
              <div className="text-center">
                <div className="text-7xl font-bold text-white mb-2">
                  {weatherData.temperature}°
                </div>
                <div className="text-2xl text-white mb-2">{weatherData.condition}</div>
                <div className="text-base text-white/80 mb-6">
                  Feels like {weatherData.feelsLike}°
                </div>
                <div className="flex justify-around">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-2">💧</span>
                    <span className="text-base font-bold text-white">{weatherData.humidity}%</span>
                    <span className="text-xs text-white/70">Humidity</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-2">💨</span>
                    <span className="text-base font-bold text-white">{weatherData.windSpeed} km/h</span>
                    <span className="text-xs text-white/70">Wind</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-2">👁️</span>
                    <span className="text-base font-bold text-white">{weatherData.visibility} km</span>
                    <span className="text-xs text-white/70">Visibility</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/weather-map" className="bg-[#252525] rounded-2xl p-4 border border-[#4D9FFF]/30">
              <div className="bg-[#4D9FFF]/20 rounded-xl p-3 w-fit mb-3">
                <span className="text-3xl">🗺️</span>
              </div>
              <div className="text-base font-medium text-white">Weather Map</div>
            </Link>
            <Link href="/sensors" className="bg-[#252525] rounded-2xl p-4 border border-[#9D4EDD]/30">
              <div className="bg-[#9D4EDD]/20 rounded-xl p-3 w-fit mb-3">
                <span className="text-3xl">📡</span>
              </div>
              <div className="text-base font-medium text-white">Sensors</div>
            </Link>
            <Link href="/alerts" className="bg-[#252525] rounded-2xl p-4 border border-[#FF6B35]/30">
              <div className="bg-[#FF6B35]/20 rounded-xl p-3 w-fit mb-3">
                <span className="text-3xl">⚠️</span>
              </div>
              <div className="text-base font-medium text-white">Alerts</div>
            </Link>
            <Link href="/backend-test" className="bg-[#252525] rounded-2xl p-4 border border-[#FFC857]/30">
              <div className="bg-[#FFC857]/20 rounded-xl p-3 w-fit mb-3">
                <span className="text-3xl">🔌</span>
              </div>
              <div className="text-base font-medium text-white">Backend Test</div>
            </Link>
          </div>
        </div>

        {/* Weather Alerts */}
        {weatherAlerts.length > 0 && (
          <div className="px-5 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Active Alerts</h2>
            <div className="space-y-3">
              {weatherAlerts.slice(0, 2).map((alert, index) => (
                <Link key={index} href="/alerts" className="block">
                  <div className="bg-[#252525] rounded-2xl p-4 border" style={{ borderColor: `${alert.color}4D` }}>
                    <div className="flex items-start gap-4">
                      <div className="bg-opacity-20 rounded-xl p-3" style={{ backgroundColor: `${alert.color}33` }}>
                        <span className="text-2xl">{alert.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-medium text-white mb-1">{alert.title}</div>
                        <div className="text-sm text-[#B0B0B0] line-clamp-2">{alert.description}</div>
                      </div>
                      <span className="text-[#707070]">›</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Air Quality */}
        {airQuality && (
          <div className="px-5 mb-24">
            <h2 className="text-lg font-semibold text-white mb-4">Air Quality</h2>
            <div className="bg-[#252525] rounded-2xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm text-[#B0B0B0] mb-1">AQI</div>
                  <div className="text-5xl font-bold text-[#FFC857] mb-1">{airQuality.aqi}</div>
                  <div className="text-sm text-[#B0B0B0]">{airQuality.category}</div>
                </div>
                <div className="bg-[#FFC857]/20 rounded-full p-4">
                  <span className="text-5xl">🌬️</span>
                </div>
              </div>
              <div className="text-sm text-[#B0B0B0]">{airQuality.recommendation}</div>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
