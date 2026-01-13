'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IoArrowBack, IoMail, IoKey, IoWarning, IoCheckmarkCircle } from 'react-icons/io5';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to send reset link');

            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col justify-center px-6 py-12">
            <div className="w-full max-w-md mx-auto space-y-8">
                <header className="text-center">
                    <div className="inline-flex p-4 bg-white/5 rounded-[2rem] border border-white/5 mb-6">
                        <IoKey size={40} className="text-[#FFC857]" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Access Recovery</h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mt-2">Initialize credential reset protocol</p>
                </header>

                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                    {!message ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-2xl p-4 flex items-center gap-3 text-[#FF6B35]">
                                    <IoWarning size={20} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Registered Email</label>
                                <div className="relative">
                                    <IoMail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold text-white outline-none focus:bg-white/10 transition-all uppercase placeholder:text-white/10"
                                        placeholder="name@nexus.io"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#FFC857] to-[#FF6B35] rounded-2xl py-5 text-[#0D0D0D] font-black tracking-[0.2em] text-xs hover:opacity-90 shadow-2xl active:scale-95 transition-all uppercase mt-4"
                            >
                                {loading ? 'Transmitting…' : 'Transmit Recovery Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 py-4">
                            <div className="inline-flex p-4 bg-[#00D09C]/10 rounded-2xl border border-[#00D09C]/20">
                                <IoCheckmarkCircle size={32} className="text-[#00D09C]" />
                            </div>
                            <p className="text-xs font-bold text-white/60 uppercase tracking-widest leading-relaxed">
                                {message}
                            </p>
                            <Link href="/auth/login" className="block w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-white font-black tracking-widest text-[10px] uppercase hover:bg-white/10 transition-all">
                                Return to Login
                            </Link>
                        </div>
                    )}
                </div>

                <footer className="text-center">
                    <Link href="/auth/login" className="inline-flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors">
                        <IoArrowBack size={14} /> Back to Entry
                    </Link>
                </footer>
            </div>
        </div>
    );
}
