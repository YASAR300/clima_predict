'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo } from 'react';

const DynamicWeatherMap = dynamic(
  () => import('@/components/WeatherMap/WeatherMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-[#252525] rounded-2xl p-8 h-[400px] flex items-center justify-center border border-white/10">
        <div className="text-center space-y-3">
          <div className="animate-spin text-4xl">🛰️</div>
          <p className="text-sm text-[#B0B0B0]">Loading interactive map…</p>
        </div>
      </div>
    ),
  }
);

export default function WeatherMap() {
  const infoCards = useMemo(
    () => [
      {
        title: 'How to use',
        description:
          'Toggle between multiple OpenWeatherMap layers, adjust opacity, or search for any city to inspect real-time conditions.',
        emoji: '🧭',
      },
      {
        title: 'Tip',
        description:
          'Click anywhere on the map to sample live weather data or enable “Use my location” for a personalised view.',
        emoji: '🎯',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto pb-12">
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
          >
            <span className="text-xl">←</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">
              Weather Map
            </h1>
            <p className="text-xs text-[#B0B0B0] mt-1">
              Powered by Leaflet.js and OpenWeatherMap tiles.
            </p>
          </div>
        </header>

        <main className="px-5 space-y-5">
          <DynamicWeatherMap />

          <div className="grid grid-cols-1 gap-3">
            {infoCards.map((card) => (
              <div
                key={card.title}
                className="bg-[#252525] rounded-2xl p-4 border border-white/10 flex gap-4"
              >
                <div className="text-3xl">{card.emoji}</div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {card.title}
                  </p>
                  <p className="text-xs text-[#B0B0B0] leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}


