'use client';

import { IoChatbubble, IoVolumeHigh, IoWarning, IoLeaf, IoCash, IoSettingsOutline, IoPerson, IoAdd } from 'react-icons/io5';

const CHANNEL_ICONS = {
    general: <IoChatbubble size={18} />,
    weather: <IoWarning size={18} />,
    'crop-help': <IoLeaf size={18} />,
    'market-prices': <IoCash size={18} />,
    'voice-room': <IoVolumeHigh size={18} />,
    DEFAULT: <IoChatbubble size={18} />
};

export default function ChannelSidebar({ activeGroup, activeChannel, onSelectChannel, user, onCreateChannel }) {
    if (!activeGroup) return null;

    return (
        <div className="w-64 bg-[#111111]/50 backdrop-blur-3xl border-r border-white/5 flex flex-col overflow-hidden h-full">
            {/* Group Header */}
            <div className="p-4 border-b border-white/5">
                <h2 className="text-sm font-black text-white uppercase tracking-widest truncate">{activeGroup.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-[#00D09C] rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                        {activeGroup._count?.members || 1} Farmers Online
                    </span>
                </div>
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-6 mt-4 no-scrollbar">
                <div>
                    <div className="flex items-center justify-between px-3 mb-3">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Topic Channels</h3>
                        <button
                            onClick={onCreateChannel}
                            className="text-white/20 hover:text-[#00D09C] transition-colors"
                        >
                            <IoAdd size={16} />
                        </button>
                    </div>
                    <div className="space-y-1">
                        {activeGroup.channels?.filter(c => c.type === 'TEXT').map((channel) => (
                            <button
                                key={channel.id}
                                onClick={() => onSelectChannel(channel)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${activeChannel?.id === channel.id
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                                    }`}
                            >
                                <span className={activeChannel?.id === channel.id ? 'text-[#00D09C]' : 'opacity-50'}>
                                    {CHANNEL_ICONS[channel.name] || CHANNEL_ICONS.DEFAULT}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider truncate">{channel.name}</span>
                                {channel.name === 'weather' && (
                                    <div className="ml-auto w-2 h-2 bg-[#FFC857] rounded-full" title="New Alert" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="px-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Voice Lounges</h3>
                    <div className="space-y-1">
                        {activeGroup.channels?.filter(c => c.type === 'VOICE').map((channel) => (
                            <button
                                key={channel.id}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:bg-white/5 hover:text-white/70 transition-all group"
                            >
                                <IoVolumeHigh size={18} className="opacity-50" />
                                <span className="text-xs font-bold uppercase tracking-wider truncate">{channel.name}</span>
                                <div className="ml-auto flex -space-x-2">
                                    <div className="w-4 h-4 rounded-full border border-[#111111] bg-gradient-to-br from-[#00D09C] to-[#4D9FFF]" />
                                    <div className="w-4 h-4 rounded-full border border-[#111111] bg-gradient-to-br from-[#FFC857] to-[#FF4D4D]" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Profile Hook (Bottom) */}
            <div className="p-3 bg-white/5 border-t border-white/5">
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-xl flex items-center justify-center text-white border border-white/10 shadow-lg">
                        <IoPerson size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black text-white truncate uppercase tracking-wider">{user?.name || 'Farmer'}</div>
                        <div className="text-[9px] text-[#00D09C] font-bold uppercase tracking-widest">Online</div>
                    </div>
                    <button className="p-2 text-white/20 hover:text-white/60 transition-colors">
                        <IoSettingsOutline size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
