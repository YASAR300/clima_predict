'use client';

import { IoArrowBack, IoArrowForward, IoPin, IoCopy, IoTrash, IoChatbubbleEllipses, IoClose, IoHappyOutline } from 'react-icons/io5';

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😆', '😮', '😢'];
const ALL_EMOJIS = [
    '👍', '❤️', '🔥', '😆', '😮', '😢', '💯', '✨', '🎉', '🙏',
    '✅', '❌', '👀', '🤔', '💀', '🚀', '👏', '🌈', '😍', '😂',
    '✅', '🙄', '😡', '😴', '💪', '🍦', '🍕', '🌸', '🌍', '🏠'
];
const ACTIONS = [
    { id: 'reply', label: 'Reply', icon: IoArrowBack },
    { id: 'forward', label: 'Forward', icon: IoArrowForward },
    { id: 'pin', label: 'Pin Message', icon: IoPin },
    { id: 'copy', label: 'Copy Message Link', icon: IoCopy },
];

export default function MessageContextMenu({ message, onClose, onDelete, onReply, onReact }) {
    const [showAllEmojis, setShowAllEmojis] = useState(false);
    if (!message) return null;

    const handleReact = async (emoji) => {
        try {
            const res = await fetch('/api/community/messages/reactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId: message.id, emoji })
            });
            if (res.ok) {
                const data = await res.json();
                onReact(message.id, emoji, data.action, data.reaction);
            }
        } catch (error) {
            console.error('Reaction failed:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end md:justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Menu Container */}
            <div className="relative w-full max-w-[400px] bg-[#18191C] rounded-[24px] overflow-hidden shadow-2xl animate-menu-pop flex flex-col pointer-events-auto">

                {/* Reactions Tray */}
                <div className="flex items-center justify-between px-4 py-4 bg-[#2F3136]/50 border-b border-white/5">
                    {REACTIONS.map((emoji, i) => (
                        <button
                            key={i}
                            className="text-2xl hover:bg-white/10 p-2 rounded-xl transition-all active:scale-90"
                            onClick={() => { handleReact(emoji); onClose(); }}
                        >
                            {emoji}
                        </button>
                    ))}
                    <button className="p-2 hover:bg-white/10 rounded-xl text-[#B9BBBE] hover:text-white">
                        <IoHappyOutline size={24} />
                    </button>
                </div>

                {/* Primary Actions */}
                <div className="p-2 space-y-0.5">
                    {ACTIONS.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => {
                                if (action.id === 'reply') onReply(message);
                                onClose();
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#4752C4] text-[#B9BBBE] hover:text-white transition-colors group"
                        >
                            <span className="text-[15px] font-medium">{action.label}</span>
                            <action.icon size={20} className="opacity-60 group-hover:opacity-100" />
                        </button>
                    ))}
                </div>

                {/* Secondary Actions Section */}
                <div className="px-2 pb-2 mt-1 pt-1 border-t border-white/5 space-y-0.5">
                    <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#4752C4] text-[#B9BBBE] hover:text-white transition-colors group">
                        <span className="text-[15px] font-medium">Mark Unread</span>
                        <IoChatbubbleEllipses size={20} className="opacity-60 group-hover:opacity-100" />
                    </button>

                    <button
                        onClick={() => { onDelete(message.id); onClose(); }}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#ED4245] text-[#ED4245] hover:text-white transition-colors group"
                    >
                        <span className="text-[15px] font-medium">Delete Message</span>
                        <IoTrash size={20} className="opacity-60 group-hover:opacity-100" />
                    </button>
                </div>
            </div>

            {/* Close button for accessibility on mobile */}
            <button
                onClick={onClose}
                className="mt-4 p-3 bg-white/10 rounded-full text-white md:hidden animate-menu-pop flex items-center justify-center"
            >
                <IoClose size={24} />
            </button>
        </div>
    );
}
