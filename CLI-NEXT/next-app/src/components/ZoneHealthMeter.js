'use client';

import { NavArrowUp, NavArrowDown } from 'iconoir-react';


/**
 * Zone Health Meter Component
 * Visual gauge showing 0-100 health score with breakdown
 * Responsive: Large card on desktop, compact on mobile
 */

export default function ZoneHealthMeter({ zoneHealth, loading, zoneName, cropType }) {
    if (loading) {
        return (
            <div className="bg-[#111111]/40 border border-white/5 rounded-[2.5rem] p-8 animate-pulse space-y-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded-full w-24" />
                        <div className="h-10 bg-white/10 rounded-xl w-32" />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-white/10" />
                </div>
                <div className="h-20 bg-white/5 rounded-2xl" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-3 bg-white/5 rounded-full" />)}
                </div>
            </div>
        );
    }

    if (!zoneHealth) return null;

    const { overallScore, healthLevel, breakdown, confidence, technicalExplanation, impactFactors = [] } = zoneHealth;
    const scoreVal = Number(overallScore) || 0;

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            {/* COMPACT SCIENTIFIC HEADER */}
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00D09C] shadow-[0_0_10px_#00D09C]" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] truncate">Biometric Core</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-3 truncate">
                        {cropType} <span className="text-[#00D09C]">Health</span>
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">{overallScore}</span>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest text-center whitespace-nowrap"
                                style={{ backgroundColor: `${healthLevel.color}20`, color: healthLevel.color }}>
                                {healthLevel.level}
                            </span>
                            <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.2em] whitespace-nowrap">Verified Index</span>
                        </div>
                    </div>
                </div>

                {/* Lab-Grade Circular Gauge */}
                <div className="relative w-24 h-24 flex-shrink-0 group">
                    <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-[#00D09C]/5 transition-colors" />
                    <svg className="w-full h-full transform -rotate-90 relative z-10">
                        <circle cx="50%" cy="50%" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="none" />
                        <circle
                            cx="50%" cy="50%" r="40"
                            stroke={healthLevel.color}
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={(2 * Math.PI * 40) - (scoreVal / 100) * (2 * Math.PI * 40)}
                            className="transition-all duration-1000 ease-out shadow-lg"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl drop-shadow-lg z-10">
                        {healthLevel.icon}
                    </div>
                </div>
            </div>

            {/* DIAGNOSTIC SUMMARY (CLEANER) */}
            {technicalExplanation && (
                <div className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#00D09C]/30" />
                    <p className="text-xs leading-relaxed text-white/70 font-bold">
                        <span className="text-white font-black uppercase tracking-widest mr-3 text-[9px] opacity-40">AI Analysis</span>
                        {technicalExplanation}
                    </p>
                </div>
            )}

            {/* BIOMETRIC ATTRIBUTES */}
            <div className="space-y-5">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.25em]">Live Biometrics</span>
                    <span className="text-[9px] font-black text-[#00D09C] uppercase tracking-[0.2em]">Active Sensors</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {impactFactors.map((f, i) => (
                        <div key={i} className="space-y-1.5 group/biometric">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest group-hover/biometric:text-white transition-colors truncate max-w-[120px]">{f.label}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[9px] font-black" style={{ color: f.color }}>
                                        {f.impact > 0 ? '+' : ''}{f.impact}
                                    </span>
                                </div>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 origin-left"
                                    style={{ width: `${f.value}%`, backgroundColor: f.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FIDELITY INDICATOR */}
            <div className="pt-2 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D09C]/40" />
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Fidelity</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00D09C]/60 transition-all duration-1000" style={{ width: `${confidence?.score || 85}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-white/60 tracking-wider font-mono">{confidence?.score || 85}%</span>
                </div>
            </div>
        </div>
    );
}
