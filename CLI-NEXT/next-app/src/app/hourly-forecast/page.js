'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { weatherService } from '@/services/weatherService';

export default function HourlyForecast() {
  const [hourlyData, setHourlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHourly = async () => {
      setLoading(true);
      const result = await weatherService.getHourlyForecast();
      if (result.success) {
        setHourlyData(result.data);
      }
      setLoading(false);
    };

    fetchHourly();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchHourly, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⛅</div>
          <div className="text-lg text-[#B0B0B0]">Loading hourly forecast...</div>
        </div>
      </div>
    );
  }

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white">
        <div className="max-w-md mx-auto px-5 pt-5">
          <header className="flex items-center gap-4 mb-6">
            <Link href="/forecast" className="p-2">
              <span className="text-xl">←</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">24-Hour Forecast</h1>
          </header>
          <div className="text-center py-10">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-lg text-[#B0B0B0]">Unable to load hourly forecast</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/forecast" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">24-Hour Forecast</h1>
        </header>

        {/* Hourly Forecast List */}
        <div className="px-5 space-y-3 pb-6">
          {hourlyData.map((hour, index) => (
            <div key={index} className="bg-[#252525] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-base font-medium text-white w-16">
                    {hour.hour}
                  </div>
                  <div className="text-4xl">{hour.icon}</div>
                  <div>
                    <div className="text-base font-semibold text-white mb-1">
                      {hour.condition}
                    </div>
                    <div className="text-xs text-[#B0B0B0]">
                      💧 {hour.precipitation}% | 💨 {hour.windSpeed} km/h | 💦 {hour.humidity}%
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">
                  {hour.temp}°
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
