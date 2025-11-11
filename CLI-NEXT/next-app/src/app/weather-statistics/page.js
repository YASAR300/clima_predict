'use client';

import Link from 'next/link';
import { weatherStats } from '@/data/staticData';

export default function WeatherStatistics() {
  const stats = [
    { label: 'Average Temperature', value: `${weatherStats.avgTemp}°C`, icon: '🌡️', color: '#FF6B35' },
    { label: 'Maximum Temperature', value: `${weatherStats.maxTemp}°C`, icon: '🔥', color: '#FF6B35' },
    { label: 'Minimum Temperature', value: `${weatherStats.minTemp}°C`, icon: '❄️', color: '#4D9FFF' },
    { label: 'Total Rainfall', value: `${weatherStats.totalRainfall} mm`, icon: '🌧️', color: '#4D9FFF' },
    { label: 'Rainy Days', value: `${weatherStats.rainyDays}`, icon: '☔', color: '#4D9FFF' },
    { label: 'Sunny Days', value: `${weatherStats.sunnyDays}`, icon: '☀️', color: '#FFC857' },
    { label: 'Cloudy Days', value: `${weatherStats.cloudyDays}`, icon: '☁️', color: '#9D4EDD' },
    { label: 'Average Humidity', value: `${weatherStats.avgHumidity}%`, icon: '💧', color: '#00D09C' },
    { label: 'Average Wind Speed', value: `${weatherStats.avgWindSpeed} km/h`, icon: '💨', color: '#9D4EDD' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/insights" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Weather Statistics</h1>
        </header>

        <div className="px-5 grid grid-cols-2 gap-3 pb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#252525] rounded-2xl p-4 border"
              style={{ borderColor: `${stat.color}30` }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-xs text-[#B0B0B0] mb-2">{stat.label}</div>
              <div
                className="text-xl font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

