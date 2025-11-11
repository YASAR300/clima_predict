'use client';

import Link from 'next/link';

export default function WeatherMap() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Weather Map</h1>
        </header>

        {/* Map Placeholder */}
        <div className="px-5 mb-6">
          <div className="bg-[#252525] rounded-2xl p-8 h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <div className="text-lg font-semibold text-white mb-2">Weather Map</div>
              <div className="text-sm text-[#B0B0B0]">
                Interactive weather map coming soon
              </div>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="px-5 mb-6">
          <div className="bg-[#252525] rounded-2xl p-4">
            <div className="flex justify-around">
              <button className="flex flex-col items-center gap-2">
                <div className="bg-[#4D9FFF]/20 rounded-xl p-3">
                  <span className="text-2xl">🌦️</span>
                </div>
                <span className="text-xs text-[#B0B0B0]">Precipitation</span>
              </button>
              <button className="flex flex-col items-center gap-2">
                <div className="bg-[#FF6B35]/20 rounded-xl p-3">
                  <span className="text-2xl">🌡️</span>
                </div>
                <span className="text-xs text-[#B0B0B0]">Temperature</span>
              </button>
              <button className="flex flex-col items-center gap-2">
                <div className="bg-[#00D09C]/20 rounded-xl p-3">
                  <span className="text-2xl">💨</span>
                </div>
                <span className="text-xs text-[#B0B0B0]">Wind</span>
              </button>
              <button className="flex flex-col items-center gap-2">
                <div className="bg-[#9D4EDD]/20 rounded-xl p-3">
                  <span className="text-2xl">☁️</span>
                </div>
                <span className="text-xs text-[#B0B0B0]">Clouds</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

