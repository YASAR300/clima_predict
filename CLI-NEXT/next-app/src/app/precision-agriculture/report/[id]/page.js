'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useActiveLocation } from '@/hooks/useActiveLocation';
import Link from 'next/link';
import { NavArrowLeft, SpockHand, Leaf, StatsUpSquare, Droplet, Camera, Calendar, ReportColumns } from 'iconoir-react';
import ZoneHealthMeter from '@/components/ZoneHealthMeter';
import ImpactPrediction from '@/components/ImpactPrediction';
import ZoneRecommendations from '@/components/ZoneRecommendations';
import AgronomyCalendar from '@/components/AgronomyCalendar';

export default function ZoneReportPage({ params }) {
    const { id } = use(params);
    const { activeLocation } = useActiveLocation();
    const [cropData, setCropData] = useState(null);
    const [zoneHealth, setZoneHealth] = useState(null);
    const [expertAdvice, setExpertAdvice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch crop details
                const cropRes = await fetch('/api/crops');
                const cropJson = await cropRes.json();
                const selectedCrop = cropJson.data.find(c => c.id === id);
                setCropData(selectedCrop);

                if (selectedCrop) {
                    const currentDaysAfterSowing = selectedCrop.sowingDate
                        ? Math.floor((new Date() - new Date(selectedCrop.sowingDate)) / (1000 * 60 * 60 * 24))
                        : null;

                    // Fetch health
                    const healthRes = await fetch(`/api/precision-ag/zone-health`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            zoneId: id,
                            lat: activeLocation?.lat || 28.6139,
                            lon: activeLocation?.lon || 77.2090,
                            cropType: selectedCrop.type,
                            daysAfterSowing: currentDaysAfterSowing,
                            sensorData: { soilMoisture: 65, temperature: 28 }
                        })
                    });
                    const healthJson = await healthRes.json();
                    setZoneHealth(healthJson.data);

                    // Fetch advice
                    const adviceRes = await fetch(`/api/precision-ag/expert-advice`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            cropId: id,
                            cropType: selectedCrop.type,
                            growthStage: currentDaysAfterSowing < 30 ? 'Seedling' : currentDaysAfterSowing < 60 ? 'Vegetative' : 'Reproductive',
                            location: activeLocation,
                            soilData: { n: 120, p: 60, k: 45, ph: 6.5 }
                        })
                    });
                    const adviceJson = await adviceRes.json();
                    setExpertAdvice(adviceJson.data);
                }
            } catch (error) {
                console.error('Failed to fetch report data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, activeLocation]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center p-24">
                <div className="w-16 h-16 border-4 border-[#00D09C]/20 border-t-[#00D09C] rounded-full animate-spin mb-6" />
                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Generating Intelligence Brief...</p>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0D0D0D] text-white pb-24 md:pb-12">
                {/* Header Section */}
                <div className="sticky top-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-3xl border-b border-white/5 py-6 px-4 md:px-12 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link href="/precision-agriculture" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                            <NavArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1 px-2.5 bg-[#00D09C]/10 rounded-lg text-[#00D09C] text-[9px] font-black uppercase tracking-widest border border-[#00D09C]/20">
                                    Official Report
                                </div>
                                <span className="text-white/20 font-black text-[10px] uppercase tracking-widest">ID: {id?.slice(-8)}</span>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight leading-none uppercase">
                                {cropData?.type} <span className="text-[#00D09C]">Full Analysis</span>
                            </h1>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Location</p>
                            <p className="text-sm font-black text-white">{activeLocation?.name || 'Ahmedabad, IN'}</p>
                        </div>
                        <div className="p-2 bg-[#00D09C]/10 rounded-xl">
                            <Leaf className="text-[#00D09C]" width={28} height={28} />
                        </div>
                    </div>
                </div>

                <div className="max-w-screen-xl mx-auto px-4 md:px-12 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                        {/* LEFT: Core Biometrics */}
                        <div className="lg:col-span-4 space-y-12">
                            <div className="bg-[#111111] border border-white/5 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-[#00D09C]/5 rounded-full blur-[100px] pointer-events-none" />
                                <ZoneHealthMeter
                                    zoneHealth={zoneHealth}
                                    loading={false}
                                    cropType={cropData?.type}
                                />
                            </div>

                            <div className="bg-[#111111] border border-white/5 rounded-[3rem] p-1 shadow-2xl">
                                <ImpactPrediction prediction={expertAdvice?.impactPrediction} loading={false} />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <DetailStat label="Moisture" value={`${zoneHealth?.breakdown?.soilMoisture?.value || '--'}%`} icon={<Droplet />} color="#4D9FFF" />
                                <DetailStat label="Crop Vigor" value={zoneHealth?.breakdown?.cropVigor?.score || '--'} icon={<StatsUpSquare />} color="#FFC857" />
                            </div>
                        </div>

                        {/* RIGHT: Strategies & Actions */}
                        <div className="lg:col-span-8 space-y-12">
                            {/* Detailed Action Plan */}
                            <div className="bg-[#111111] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                                <ZoneRecommendations
                                    advice={expertAdvice}
                                    loading={false}
                                    onApplyAction={(action) => console.log('Action recorded:', action)}
                                />
                            </div>

                            {/* Agronomy Schedule */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="bg-[#111111] border border-white/5 rounded-[3rem] p-1 overflow-hidden h-full">
                                    <AgronomyCalendar schedule={expertAdvice?.cropCalendar} loading={false} />
                                </div>
                                <div className="bg-[#111111] border border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center gap-6 group hover:border-[#9D4EDD]/30 transition-all border-dashed">
                                    <div className="w-20 h-20 bg-[#9D4EDD]/10 rounded-full flex items-center justify-center">
                                        <Camera className="text-[#9D4EDD]" width={36} height={36} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white/80 uppercase tracking-tight mb-2">Thermal Analysis</h4>
                                        <p className="text-sm font-bold text-white/30 leading-relaxed px-6">
                                            High-fidelity thermal imaging and disease detection reports are generated after AI ensemble scans.
                                        </p>
                                    </div>
                                    <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-white/10 transition-all">
                                        Upload Thermal Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Utility */}
                <div className="max-w-screen-xl mx-auto px-4 md:px-12 mt-12 flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-12 gap-8 opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50">Agricultural Intelligence Protocol v4.0</p>
                    <div className="flex items-center gap-12">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#00D09C]">Synced</span>
                            <span className="text-[10px] font-black uppercase text-white">Neural Registry</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#4D9FFF]">Verified</span>
                            <span className="text-[10px] font-black uppercase text-white">Spatial Data</span>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function DetailStat({ label, value, icon, color }) {
    return (
        <div className="bg-[#111111] border border-white/5 rounded-[2rem] p-8 flex flex-col items-center text-center gap-4 group hover:border-white/10 transition-all">
            <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform" style={{ color }}>
                {icon}
            </div>
            <div>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">{label}</p>
                <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
            </div>
        </div>
    );
}
