'use client';

import { useState, useEffect, useRef } from 'react';
import { IoSend, IoMic, IoPerson, IoRocket, IoHappyOutline, IoAdd, IoAttach, IoStop, IoMicCircle } from 'react-icons/io5';
import { getPusherClient } from '@/utils/pusher';

export default function ChatWindow({ activeChannel, user }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

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
        setMessages([]); // Clear messages when switching channels
        fetchMessages();

        // Subscribe to Pusher channel
        const pusher = getPusherClient();
        if (pusher) {
            const channel = pusher.subscribe(`channel-${activeChannel.id}`);
            channel.bind('new-message', (data) => {
                setMessages((prev) => {
                    // Check if this message is already in the list
                    if (prev.find(m => m.id === data.id)) return prev;

                    // Check if it's a server version of an optimistic message
                    // (Same user, same content/audio, and we have a 'temp-' message)
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
        }

        return () => {
            const pusher = getPusherClient();
            if (pusher) {
                pusher.unsubscribe(`channel-${activeChannel.id}`);
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

            // Find supported mime type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
                await sendAudio(audioBlob);
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(1000); // Collect data every second
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
            // 1. Upload audio
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

            // 2. Create message with audioUrl
            const optimisticMessage = {
                id: 'temp-' + Date.now(),
                userId: user?.id,
                message: 'Voice Note',
                audioUrl: url,
                createdAt: new Date().toISOString(),
                user: {
                    id: user?.id,
                    name: user?.name || 'Farmer'
                }
            };
            setMessages((prev) => [...prev, optimisticMessage]);

            const res = await fetch('/api/community/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelId: activeChannel.id,
                    message: 'Voice Note',
                    audioUrl: url
                }),
            });

            if (!res.ok) throw new Error('Failed to send message');
        } catch (error) {
            console.error('Voice note failed:', error);
            alert('Failed to send voice note');
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/community/messages?channelId=${activeChannel.id}`);
            const data = await response.json();
            if (data.messages) {
                setMessages(data.messages);
            }
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

        // Optimistic UI Update
        const optimisticMessage = {
            id: 'temp-' + Date.now(),
            userId: user?.id,
            message: text,
            createdAt: new Date().toISOString(),
            user: {
                id: user?.id,
                name: user?.name || 'Farmer'
            }
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const res = await fetch('/api/community/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelId: activeChannel.id,
                    message: text
                }),
            });

            if (!res.ok) throw new Error('Failed to send');

            // Check for @AI trigger
            if (text.includes('@AI')) {
                handleAICall(text);
            }
        } catch (error) {
            console.error('Send message failed:', error);
            // Remove the optimistic message if it failed
            setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
            setNewMessage(text);
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
            <div className="flex-1 bg-[#0D0D0D] flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-[#00D09C]/20 mb-8 animate-bounce">
                    <IoRocket size={48} className="text-white" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Welcome to Digital Village</h2>
                <p className="text-white/30 font-medium max-w-md leading-relaxed uppercase tracking-widest text-xs">
                    Select a group from the left and a channel to start interacting with your farming community.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0D0D0D] h-full overflow-hidden relative">
            {/* Channel Header */}
            <header className="h-14 md:h-16 border-b border-white/5 px-4 md:px-6 flex items-center justify-between bg-[#0D0D0D]/50 backdrop-blur-xl z-20 pl-16 md:pl-6">
                <div className="flex items-center gap-3">
                    <span className="text-[#00D09C] text-xl font-bold">#</span>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">{activeChannel.name}</h2>
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest hidden md:block">
                        Knowledge sharing & community support
                    </p>
                </div>
            </header>

            {/* Messages Feed */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-[#00D09C] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.userId === user?.id;
                        return (
                            <div key={msg.id || idx} className={`flex gap-4 group ${msg.isAI ? 'bg-[#00D09C]/5 -mx-6 px-6 py-4 border-y border-[#00D09C]/10' : ''}`}>
                                <div className="flex-shrink-0 mt-1">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${msg.isAI
                                        ? 'bg-gradient-to-br from-[#9D4EDD] to-[#4D9FFF]'
                                        : 'bg-white/10 text-white/40'
                                        }`}>
                                        {msg.isAI ? <IoRocket size={20} className="text-white" /> : <IoPerson size={20} />}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-3 mb-1">
                                        <span className={`text-[11px] font-black uppercase tracking-wider ${msg.isAI ? 'text-[#00D09C]' : 'text-white'}`}>
                                            {msg.isAI ? 'Village AI' : (msg.user?.name || 'Farmer')}
                                        </span>
                                        <span className="text-[8px] text-white/20 font-bold uppercase tracking-[0.2em]">
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-white/70 leading-relaxed break-words whitespace-pre-wrap">
                                        {msg.message}
                                    </div>
                                    {msg.audioUrl && (
                                        <div className="mt-3 bg-white/5 p-1 rounded-full border border-white/5 max-w-xs overflow-hidden shadow-inner">
                                            <audio controls src={msg.audioUrl} className="w-full h-10 scale-90" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Dashboard */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D] to-transparent z-30">
                <form
                    onSubmit={sendMessage}
                    className="bg-white/5 border border-white/10 rounded-[2rem] p-2 flex items-center gap-2 backdrop-blur-3xl shadow-2xl relative"
                >
                    <button type="button" className="p-3 text-white/20 hover:text-white/60 transition-all rounded-full hover:bg-white/5">
                        <IoAdd size={24} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message #${activeChannel.name}`}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-white/10 px-2 py-3"
                    />

                    <div className="flex items-center gap-1">
                        <button type="button" className="hidden md:flex p-3 text-white/20 hover:text-[#FFC857] transition-all rounded-full hover:bg-white/5">
                            <IoHappyOutline size={24} />
                        </button>
                        <button
                            type="button"
                            onClick={toggleRecording}
                            className={`p-3 transition-all rounded-full hover:bg-white/5 ${isRecording ? 'text-[#FF4D4D] animate-pulse bg-red-500/10' : 'text-white/20 hover:text-[#00D09C]'}`}
                        >
                            <IoMic size={24} />
                        </button>
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className={`p-3 rounded-2xl transition-all shadow-xl ${newMessage.trim()
                                ? 'bg-[#00D09C] text-[#0D0D0D] shadow-[#00D09C]/20 scale-100'
                                : 'bg-white/5 text-white/20 scale-95 opacity-50'
                                }`}
                        >
                            <IoSend size={20} />
                        </button>
                    </div>

                    {isRecording && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#FF4D4D] px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl animate-bounce flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                            Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
