'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/profile" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">App Settings</h1>
        </header>

        <div className="px-5 space-y-4 pb-6">
          <div className="bg-[#252525] rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">Notifications</h2>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-white">Push Notifications</div>
                <div className="text-xs text-[#B0B0B0]">Receive weather alerts</div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-[#00D09C]' : 'bg-[#707070]'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                ></div>
              </button>
            </div>
          </div>

          <div className="bg-[#252525] rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">Location</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Location Services</div>
                <div className="text-xs text-[#B0B0B0]">Use your current location</div>
              </div>
              <button
                onClick={() => setLocation(!location)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  location ? 'bg-[#00D09C]' : 'bg-[#707070]'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    location ? 'translate-x-6' : 'translate-x-1'
                  }`}
                ></div>
              </button>
            </div>
          </div>

          <div className="bg-[#252525] rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">Units</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-[#1A1A1A] rounded-xl">
                <div className="text-sm font-medium text-white">Temperature: Celsius</div>
              </button>
              <button className="w-full text-left p-3 bg-[#1A1A1A] rounded-xl">
                <div className="text-sm font-medium text-white">Wind Speed: km/h</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

