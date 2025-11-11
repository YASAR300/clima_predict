'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNavigation from '@/components/BottomNavigation';
import { weatherService } from '@/services/weatherService';

export default function Forecast() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      const result = await weatherService.getForecast();
      if (result.success) {
        setForecastData(result.data);
      }
      setLoading(false);
    };

    fetchForecast();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchForecast, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⛅</div>
          <div className="text-lg text-[#B0B0B0]">Loading forecast...</div>
        </div>
      </div>
    );
  }

  if (!forecastData || forecastData.length === 0) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white pb-20">
        <div className="max-w-md mx-auto px-5 pt-5">
          <div className="text-center py-10">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-lg text-[#B0B0B0]">Unable to load forecast data</div>
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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">7-Day Forecast</h1>
            <Link href="/hourly-forecast" className="p-2">
              <span className="text-xl">🕐</span>
            </Link>
          </div>
        </header>

        {/* Weekly Forecast Cards */}
        <div className="px-5 space-y-3">
          {forecastData.map((forecast, index) => {
            const isSelected = selectedDayIndex === index;
            return (
              <div
                key={index}
                onClick={() => setSelectedDayIndex(index)}
                className={`rounded-3xl p-5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] border-transparent shadow-[0_0_20px_rgba(0,208,156,0.3)]'
                    : 'bg-[#252525] border-[#2A2A2A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`text-xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-white'}`}>
                      {forecast.day}
                    </div>
                    <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-[#B0B0B0]'}`}>
                      {forecast.date}
                    </div>
                  </div>
                  <span className="text-5xl mr-4">{forecast.icon}</span>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${isSelected ? 'text-white' : 'text-white'}`}>
                      {forecast.tempMax}°
                    </div>
                    <div className={`text-lg ${isSelected ? 'text-white/70' : 'text-[#B0B0B0]'}`}>
                      {forecast.tempMin}°
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <>
                    <div className="border-t border-white/30 my-4"></div>
                    <div className="flex justify-around">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-2">💧</span>
                        <span className="text-base font-bold text-white">{forecast.precipitation}%</span>
                        <span className="text-xs text-white/70">Rain</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-2">💨</span>
                        <span className="text-base font-bold text-white">{forecast.windSpeed} km/h</span>
                        <span className="text-xs text-white/70">Wind</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-2">💦</span>
                        <span className="text-base font-bold text-white">{forecast.humidity}%</span>
                        <span className="text-xs text-white/70">Humidity</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="h-24"></div>
      </div>

      <BottomNavigation />
    </div>
  );
}
