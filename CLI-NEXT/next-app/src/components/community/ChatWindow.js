'use client';

import { useState, useEffect, useRef } from 'react';
import { IoSend, IoMic, IoPerson, IoRocket, IoHappyOutline, IoAdd, IoChevronBack, IoSearch, IoPeople, IoMenu, IoTrash } from 'react-icons/io5';
import { getPusherClient } from '@/utils/pusher';
import ConversationStart from './ConversationStart';
import MessageContextMenu from './MessageContextMenu';

export default function ChatWindow({ activeChannel, user, onBack }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [onlineCount, setOnlineCount] = useState(1);
    const [longPressedMessage, setLongPressedMessage] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const longPressTimerRef = useRef(null);

    useEffect(() => {
        if (isRecording) {
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    useEffect(() => {
        if (!activeChannel) return;
        setMessages([]);
        fetchMessages();

        const pusher = getPusherClient();
        if (pusher) {
            const channel = pusher.subscribe(`presence-channel-${activeChannel.id}`);

            channel.bind('pusher:subscription_succeeded', (members) => {
                setOnlineCount(members.count);
            });

            channel.bind('pusher:member_added', () => {
                setOnlineCount(prev => prev + 1);
            });

            channel.bind('pusher:member_removed', () => {
                setOnlineCount(prev => Math.max(1, prev - 1));
            });

            channel.bind('new-message', (data) => {
                setMessages((prev) => {
                    if (prev.find(m => m.id === data.id)) return prev;
                    const optimisticIdx = prev.findIndex(m =>
                        m.id.startsWith?.('temp-') &&
                        m.userId === data.userId &&
                        (m.message === data.message || m.audioUrl === data.audioUrl)
                    );

                    if (optimisticIdx !== -1) {
                        const newMessages = [...prev];
                        newMessages[optimisticIdx] = data;
                        return newMessages;
                    }
                    return [...prev, data];
                });
                scrollToBottom();
            });

            channel.bind('message-reaction', (data) => {
                setMessages(prev => prev.map(m => {
                    if (m.id !== data.messageId) return m;
                    const reactions = m.reactions || [];
                    if (data.action === 'removed') {
                        return { ...m, reactions: reactions.filter(r => !(r.userId === data.userId && r.emoji === data.emoji)) };
                    } else {
                        // Check if already exists to avoid duplicate local updates
                        if (reactions.find(r => r.userId === data.userId && r.emoji === data.emoji)) return m;
                        return { ...m, reactions: [...reactions, data.reaction] };
                    }
                }));
            });

            channel.bind('message-deleted', (data) => {
                setMessages(prev => prev.filter(m => m.id !== data.id));
            });
        }

        return () => {
            const pusher = getPusherClient();
            if (pusher) {
                pusher.unsubscribe(`presence-channel-${activeChannel.id}`);
            }
        };
    }, [activeChannel]);

    const toggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
                await sendAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(1000);
            setIsRecording(true);
        } catch (err) {
            console.error('Error starting recording:', err);
            alert('Could not access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendAudio = async (blob) => {
        setIsSending(true);
        try {
            const extension = blob.type.includes('webm') ? 'webm' : 'mp4';
            const formData = new FormData();
            formData.append('file', blob);
            formData.append('extension', extension);

            const uploadRes = await fetch('/api/community/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const { url } = await uploadRes.json();

            const optimisticMessage = {
                id: 'temp-' + Date.now(),
                userId: user?.id,
                message: 'Voice Note',
                audioUrl: url,
                createdAt: new Date().toISOString(),
                user: { id: user?.id, name: user?.name || 'Farmer' }
            };
            setMessages((prev) => [...prev, optimisticMessage]);

            await fetch('/api/community/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelId: activeChannel.id,
                    message: 'Voice Note',
                    audioUrl: url
                }),
            });
        } catch (error) {
            console.error('Voice note failed:', error);
        } finally {
            setIsSending(false);
        }
    };

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/community/messages?channelId=${activeChannel.id}`);
            const data = await response.json();
            if (data.messages) setMessages(data.messages);
        } catch (error) {
            console.error('Fetch messages failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const text = newMessage;
        setNewMessage('');
        setIsSending(true);

        const optimisticMessage = {
            id: 'temp-' + Date.now(),
            userId: user?.id,
            message: text,
            createdAt: new Date().toISOString(),
            user: { id: user?.id, name: user?.name || 'Farmer' }
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const body = {
                channelId: activeChannel.id,
                message: text,
                repliedToId: replyingTo?.id
            };

            const res = await fetch('/api/community/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Failed to send');

            setReplyingTo(null);

            const pusher = getPusherClient();
            if (pusher) {
                pusher.trigger(`presence-channel-${activeChannel.id}`, 'new-message', optimisticMessage);
            }

            if (text.includes('@AI')) handleAICall(text);
        } catch (error) {
            setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
            setNewMessage(text);
        } finally {
            setIsSending(false);
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            const res = await fetch(`/api/community/messages?id=${messageId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setMessages(prev => prev.filter(m => m.id !== messageId));
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleLongPress = (msg) => {
        if (window.navigator.vibrate) window.navigator.vibrate(50);
        setLongPressedMessage(msg);
    };

    const startLongPressTimer = (msg) => {
        longPressTimerRef.current = setTimeout(() => handleLongPress(msg), 500);
    };

    const clearLongPressTimer = () => {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsSending(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('extension', file.name.split('.').pop());

        try {
            const uploadRes = await fetch('/api/community/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (uploadData.success) {
                const messageRes = await fetch('/api/community/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        channelId: activeChannel.id,
                        fileUrl: uploadData.url,
                        fileType: file.type.startsWith('image') ? 'image' : (file.type.startsWith('video') ? 'video' : 'file'),
                        message: '' // Empty text for file-only messages
                    })
                });
                if (!messageRes.ok) throw new Error('Failed to save message');
            }
        } catch (error) {
            console.error('File upload failed:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleAICall = async (query) => {
        try {
            await fetch('/api/community/ai/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelId: activeChannel.id,
                    message: query,
                    context: {
                        channelName: activeChannel.name,
                        userLocation: user?.location
                    }
                }),
            });
        } catch (e) {
            console.error('AI call failed:', e);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!activeChannel) {
        return (
            <div className="flex-1 bg-[#36393F] flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 bg-[#4F545C] rounded-3xl flex items-center justify-center mb-6">
                    <IoRocket size={40} className="text-white/20" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Select a Village</h2>
                <p className="text-[#8E9297] text-center text-sm">Swipe from the left to explore villages and channels.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#36393F] h-full overflow-hidden relative">
            {/* Header */}
            <header className="h-[48px] px-2 flex items-center justify-between border-b border-[#202225] shadow-sm bg-[#36393F] z-20">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-2 md:hidden text-[#B9BBBE] hover:text-white">
                        <IoChevronBack size={24} />
                    </button>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#8E9297] text-xl font-light">#</span>
                        <div>
                            <h2 className="text-[15px] font-bold text-white truncate max-w-[150px] leading-tight">{activeChannel.name}</h2>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-[#3BA55D]" />
                                <span className="text-[10px] text-[#B9BBBE] font-medium">{onlineCount} Online</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-3 px-2">
                    <button className="p-2 text-[#B9BBBE] hover:text-white transition-colors">
                        <IoSearch size={22} />
                    </button>
                    <button className="p-2 text-[#B9BBBE] hover:text-white transition-colors">
                        <IoPeople size={22} />
                    </button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 no-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <ConversationStart name={activeChannel.name} />
                        {messages.map((msg, idx) => {
                            const showHeader = idx === 0 || messages[idx - 1].userId !== msg.userId || (new Date(msg.createdAt) - new Date(messages[idx - 1].createdAt) > 300000);
                            return (
                                <div
                                    key={msg.id || idx}
                                    className={`flex gap-4 ${showHeader ? 'mt-4' : 'mt-1'} group active:bg-white/5 transition-colors cursor-pointer select-none`}
                                    onMouseDown={() => startLongPressTimer(msg)}
                                    onMouseUp={clearLongPressTimer}
                                    onMouseLeave={clearLongPressTimer}
                                    onTouchStart={() => startLongPressTimer(msg)}
                                    onTouchEnd={clearLongPressTimer}
                                >
                                    {showHeader ? (
                                        <div className="w-10 h-10 bg-[#4F545C] rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold select-none mt-0.5 shadow-sm">
                                            {msg.user?.name?.substring(0, 1) || 'F'}
                                        </div>
                                    ) : (
                                        <div className="w-10 flex-shrink-0 flex justify-center text-[10px] text-[#8E9297] opacity-0 group-hover:opacity-100 mt-1.5 transition-opacity">
                                            {formatTime(msg.createdAt).split(' ')[0]}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        {msg.repliedTo && (
                                            <div className="flex items-center gap-1.5 mb-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                                                <div className="w-8 h-px bg-[#4F545C] ml-5 rounded-bl-lg border-l border-b" />
                                                <span className="text-[12px] text-[#B9BBBE] font-medium truncate max-w-[200px]">
                                                    {msg.repliedTo.user?.name}: {msg.repliedTo.message || 'File'}
                                                </span>
                                            </div>
                                        )}
                                        {showHeader && (
                                            <div className="flex items-baseline gap-2 mb-0.5">
                                                <span className="text-[15px] font-bold text-white hover:underline cursor-pointer">
                                                    {msg.isAI ? 'Village AI assistant' : (msg.user?.name || 'Farmer')}
                                                </span>
                                                <span className="text-[11px] text-[#8E9297]">
                                                    {new Date(msg.createdAt).toLocaleDateString() === new Date().toLocaleDateString() ? `Today at ${formatTime(msg.createdAt)}` : new Date(msg.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`text-[15px] leading-snug text-[#DCDDDE] break-words whitespace-pre-wrap ${!showHeader ? 'pl-0' : ''}`}>
                                            {msg.message}
                                        </div>

                                        {msg.fileUrl && (
                                            <div className="mt-2 rounded-xl overflow-hidden max-w-[300px] border border-white/5 shadow-md">
                                                {msg.fileType === 'image' ? (
                                                    <img src={msg.fileUrl} alt="Attachment" className="w-full object-cover" />
                                                ) : msg.fileType === 'video' ? (
                                                    <video src={msg.fileUrl} controls className="w-full" />
                                                ) : (
                                                    <a href={msg.fileUrl} target="_blank" className="flex items-center gap-2 p-3 bg-[#2F3136] text-white">
                                                        <IoDocument size={24} />
                                                        <span className="truncate">Download File</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {msg.audioUrl && (
                                            <div className="mt-2 flex items-center gap-3 bg-[#5865F2]/10 p-3 rounded-[24px] border border-[#5865F2]/20 max-w-xs group/audio">
                                                <button className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform">
                                                    <IoPlay size={20} />
                                                </button>
                                                <div className="flex-1 flex gap-1 items-center">
                                                    {[...Array(15)].map((_, i) => (
                                                        <div key={i} className="w-1 h-3 bg-[#5865F2]/40 rounded-full" />
                                                    ))}
                                                </div>
                                                <span className="text-[11px] font-bold text-[#5865F2]">0:01</span>
                                            </div>
                                        )}

                                        {msg.reactions?.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {Object.entries(
                                                    msg.reactions.reduce((acc, r) => {
                                                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                                        return acc;
                                                    }, {})
                                                ).map(([emoji, count]) => (
                                                    <button
                                                        key={emoji}
                                                        title={msg.reactions.filter(r => r.emoji === emoji).map(r => r.user?.name).join(', ')}
                                                        className="flex items-center gap-1.5 px-2 py-0.5 bg-[#5865F2]/10 border border-[#5865F2]/20 hover:border-[#5865F2]/50 rounded-lg text-sm transition-all active:scale-95 group/react relative"
                                                    >
                                                        <span>{emoji}</span>
                                                        <span className="text-[12px] font-bold text-[#5865F2]">{count}</span>

                                                        {/* Tooltip for desktop hover */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover/react:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                                            {msg.reactions.filter(r => r.emoji === emoji).map(r => r.user?.name).join(', ')}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar / Recording Tray */}
            <div className="px-2 md:px-4 py-2 bg-[#36393F] relative border-t border-[#2F3136]">
                {isRecording ? (
                    <div className="absolute inset-x-0 bottom-0 bg-[#36393F] px-2 md:px-4 pb-2 pt-12 z-30 animate-menu-pop">
                        <div className="absolute top-3 left-0 right-0 text-center">
                            <span className="text-[#B9BBBE] text-[12px] font-medium uppercase tracking-wider">Release to Send</span>
                        </div>
                        <div className="bg-gradient-to-r from-[#5865F2] to-[#4752C4] rounded-[24px] md:rounded-[32px] p-0.5 md:p-1 flex items-center gap-1 md:gap-3">
                            <button
                                onClick={() => { stopRecording(); audioChunksRef.current = []; }}
                                className="p-2 md:p-3 text-white/60 hover:text-white transition-colors flex-shrink-0"
                            >
                                <IoTrash size={24} />
                            </button>

                            <div className="flex-1 flex items-center gap-2 md:gap-3 px-1">
                                <div className="flex items-center gap-1 text-white font-bold text-xs md:text-sm min-w-[45px]">
                                    <div className="w-1.5 h-1.5 bg-[#ED4245] rounded-full animate-recording-pulse" />
                                    <span>{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center gap-0.5 md:gap-1 overflow-hidden">
                                    {[...Array(10)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1 h-3 bg-white/40 rounded-full waveform-dot ${i > 6 ? 'hidden sm:block' : ''}`}
                                            style={{ animationDelay: `${i * 0.1}s` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={stopRecording}
                                className="p-2 md:p-3 bg-white text-[#5865F2] rounded-full shadow-lg flex-shrink-0"
                            >
                                <IoSend size={24} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={sendMessage} className="flex items-center gap-2 max-w-full overflow-hidden">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                            accept="image/*,video/*"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 text-[#B9BBBE] hover:text-white bg-[#4F545C]/30 hover:bg-[#4F545C] rounded-full flex-shrink-0 transition-colors"
                        >
                            <IoAdd size={20} />
                        </button>

                        <div className="flex-1 flex flex-col bg-[#40444B] rounded-[24px] overflow-hidden group min-w-0">
                            {replyingTo && (
                                <div className="px-3 py-1 bg-white/5 flex items-center justify-between border-b border-white/5">
                                    <span className="text-[10px] text-[#B9BBBE] truncate uppercase font-bold tracking-tight">Replying to <b>{replyingTo.user?.name}</b></span>
                                    <button onClick={() => setReplyingTo(null)} className="text-[#B9BBBE] hover:text-white p-1">
                                        <IoClose size={12} />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center px-3 py-1.5 relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={`Message #${activeChannel.name}`}
                                    className="flex-1 bg-transparent border-none outline-none text-[#DCDDDE] text-[15px] placeholder:text-[#72767D] min-w-0 py-1"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-1 text-[#B9BBBE] hover:text-white flex-shrink-0"
                                >
                                    <IoHappyOutline size={22} />
                                </button>
                            </div>
                            {showEmojiPicker && (
                                <div className="p-2 grid grid-cols-8 gap-1 bg-[#2F3136]/50 border-t border-white/5 max-h-[150px] overflow-y-auto">
                                    {['😀', '😂', '😍', '👍', '🔥', '👏', '🙏', '❤️', '✅', '❌', '👀', '🤔', '😎', '😆', '🌈', '🎉'].map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => { setNewMessage(prev => prev + emoji); setShowEmojiPicker(false); }}
                                            className="text-xl p-1 hover:bg-white/10 rounded transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex-shrink-0 flex items-center">
                            {!newMessage.trim() ? (
                                <button
                                    type="button"
                                    onClick={toggleRecording}
                                    className="p-2 text-[#B9BBBE] hover:text-white transition-all transform hover:scale-110 active:scale-90"
                                >
                                    <IoMic size={24} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="p-2 text-[#00D09C] hover:text-white transition-all transform scale-110 active:scale-95 animate-menu-pop"
                                >
                                    <IoSend size={24} />
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>

            {/* Context Menu Overlay */}
            {longPressedMessage && (
                <MessageContextMenu
                    message={longPressedMessage}
                    onClose={() => setLongPressedMessage(null)}
                    onDelete={deleteMessage}
                    onReply={(msg) => setReplyingTo(msg)}
                    onReact={(msgId, emoji, action, reaction) => {
                        setMessages(prev => prev.map(m => {
                            if (m.id !== msgId) return m;
                            const reactions = m.reactions || [];
                            if (action === 'removed') {
                                return { ...m, reactions: reactions.filter(r => !(r.userId === user.id && r.emoji === emoji)) };
                            } else {
                                if (reactions.find(r => r.userId === user.id && r.emoji === emoji)) return m;
                                return { ...m, reactions: [...reactions, { ...reaction, userId: user.id }] };
                            }
                        }));
                    }}
                />
            )}
        </div>
    );
}
// Add this icon if missing in imports
import { IoClose, IoPlay, IoDocument } from 'react-icons/io5';
