'use client';

import { useState } from 'react';
import { Bell, Clock, NavArrowRight, InfoCircle, ShoppingBag, CheckCircle, Leaf } from 'iconoir-react';

/**
 * Expert Zone Recommendations
 * Displays detailed, actionable agronomy advice with AI explainability
 */
export default function ZoneRecommendations({ advice, loading, onApplyAction }) {
    const [expandedRec, setExpandedRec] = useState(null);
    const [showLogic, setShowLogic] = useState(false);

    if (loading || !advice) {
        return (
            <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-8 bg-white/10 rounded-xl w-48 animate-pulse" />
                    <div className="h-8 bg-white/5 rounded-xl w-24 animate-pulse" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-[2rem] space-y-3">
                            <div className="h-2 bg-white/20 rounded w-1/4 animate-pulse" />
                            <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                            <div className="flex gap-2">
                                <div className="h-6 bg-white/5 rounded-lg w-16 animate-pulse" />
                                <div className="h-6 bg-white/5 rounded-lg w-20 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-auto pt-6 text-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] animate-pulse">
                        Synchronising Neural Path...
                    </p>
                </div>
            </div>
        );
    }

    const recs = advice.actionableInsights || [];

    return (
        <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 md:p-8 flex flex-col h-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <div className="p-2 bg-[#00D09C]/10 rounded-xl">
                            <Bell className="text-[#00D09C]" width={20} height={20} />
                        </div>
                        Expert Recommendations
                    </h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">
                        Precision Action Plan
                    </p>
                </div>

                {/* Explainability Toggle */}
                <button
                    onClick={() => setShowLogic(!showLogic)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider ${showLogic ? 'bg-[#00D09C] text-[#0D0D0D] border-[#00D09C]' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                        }`}
                >
                    <InfoCircle width={14} height={14} />
                    {showLogic ? 'Hide Logic' : 'Why This Advice?'}
                </button>
            </div>

            {/* AI Explainability Section */}
            {showLogic && advice.decisionLogic && (
                <div className="mb-6 p-5 bg-[#00D09C]/5 border border-[#00D09C]/10 rounded-3xl animate-in slide-in-from-top-4 duration-500">
                    <div className="text-[10px] font-black text-[#00D09C] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#00D09C] rounded-full" />
                        Decision Logic
                    </div>
                    <ul className="space-y-2">
                        {advice.decisionLogic.map((logic, i) => (
                            <li key={i} className="text-xs text-white/60 flex gap-3 leading-relaxed">
                                <span className="text-[#00D09C] font-bold">0{i + 1}.</span>
                                {logic}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommendations List */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {recs.map((rec, index) => (
                    <div
                        key={index}
                        className={`bg-white/5 border border-white/5 rounded-[2rem] p-5 transition-all group overflow-hidden relative ${expandedRec === index ? 'ring-1 ring-[#00D09C]/40 bg-white/[0.08]' : 'hover:bg-white/[0.07]'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpandedRec(expandedRec === index ? null : index)}>
                            <div className="flex-1">
                                <span className="text-[8px] font-black text-[#00D09C] uppercase tracking-widest mb-1 block">
                                    {rec.impactType || 'General Health'}
                                </span>
                                <h4 className="text-sm font-black text-white leading-tight mb-2 group-hover:text-[#00D09C] transition-colors">
                                    {rec.action}
                                </h4>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">
                                        <Clock width={12} height={12} />
                                        {rec.time}
                                    </div>
                                    <div className="text-[10px] font-bold text-[#00D09C] bg-[#00D09C]/10 px-2 py-1 rounded-lg">
                                        {rec.expectedBenefit} Impact
                                    </div>
                                </div>
                            </div>
                            <NavArrowRight
                                className={`text-white/20 transition-transform duration-300 ${expandedRec === index ? 'rotate-90 text-[#00D09C]' : ''}`}
                                width={20} height={20}
                            />
                        </div>

                        {expandedRec === index && (
                            <div className="mt-5 pt-5 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl">
                                        <p className="text-[10px] font-black text-white/20 uppercase mb-1">Concentration / Dose</p>
                                        <p className="text-sm font-bold text-white">{rec.dose}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl">
                                        <p className="text-[10px] font-black text-white/20 uppercase mb-1">Timing Window</p>
                                        <p className="text-sm font-bold text-white">{rec.time}</p>
                                    </div>
                                </div>

                                {rec.technicalMedicine && (
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-[#00D09C] uppercase mb-2 tracking-widest">Recommended AI Product</p>
                                        <p className="text-sm font-black text-white">{rec.technicalMedicine}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-[#00D09C] uppercase mb-2">Advantages</p>
                                        {rec.pros?.map((p, i) => (
                                            <p key={i} className="text-[10px] text-white/60 flex items-start gap-2">• {p}</p>
                                        ))}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-[#FF6B35] uppercase mb-2">Risks / Cons</p>
                                        {rec.cons?.map((c, i) => (
                                            <p key={i} className="text-[10px] text-white/60 flex items-start gap-2">• {c}</p>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-[#00D09C]/5 border border-[#00D09C]/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-[#00D09C] uppercase mb-1">Expert Reasoning</p>
                                    <p className="text-xs text-white/70 leading-relaxed font-medium">{rec.reason}</p>
                                </div>
                                <button
                                    onClick={() => onApplyAction(rec)}
                                    className="w-full py-4 bg-[#00D09C] text-[#0D0D0D] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#00D09C]/20"
                                >
                                    Mark Action as Applied
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Buying Guidance Section */}
            {advice.buyingGuidance && (
                <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag className="text-white/30" width={16} height={16} />
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Verified Buying Guidance</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { type: 'Best Value', data: advice.buyingGuidance.bestValue, color: '#00D09C' },
                            { type: 'Premium', data: advice.buyingGuidance.premiumOption, color: '#4D9FFF' },
                            { type: 'Budget', data: advice.buyingGuidance.budgetOption, color: '#FFC857' }
                        ].map((opt, i) => (
                            <a
                                key={i}
                                href={opt.data.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: opt.color }}>{opt.type}</span>
                                    <span className="text-[10px] font-black text-white/80">{opt.data.price}</span>
                                </div>
                                <p className="text-xs font-bold text-white truncate mb-1">{opt.data.name}</p>
                                <p className="text-[8px] text-white/40 leading-tight italic">{opt.data.why}</p>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
