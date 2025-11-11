'use client';

import Link from 'next/link';
import BottomNavigation from '@/components/BottomNavigation';
import { weatherStats, achievements } from '@/data/staticData';

export default function Insights() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="px-5 pt-5 pb-4">
          <h1 className="text-2xl font-bold text-white">Insights</h1>
        </header>

        {/* Quick Stats */}
        <div className="px-5 mb-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#252525] rounded-2xl p-4 border border-[#FF6B35]/30">
              <div className="text-3xl mb-2">🌡️</div>
              <div className="text-xl font-bold text-[#FF6B35] mb-1">{weatherStats.avgTemp}°C</div>
              <div className="text-xs text-[#B0B0B0]">Avg Temp</div>
            </div>
            <div className="bg-[#252525] rounded-2xl p-4 border border-[#4D9FFF]/30">
              <div className="text-3xl mb-2">🌧️</div>
              <div className="text-xl font-bold text-[#4D9FFF] mb-1">{weatherStats.totalRainfall}mm</div>
              <div className="text-xs text-[#B0B0B0]">Total Rain</div>
            </div>
            <div className="bg-[#252525] rounded-2xl p-4 border border-[#FFC857]/30">
              <div className="text-3xl mb-2">☀️</div>
              <div className="text-xl font-bold text-[#FFC857] mb-1">{weatherStats.sunnyDays}</div>
              <div className="text-xs text-[#B0B0B0]">Sunny Days</div>
            </div>
            <div className="bg-[#252525] rounded-2xl p-4 border border-[#9D4EDD]/30">
              <div className="text-3xl mb-2">💨</div>
              <div className="text-xl font-bold text-[#9D4EDD] mb-1">{weatherStats.avgWindSpeed} km/h</div>
              <div className="text-xs text-[#B0B0B0]">Avg Wind</div>
            </div>
          </div>
        </div>

        {/* Explore Section */}
        <div className="px-5 mt-6 mb-4">
          <h2 className="text-lg font-semibold text-white mb-4">Explore</h2>
          <div className="space-y-3">
            <Link href="/farming-recommendations" className="block bg-[#252525] rounded-2xl p-4 border border-[#00D09C]/30">
              <div className="flex items-center gap-4">
                <div className="bg-[#00D09C]/20 rounded-xl p-3">
                  <span className="text-3xl">🌱</span>
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-white mb-1">Farming Recommendations</div>
                  <div className="text-sm text-[#B0B0B0]">AI-powered tips for your crops</div>
                </div>
                <span className="text-[#707070]">›</span>
              </div>
            </Link>
            <Link href="/crop-health" className="block bg-[#252525] rounded-2xl p-4 border border-[#4D9FFF]/30">
              <div className="flex items-center gap-4">
                <div className="bg-[#4D9FFF]/20 rounded-xl p-3">
                  <span className="text-3xl">🌾</span>
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-white mb-1">Crop Health Monitor</div>
                  <div className="text-sm text-[#B0B0B0]">Track your crop health and yield</div>
                </div>
                <span className="text-[#707070]">›</span>
              </div>
            </Link>
            <Link href="/market-prices" className="block bg-[#252525] rounded-2xl p-4 border border-[#FFC857]/30">
              <div className="flex items-center gap-4">
                <div className="bg-[#FFC857]/20 rounded-xl p-3">
                  <span className="text-3xl">💰</span>
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-white mb-1">Market Prices</div>
                  <div className="text-sm text-[#B0B0B0]">Live crop prices and trends</div>
                </div>
                <span className="text-[#707070]">›</span>
              </div>
            </Link>
            <Link href="/weather-statistics" className="block bg-[#252525] rounded-2xl p-4 border border-[#9D4EDD]/30">
              <div className="flex items-center gap-4">
                <div className="bg-[#9D4EDD]/20 rounded-xl p-3">
                  <span className="text-3xl">📊</span>
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-white mb-1">Weather Statistics</div>
                  <div className="text-sm text-[#B0B0B0]">Historical weather data analysis</div>
                </div>
                <span className="text-[#707070]">›</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Achievements */}
        <div className="px-5 mt-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Achievements</h2>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`bg-[#252525] rounded-xl p-4 border ${
                  achievement.unlocked
                    ? 'border-[#00D09C]/30'
                    : 'border-[#2A2A2A]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-xl p-3 ${
                      achievement.unlocked
                        ? 'bg-[#00D09C]/20'
                        : 'bg-[#707070]/10'
                    }`}
                    style={{ opacity: achievement.unlocked ? 1 : 0.3 }}
                  >
                    <span className="text-3xl">{achievement.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-medium text-white mb-1">{achievement.title}</div>
                    <div className="text-sm text-[#B0B0B0] mb-2">{achievement.description}</div>
                    {!achievement.unlocked && achievement.progress && (
                      <div className="w-full bg-[#707070]/20 rounded-full h-2">
                        <div
                          className="bg-[#00D09C] h-2 rounded-full"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-24"></div>
      </div>

      <BottomNavigation />
    </div>
  );
}

