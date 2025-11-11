'use client';

import Link from 'next/link';
import { farmingRecommendations } from '@/data/staticData';

export default function FarmingRecommendations() {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return '#FF6B35';
      case 'Medium':
        return '#FFC857';
      case 'Low':
        return '#4D9FFF';
      default:
        return '#B0B0B0';
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/insights" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Farming Recommendations</h1>
        </header>

        <div className="px-5 space-y-4 pb-6">
          {farmingRecommendations.map((rec, index) => {
            const priorityColor = getPriorityColor(rec.priority);
            return (
              <div key={index} className="bg-[#252525] rounded-2xl p-5">
                <div className="flex items-start gap-4 mb-3">
                  <div className="bg-[#00D09C]/20 rounded-xl p-3">
                    <span className="text-3xl">{rec.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-base font-semibold text-white">{rec.title}</div>
                      <div
                        className="px-2 py-1 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: priorityColor }}
                      >
                        {rec.priority}
                      </div>
                    </div>
                    <div className="text-sm text-[#B0B0B0] mb-2">{rec.description}</div>
                    <div className="text-xs text-[#707070]">{rec.category}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

