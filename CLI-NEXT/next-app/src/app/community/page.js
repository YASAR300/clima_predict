'use client';

import BottomNavigation from '@/components/BottomNavigation';
import { communityPosts } from '@/data/staticData';

export default function Community() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="px-5 pt-5 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Community</h1>
            <p className="text-sm text-[#B0B0B0]">Connect with farmers in your area</p>
          </div>
        </header>

        {/* Create Post Button */}
        <div className="px-5 mb-6">
          <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <input
                type="text"
                placeholder="Share your farming tips..."
                className="flex-1 bg-transparent text-white placeholder-white/80 outline-none"
              />
              <button className="text-white">
                <span className="text-xl">📤</span>
              </button>
            </div>
          </div>
        </div>

        {/* Community Posts */}
        <div className="px-5 space-y-3">
          {communityPosts.map((post, index) => (
            <div key={index} className="bg-[#252525] rounded-2xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-[#00D09C] rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-2xl">{post.avatar}</span>
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-white mb-1">{post.author}</div>
                  <div className="flex items-center gap-2 text-xs text-[#707070]">
                    <span>📍</span>
                    <span>{post.location}</span>
                    <span>•</span>
                    <span>{post.time}</span>
                  </div>
                </div>
                <button>
                  <span className="text-[#707070]">⋮</span>
                </button>
              </div>
              <div className="text-base text-white mb-4">{post.content}</div>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 bg-[#00D09C]/10 px-3 py-2 rounded-lg">
                  <span className="text-[#00D09C]">👍</span>
                  <span className="text-sm font-semibold text-[#00D09C]">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 bg-[#4D9FFF]/10 px-3 py-2 rounded-lg">
                  <span className="text-[#4D9FFF]">💬</span>
                  <span className="text-sm font-semibold text-[#4D9FFF]">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 bg-[#9D4EDD]/10 px-3 py-2 rounded-lg">
                  <span className="text-[#9D4EDD]">🔗</span>
                  <span className="text-sm font-semibold text-[#9D4EDD]">Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="h-24"></div>
      </div>

      <BottomNavigation />
    </div>
  );
}

