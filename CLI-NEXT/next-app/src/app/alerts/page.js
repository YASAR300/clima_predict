'use client';

import Link from 'next/link';
import { weatherAlerts } from '@/data/staticData';

export default function Alerts() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Weather Alerts</h1>
        </header>

        {/* Alert Count Banner */}
        <div className="px-5 mb-4">
          <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div className="text-lg font-bold text-[#FF6B35]">
                {weatherAlerts.length} Active Alerts
              </div>
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="px-5 space-y-4 pb-6">
          {weatherAlerts.map((alert, index) => (
            <div
              key={index}
              className="bg-[#252525] rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: `${alert.color}4D` }}
            >
              <div className="p-4" style={{ backgroundColor: `${alert.color}1A` }}>
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-xl p-3"
                    style={{ backgroundColor: `${alert.color}33` }}
                  >
                    <span className="text-3xl">{alert.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-white mb-1">{alert.title}</div>
                    <div className="text-xs text-[#B0B0B0] uppercase">{alert.severity}</div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm text-[#B0B0B0] mb-4">{alert.description}</div>
                <div className="flex justify-between items-center text-xs text-[#707070]">
                  <div>
                    <div className="mb-1">Start: {alert.startTime}</div>
                    <div>End: {alert.endTime}</div>
                  </div>
                  <div className="px-3 py-1 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: alert.color }}>
                    {alert.type}
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

