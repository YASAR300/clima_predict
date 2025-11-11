'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { weatherService } from '@/services/weatherService';

export default function WeatherDetails() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      const result = await weatherService.getCurrentWeather();
      if (result.success) {
        setWeatherData(result.data);
      }
      setLoading(false);
    };

    fetchWeather();
  }, []);

  if (loading || !weatherData) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⛅</div>
          <div className="text-lg text-[#B0B0B0]">Loading weather details...</div>
        </div>
      </div>
    );
  }

  const detailCards = [
    { icon: '🌡️', label: 'Feels Like', value: `${weatherData.feelsLike}°C`, color: '#FF6B35' },
    { icon: '💧', label: 'Humidity', value: `${weatherData.humidity}%`, color: '#4D9FFF' },
    { icon: '💨', label: 'Wind Speed', value: `${weatherData.windSpeed} km/h`, color: '#00D09C' },
    { icon: '🧭', label: 'Wind Direction', value: weatherData.windDirection, color: '#9D4EDD' },
    { icon: '📊', label: 'Pressure', value: `${weatherData.pressure} hPa`, color: '#FFC857' },
    { icon: '👁️', label: 'Visibility', value: `${weatherData.visibility} km`, color: '#4D9FFF' },
    { icon: '☁️', label: 'Cloud Cover', value: `${weatherData.cloudCover}%`, color: '#9D4EDD' },
    { icon: '💨', label: 'Dew Point', value: `${weatherData.dewPoint}°C`, color: '#00D09C' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Weather Details</h1>
        </header>

        {/* Main Weather Card */}
        <div className="px-5 mb-6">
          <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-3xl p-6 text-center">
            <div className="text-8xl mb-4">{weatherData.icon}</div>
            <div className="text-6xl font-bold text-white mb-2">
              {weatherData.temperature}°
            </div>
            <div className="text-2xl text-white mb-2">{weatherData.condition}</div>
            <div className="text-base text-white/70 mb-1">{weatherData.description}</div>
            <div className="text-base text-white/70">{weatherData.location}</div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="px-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Detailed Information</h2>
          <div className="grid grid-cols-2 gap-3">
            {detailCards.map((card, index) => (
              <div
                key={index}
                className="bg-[#252525] rounded-2xl p-4 border"
                style={{ borderColor: `${card.color}30` }}
              >
                <div className="text-3xl mb-2">{card.icon}</div>
                <div className="text-xs text-[#B0B0B0] mb-1">{card.label}</div>
                <div
                  className="text-xl font-bold"
                  style={{ color: card.color }}
                >
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Air Quality */}
        {weatherData.airQuality && (
          <div className="px-5 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Air Quality</h2>
            <div className="bg-[#252525] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-sm text-[#B0B0B0] mb-1">AQI</div>
                  <div className="text-4xl font-bold text-[#FFC857] mb-1">
                    {weatherData.airQuality.aqi * 20}
                  </div>
                  <div className="text-sm text-[#B0B0B0]">{weatherData.airQuality.category}</div>
                </div>
                <div className="bg-[#FFC857]/20 rounded-full p-4">
                  <span className="text-4xl">🌬️</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[#B0B0B0]">PM2.5</div>
                  <div className="text-white font-semibold">{weatherData.airQuality.pm25?.toFixed(1)} µg/m³</div>
                </div>
                <div>
                  <div className="text-[#B0B0B0]">PM10</div>
                  <div className="text-white font-semibold">{weatherData.airQuality.pm10?.toFixed(1)} µg/m³</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-6"></div>
      </div>
    </div>
  );
}
