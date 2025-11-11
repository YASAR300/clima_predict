'use client';

import Link from 'next/link';
import BottomNavigation from '@/components/BottomNavigation';

export default function Profile() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white pb-20">
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-b-3xl px-6 pt-6 pb-8">
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mb-4">
              <span className="text-5xl text-[#00D09C]">👤</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">Farmer Name</div>
            <div className="text-sm text-white/70 mb-6">Mumbai, Maharashtra</div>
            <div className="flex justify-around w-full">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-white">15.5</div>
                <div className="text-xs text-white/70">Acres</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-white">4</div>
                <div className="text-xs text-white/70">Crops</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-white">85%</div>
                <div className="text-xs text-white/70">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="px-5 mt-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
          <div className="space-y-3">
            <button className="w-full bg-[#252525] rounded-xl p-4 flex items-center gap-4">
              <div className="bg-[#00D09C]/20 rounded-xl p-3">
                <span className="text-2xl">👤</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-base font-medium text-white">Edit Profile</div>
                <div className="text-sm text-[#B0B0B0]">Update your personal information</div>
              </div>
              <span className="text-[#707070]">›</span>
            </button>
            <Link href="/insurance" className="block w-full bg-[#252525] rounded-xl p-4 flex items-center gap-4">
              <div className="bg-[#4D9FFF]/20 rounded-xl p-3">
                <span className="text-2xl">🛡️</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-base font-medium text-white">Insurance</div>
                <div className="text-sm text-[#B0B0B0]">View your crop insurance details</div>
              </div>
              <span className="text-[#707070]">›</span>
            </Link>
            <button className="w-full bg-[#252525] rounded-xl p-4 flex items-center gap-4">
              <div className="bg-[#9D4EDD]/20 rounded-xl p-3">
                <span className="text-2xl">🔔</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-base font-medium text-white">Notifications</div>
                <div className="text-sm text-[#B0B0B0]">Manage your notification preferences</div>
              </div>
              <span className="text-[#707070]">›</span>
            </button>
          </div>
        </div>

        {/* Resources Section */}
        <div className="px-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Resources</h2>
          <div className="space-y-3">
            <Link href="/weather-tips" className="block w-full bg-[#252525] rounded-xl p-4 flex items-center gap-4">
              <div className="bg-[#FFC857]/20 rounded-xl p-3">
                <span className="text-2xl">💡</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-base font-medium text-white">Weather Tips</div>
                <div className="text-sm text-[#B0B0B0]">Learn about weather patterns</div>
              </div>
              <span className="text-[#707070]">›</span>
            </Link>
            <Link href="/news" className="block w-full bg-[#252525] rounded-xl p-4 flex items-center gap-4">
              <div className="bg-[#FF6B35]/20 rounded-xl p-3">
                <span className="text-2xl">📰</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-base font-medium text-white">News & Updates</div>
                <div className="text-sm text-[#B0B0B0]">Latest agriculture and weather news</div>
              </div>
              <span className="text-[#707070]">›</span>
            </Link>
            <button className="w-full bg-[#252525] rounded-xl p-4 flex items-center gap-4">
              <div className="bg-[#4D9FFF]/20 rounded-xl p-3">
                <span className="text-2xl">❓</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-base font-medium text-white">Help & Support</div>
                <div className="text-sm text-[#B0B0B0]">Get help with the app</div>
              </div>
              <span className="text-[#707070]">›</span>
            </button>
          </div>
        </div>

        {/* Settings Section */}
        <div className="px-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
          <div className="space-y-3">
            <Link href="/settings" className="block w-full bg-[#252525] rounded-xl p-4 flex items-center gap-4">
              <div className="bg-[#00D09C]/20 rounded-xl p-3">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-base font-medium text-white">App Settings</div>
                <div className="text-sm text-[#B0B0B0]">Configure app preferences</div>
              </div>
              <span className="text-[#707070]">›</span>
            </Link>
            <button className="w-full bg-[#252525] rounded-xl p-4 flex items-center gap-4">
              <div className="bg-[#9D4EDD]/20 rounded-xl p-3">
                <span className="text-2xl">🌐</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-base font-medium text-white">Language</div>
                <div className="text-sm text-[#B0B0B0]">English</div>
              </div>
              <span className="text-[#707070]">›</span>
            </button>
            <button className="w-full bg-[#252525] rounded-xl p-4 flex items-center gap-4">
              <div className="bg-[#B0B0B0]/20 rounded-xl p-3">
                <span className="text-2xl">ℹ️</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-base font-medium text-white">About</div>
                <div className="text-sm text-[#B0B0B0]">App version 1.0.0</div>
              </div>
              <span className="text-[#707070]">›</span>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-5 mb-24">
          <button className="w-full bg-[#FF6B35] rounded-xl p-4 text-white font-semibold">
            Logout
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

