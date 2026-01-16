'use client';

import { IoRocket } from 'react-icons/io5';

export default function ConversationStart({ name, type = 'channel' }) {
    return (
        <div className="flex flex-col items-start justify-end px-4 pt-16 pb-8 border-b border-[#2F3136] mb-4">
            <div className="w-20 h-20 bg-[#5865F2] rounded-full flex items-center justify-center mb-4 shadow-lg">
                <IoRocket size={44} className="text-white" />
            </div>

            <h1 className="text-3xl font-black text-white mb-2">
                Welcome to #{name}!
            </h1>

            <p className="text-[#B9BBBE] text-[15px] leading-snug max-w-md">
                This is the very beginning of your legendary conversation in the **#{name}** {type}.
                Share tips, ask questions, and grow together with the community.
            </p>

            <div className="mt-6 flex items-center gap-4">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#4F545C] hover:bg-[#686D73] text-white rounded-md text-sm font-medium transition-colors">
                    <div className="flex -space-x-2">
                        <div className="w-5 h-5 rounded-full bg-[#3BA55D] border-2 border-[#36393F]" />
                        <div className="w-5 h-5 rounded-full bg-[#FAA61A] border-2 border-[#36393F]" />
                    </div>
                    <span>3 Mutual Villages</span>
                </button>
            </div>
        </div>
    );
}
