'use client';

import Link from 'next/link';
import BottomNavigation from '@/components/BottomNavigation';
import GroupChat from '@/components/GroupChat';
import { communityPosts } from '@/data/staticData';
import {
  IoArrowBack,
  IoPerson,
  IoSend,
  IoThumbsUp,
  IoChatbubble,
  IoShareSocial,
  IoLocation
} from 'react-icons/io5';

export default function Community() {
  return (
    <div className="min-h-screen text-white pb-28">
      <div className="max-w-6xl mx-auto px-6 md:px-0">
        <header className="pt-8 pb-4 flex items-center gap-4 md:mb-10">
          <Link href="/" className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-90 transition-all hover:bg-white/10">
            <IoArrowBack size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase">Farmer Community</h1>
            <p className="hidden md:block text-white/40 text-sm font-medium uppercase tracking-widest mt-1">Connect, share insights, and discuss regional agricultural strategies</p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Group Chat Section */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <GroupChat />
          </div>

          {/* Posts Feed */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-4 ml-1">Recent Activities</h2>
            {communityPosts.map((post, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all group">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-2xl w-14 h-14 flex items-center justify-center text-3xl shadow-lg border-2 border-white/10 flex-shrink-0">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="text-lg font-black text-white uppercase">{post.author}</div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">
                        <IoLocation size={12} className="text-[#00D09C]" />
                        <span>{post.location}</span>
                        <span className="opacity-50">•</span>
                        <span>{post.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-lg font-medium text-white/80 leading-relaxed mb-8 uppercase tracking-tight">{post.content}</div>

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-[#00D09C]/10 hover:bg-[#00D09C]/20 px-5 py-3 rounded-2xl transition-all border border-[#00D09C]/10 text-[#00D09C] group/btn">
                    <IoThumbsUp size={18} className="transition-transform group-hover/btn:-rotate-12" />
                    <span className="text-xs font-black uppercase tracking-wider">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 bg-[#4D9FFF]/10 hover:bg-[#4D9FFF]/20 px-5 py-3 rounded-2xl transition-all border border-[#4D9FFF]/10 text-[#4D9FFF] group/btn">
                    <IoChatbubble size={18} className="transition-transform group-hover/btn:scale-110" />
                    <span className="text-xs font-black uppercase tracking-wider">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-2xl transition-all border border-white/5 text-white/60 group/btn">
                    <IoShareSocial size={18} className="transition-transform group-hover/btn:rotate-12" />
                    <span className="text-xs font-black uppercase tracking-wider">Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
