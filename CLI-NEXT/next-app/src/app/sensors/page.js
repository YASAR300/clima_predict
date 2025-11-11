'use client';

import Link from 'next/link';
import { sensorData } from '@/data/staticData';

export default function Sensors() {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Optimal':
        return '#00D09C';
      case 'Good':
        return '#4D9FFF';
      case 'High':
        return '#FFC857';
      default:
        return '#B0B0B0';
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white flex-1">IoT Sensors</h1>
          <button className="p-2">
            <span className="text-xl">➕</span>
          </button>
        </header>

        {/* Status Banner */}
        <div className="px-5 mb-6">
          <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3">
                <span className="text-3xl text-[#00D09C]">📡</span>
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-white mb-1">4 Sensors Active</div>
                <div className="text-sm text-white/80">All systems operational</div>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>

        {/* Sensor Cards */}
        <div className="px-5 space-y-4 pb-6">
          {sensorData.map((sensor, index) => {
            const statusColor = getStatusColor(sensor.status);
            return (
              <div key={index} className="bg-[#252525] rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="rounded-xl p-3"
                      style={{ backgroundColor: `${statusColor}20` }}
                    >
                      <span className="text-3xl">{sensor.icon}</span>
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white mb-1">
                        {sensor.name}
                      </div>
                      <div className="text-xs text-[#707070]">
                        Updated {sensor.lastUpdated}
                      </div>
                    </div>
                  </div>
                  <div
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: `${statusColor}33` }}
                  >
                    {sensor.status}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: statusColor }}
                  >
                    {sensor.value}
                  </span>
                  <span className="text-lg text-[#B0B0B0]">{sensor.unit}</span>
                </div>
                <div className="mt-4 w-full bg-[#1A1A1A] rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min((sensor.value / 100) * 100, 100)}%`,
                      backgroundColor: statusColor,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

