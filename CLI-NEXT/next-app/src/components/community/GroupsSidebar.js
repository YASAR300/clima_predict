'use client';

import { IoRocket, IoAdd, IoCompass } from 'react-icons/io5';

export default function GroupsSidebar({ groups, activeGroup, onSelectGroup, onCreateGroup }) {
    return (
        <aside className="w-[72px] bg-[#050505] flex flex-col items-center py-4 space-y-4 border-r border-white/5 h-full z-50">
            {/* Home/Back Button */}
            <button
                onClick={() => window.location.href = '/'}
                className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] text-white flex items-center justify-center hover:rounded-2xl transition-all shadow-xl shadow-[#00D09C]/20 mb-2 group relative"
            >
                <IoCompass size={28} />
                <div className="absolute left-full ml-4 px-3 py-1 bg-white text-[#0D0D0D] text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                    Explore Village
                </div>
            </button>

            <div className="w-8 h-[2px] bg-white/10 rounded-full" />

            {/* Groups List */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar space-y-4 px-2">
                {groups.map((group) => (
                    <button
                        key={group.id}
                        onClick={() => onSelectGroup(group)}
                        className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all group relative ${activeGroup?.id === group.id
                            ? 'bg-[#00D09C] text-[#0D0D0D] rounded-2xl shadow-lg shadow-[#00D09C]/20'
                            : 'bg-white/5 text-white/30 hover:bg-[#00D09C] hover:text-[#0D0D0D] hover:rounded-2xl'
                            }`}
                    >
                        {activeGroup?.id === group.id && (
                            <div className="absolute left-[-8px] w-2 h-8 bg-white rounded-r-full" />
                        )}
                        <span className="text-sm font-black uppercase tracking-tighter">
                            {group.name.substring(0, 2)}
                        </span>
                        <div className="absolute left-full ml-4 px-3 py-1 bg-white text-[#0D0D0D] text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                            {group.name}
                        </div>
                    </button>
                ))}

                {/* Create Group Button */}
                <button
                    onClick={onCreateGroup}
                    className="w-14 h-14 rounded-[1.5rem] bg-white/5 text-[#00D09C] flex items-center justify-center hover:bg-[#00D09C] hover:text-[#0D0D0D] transition-all group shadow-xl"
                >
                    <IoAdd size={30} />
                </button>
            </div>
        </aside>
    );
}
