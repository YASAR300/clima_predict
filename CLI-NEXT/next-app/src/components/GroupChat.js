'use client';

import { useState, useEffect, useRef } from 'react';
import { IoSend, IoPerson, IoRocket } from 'react-icons/io5';

export default function GroupChat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch messages on mount
    useEffect(() => {
        fetchMessages();
    }, []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/chat/group');
            const data = await response.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        const messageText = newMessage;
        setNewMessage('');

        try {
            const response = await fetch('/api/chat/group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText }),
            });

            const data = await response.json();
            if (data.message) {
                setMessages(prev => [...prev, data.message]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setNewMessage(messageText); // Restore message on error
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-[600px] bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-2xl">
                        <IoRocket size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Community Chat</h2>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Real-time farmer discussions</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading messages...</div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <IoRocket size={48} className="text-white/20 mb-4" />
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No messages yet</p>
                        <p className="text-white/20 text-xs font-medium mt-2">Be the first to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={msg.id || index}
                            className={`flex gap-3 ${msg.isAI ? 'bg-white/5 rounded-2xl p-4' : ''}`}
                        >
                            <div className="flex-shrink-0">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${msg.isAI
                                        ? 'bg-gradient-to-br from-[#9D4EDD] to-[#4D9FFF]'
                                        : 'bg-white/10'
                                    }`}>
                                    {msg.isAI ? (
                                        <IoRocket size={20} className="text-white" />
                                    ) : (
                                        <IoPerson size={20} className="text-white/60" />
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-black text-white">
                                        {msg.isAI ? 'AI Assistant' : (msg.user?.name || 'Anonymous')}
                                    </span>
                                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">
                                        {formatTime(msg.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-white/80 leading-relaxed break-words">
                                    {msg.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-6 border-t border-white/5">
                <div className="relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isSending}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-6 pr-14 py-4 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-[#00D09C]/30 transition-all placeholder:text-white/20"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-[#00D09C] to-[#4D9FFF] rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        <IoSend size={18} className="text-white" />
                    </button>
                </div>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-2 ml-1">
                    {isSending ? 'Sending...' : 'Press Enter to send'}
                </p>
            </form>
        </div>
    );
}
