'use client';

import Link from 'next/link';
import { weatherTips } from '@/data/staticData';

export default function WeatherTips() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/profile" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Weather Tips</h1>
        </header>

        <div className="px-5 space-y-4 pb-6">
          {weatherTips.map((tip, index) => (
            <div key={index} className="bg-[#252525] rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="bg-[#00D09C]/20 rounded-xl p-3">
                  <span className="text-3xl">{tip.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="text-base font-semibold text-white mb-2">{tip.title}</div>
                  <div className="text-sm text-[#B0B0B0] mb-2">{tip.description}</div>
                  <div className="text-xs text-[#707070]">{tip.category}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

