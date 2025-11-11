'use client';

import Link from 'next/link';
import { cropHealth } from '@/data/staticData';

export default function CropHealth() {
  const getHealthColor = (health) => {
    if (health >= 85) return '#00D09C';
    if (health >= 70) return '#FFC857';
    return '#FF6B35';
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/insights" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Crop Health Monitor</h1>
        </header>

        <div className="px-5 space-y-4 pb-6">
          {cropHealth.map((crop, index) => {
            const healthColor = getHealthColor(crop.health);
            return (
              <div key={index} className="bg-[#252525] rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xl font-bold text-white mb-1">{crop.crop}</div>
                    <div className="text-sm text-[#B0B0B0]">{crop.area} • {crop.stage}</div>
                  </div>
                  <div
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: `${healthColor}33` }}
                  >
                    {crop.status}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#B0B0B0]">Health Score</span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: healthColor }}
                    >
                      {crop.health}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-3">
                    <div
                      className="h-3 rounded-full"
                      style={{
                        width: `${crop.health}%`,
                        backgroundColor: healthColor,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-[#B0B0B0] mb-2">
                  Expected Yield: <span className="text-white font-semibold">{crop.expectedYield}</span>
                </div>
                {crop.issues.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                    <div className="text-xs text-[#FF6B35] font-semibold mb-2">Issues:</div>
                    {crop.issues.map((issue, i) => (
                      <div key={i} className="text-sm text-[#B0B0B0]">• {issue}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

