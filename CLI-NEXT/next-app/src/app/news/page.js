'use client';

import Link from 'next/link';
import { newsUpdates } from '@/data/staticData';

export default function News() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/profile" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">News & Updates</h1>
        </header>

        <div className="px-5 space-y-4 pb-6">
          {newsUpdates.map((news, index) => (
            <div key={index} className="bg-[#252525] rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{news.image}</div>
                <div className="flex-1">
                  <div className="text-base font-semibold text-white mb-2">{news.title}</div>
                  <div className="text-sm text-[#B0B0B0] mb-3">{news.description}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-[#707070]">{news.time}</div>
                    <div className="px-2 py-1 bg-[#4D9FFF]/20 rounded text-xs text-[#4D9FFF]">
                      {news.category}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

