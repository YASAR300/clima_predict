'use client';

import { StatsUpSquare, StatsDownSquare, InfoCircle, WarningCircle, Sparks } from 'iconoir-react';

/**
 * Impact Prediction Component
 * Visualizes projected yield and quality changes based on AI advice
 */
export default function ImpactPrediction({ prediction, loading }) {
    if (loading || !prediction) {
        return (
            <div className="bg-[#111111]/40 border border-white/5 rounded-3xl p-4 animate-pulse">
                <div className="h-3 bg-white/10 rounded w-1/2 mb-3" />
                <div className="h-8 bg-white/5 rounded-xl" />
            </div>
        );
    }

    const isPositive = prediction.yieldChange && String(prediction.yieldChange).includes('+');

    return (
        <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#00D09C]/10 rounded-lg">
                        <StatsUpSquare className="text-[#00D09C]" width={14} height={14} />
                    </div>
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Yield Prediction</span>
                </div>
                {isPositive ? (
                    <span className="text-[10px] font-black text-[#00D09C] bg-[#00D09C]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Growth</span>
                ) : (
                    <span className="text-[10px] font-black text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Alert</span>
                )}
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className={`text-3xl font-black ${isPositive ? 'text-[#00D09C]' : 'text-white'}`}>
                        {prediction.yieldChange || '0%'}
                    </span>
                    <div className="h-8 w-px bg-white/5" />
                    <div>
                        <p className="text-[10px] font-black text-white leading-tight">{prediction.qualityImprovement}</p>
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Quality Outlook</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2">
                <WarningCircle className="text-[#FFC857] mt-0.5" width={12} height={12} />
                <p className="text-[9px] text-white/40 leading-relaxed font-bold">
                    RISK REGISTERY: <span className="text-white">{prediction.riskIfIgnored}</span> loss potential if ignored.
                </p>
            </div>
        </div>
    );
}
