'use client';

import { NavArrowUp, NavArrowDown } from 'iconoir-react';


/**
 * Zone Health Meter Component
 * Visual gauge showing 0-100 health score with breakdown
 * Responsive: Large card on desktop, compact on mobile
 */

export default function ZoneHealthMeter({ zoneHealth, loading, zoneName }) {
    if (loading) {
        return (
            <div className="bg-[#111111]/60 border border-white/5 rounded-[2.5rem] p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded-xl w-1/2 mb-4" />
                <div className="h-24 bg-white/5 rounded-2xl mb-4" />
                <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-white/5 rounded-lg" />)}
                </div>
            </div>
        );
    }

    if (!zoneHealth) return null;

    const { overallScore, healthLevel, trend, breakdown, confidence } = zoneHealth;
    const scoreVal = Number(overallScore) || 0;
    const circumference = 2 * Math.PI * 45; // reduced radius
    const strokeDashoffset = circumference - (overallScore / 100) * circumference;

    return (
        <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.2em]">{zoneName} Health</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-3xl font-black text-white">{overallScore}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest"
                            style={{ backgroundColor: `${healthLevel.color}20`, color: healthLevel.color }}>
                            {healthLevel.level}
                        </span>
                    </div>
                </div>

                {/* Compact Circular Gauge */}
                <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r="22" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                        <circle
                            cx="50%" cy="50%" r="22"
                            stroke={healthLevel.color}
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 22}
                            strokeDashoffset={(2 * Math.PI * 22) - (scoreVal / 100) * (2 * Math.PI * 22)}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[15px]">
                        {healthLevel.icon}
                    </div>
                </div>
            </div>

            {/* Health Factors - Compact Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
                <HealthFactorSmall label="Crop Vigor" score={breakdown.cropVigor?.score} color="#00D09C" />
                <HealthFactorSmall label="Weather Stress" score={breakdown.weatherStress?.score} color="#4D9FFF" />
                <HealthFactorSmall label="Soil Moisture" score={breakdown.soilMoisture?.score} color="#9D4EDD" />
                <HealthFactorSmall label="Disease Risk" score={breakdown.diseaseRisk?.score} color={breakdown.diseaseRisk?.score > 70 ? '#00D09C' : '#FF6B35'} />
            </div>

            {/* Compact Confidence */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Spectral Confidence</span>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: confidence.score > 50 ? '#00D09C' : '#FFC857' }} />
                    <span className="text-[10px] font-black text-white/60">{confidence.score}%</span>
                </div>
            </div>
        </div>
    );
}

function HealthFactorSmall({ label, score, color }) {
    if (score === undefined) return null;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-white/30">{label.split(' ')[0]}</span>
                <span className="text-white">{score}</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}
