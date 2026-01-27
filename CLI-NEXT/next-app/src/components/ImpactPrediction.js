'use client';

import { NavArrowUp, NavArrowDown, InfoCircle, AlertTriangle, Sparks } from 'iconoir-react';

/**
 * Impact Prediction Component
 * Visualizes projected yield and quality changes based on AI advice
 */
export default function ImpactPrediction({ prediction, loading }) {
    if (loading) {
        return (
            <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
                <div className="h-12 bg-white/10 rounded-2xl" />
            </div>
        );
    }

    if (!prediction) return null;

    const isPositive = prediction.yieldChange && prediction.yieldChange.includes('+');

    return (
        <div className="bg-[#111111]/60 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 relative overflow-hidden group">
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 -mr-16 -mt-16 transition-colors ${isPositive ? 'bg-[#00D09C]' : 'bg-[#FF6B35]'
                }`} />

            <div className="flex items-center gap-2 mb-4">
                <InfoCircle className="text-[#00D09C]" width={16} height={16} />
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Yield Impact Prediction</span>
            </div>

            <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                    <div className={`text-4xl font-black mb-1 flex items-center gap-2 ${isPositive ? 'text-[#00D09C]' : 'text-white'
                        }`}>
                        {prediction.yieldChange || '0%'}
                        {isPositive ? <NavArrowUp width={28} height={28} /> : <NavArrowDown width={28} height={28} />}
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Projected Yield Change</p>
                </div>

                <div className="text-right">
                    <p className="text-sm font-black text-white mb-1">{prediction.qualityImprovement || 'Standard Quality'}</p>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Quality Outlook</p>
                </div>
            </div>

            {/* Risk Warning */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-[#FFC857]" width={14} height={14} />
                    <span className="text-[10px] font-black text-[#FFC857] uppercase tracking-widest">Risk Analysis</span>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                    If advice ignored: <span className="text-white font-bold">{prediction.riskIfIgnored}</span> risk of yield decline.
                </p>
            </div>
        </div>
    );
}
