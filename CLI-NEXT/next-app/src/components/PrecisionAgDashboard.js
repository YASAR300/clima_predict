'use client';

import { useState, useEffect } from 'react';
import { Leaf, NavArrowUp, Droplet, AlertTriangle, Camera, Map as MapIcon, Refresh, Calendar } from 'iconoir-react';

import ZoneHealthMeter from './ZoneHealthMeter';
import FieldZoneMap from './FieldZoneMap';
import ZoneRecommendations from './ZoneRecommendations';
import PhotoAnalyzer from './PhotoAnalyzer';
import AgronomyCalendar from './AgronomyCalendar';
import ImpactPrediction from './ImpactPrediction';

/**
 * Precision Agriculture Dashboard - Optimized Compact Version
 */

export default function PrecisionAgDashboard({ location }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [zoneHealth, setZoneHealth] = useState(null);
    const [expertAdvice, setExpertAdvice] = useState(null);
    const [latestAnalysis, setLatestAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adviceLoading, setAdviceLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState(null);
    const [zones, setZones] = useState([]);

    // Fetch All User Crops
    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await fetch('/api/crops');
                const result = await response.json();
                if (result.success && result.data.length > 0) {
                    const mappedCrops = result.data.map(c => ({
                        id: c.id,
                        name: c.area || `${c.type} Field`,
                        area: parseFloat(c.area) || 0,
                        crop: c.type,
                        sowingDate: c.sowingDate
                    }));
                    setZones(mappedCrops);
                    setSelectedZone(mappedCrops[0].id);
                }
            } catch (e) { console.error('Failed to fetch crops', e); }
        };
        fetchCrops();
    }, []);

    // Derived values for the selected crop
    const selectedCropData = zones.find(z => z.id === selectedZone);
    const currentCropType = selectedCropData?.crop || 'unknown';
    const currentDaysAfterSowing = selectedCropData?.sowingDate
        ? Math.floor((new Date() - new Date(selectedCropData.sowingDate)) / (1000 * 60 * 60 * 24))
        : 45;

    useEffect(() => {
        if (!selectedZone) return;
        fetchZoneHealth();
        fetchExpertAdvice();
        const interval = setInterval(() => {
            fetchZoneHealthSilent();
            fetchExpertAdviceSilent();
        }, 60000);
        return () => clearInterval(interval);
    }, [selectedZone, location]);

    const fetchZoneHealthSilent = async () => {
        try {
            const response = await fetch(`/api/precision-ag/zone-health`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    zoneId: selectedZone,
                    lat: location?.lat || 28.6139,
                    lon: location?.lon || 77.2090,
                    cropType: currentCropType,
                    daysAfterSowing: currentDaysAfterSowing,
                    sensorData: { soilMoisture: 65, temperature: 28 },
                    imageAnalysis: latestAnalysis
                })
            });
            if (response.ok) {
                const result = await response.json();
                setZoneHealth(result.data);
            }
        } catch (error) { console.error('Silent refresh failed', error); }
    };

    const fetchExpertAdviceSilent = async () => {
        try {
            const response = await fetch(`/api/precision-ag/expert-advice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cropId: selectedZone,
                    cropType: currentCropType,
                    growthStage: currentDaysAfterSowing < 30 ? 'Seedling' : currentDaysAfterSowing < 60 ? 'Vegetative' : 'Reproductive',
                    location,
                    soilData: {
                        n: zoneHealth?.breakdown?.nitrogen?.value || 120,
                        p: zoneHealth?.breakdown?.phosphorus?.value || 60,
                        k: zoneHealth?.breakdown?.potassium?.value || 45,
                        ph: zoneHealth?.breakdown?.ph?.value || 6.5
                    },
                    weather: { temp: 28, humidity: 65, forecast: 'Standard conditions' }
                })
            });
            if (response.ok) {
                const result = await response.json();
                setExpertAdvice(result.data);
            }
        } catch (e) { console.error('Silent advice refresh failed', e); }
    };

    const fetchExpertAdvice = async () => {
        if (!selectedZone) return;
        setAdviceLoading(true);
        setExpertAdvice(null);
        try {
            const response = await fetch(`/api/precision-ag/expert-advice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cropId: selectedZone,
                    cropType: currentCropType,
                    growthStage: currentDaysAfterSowing < 30 ? 'Seedling' : currentDaysAfterSowing < 60 ? 'Vegetative' : 'Reproductive',
                    location,
                    soilData: {
                        n: zoneHealth?.breakdown?.nitrogen?.value || 120,
                        p: zoneHealth?.breakdown?.phosphorus?.value || 60,
                        k: zoneHealth?.breakdown?.potassium?.value || 45,
                        ph: zoneHealth?.breakdown?.ph?.value || 6.5
                    },
                    weather: { temp: 28, humidity: 65, forecast: 'Generating high-accuracy forecast...' }
                })
            });
            if (response.ok) {
                const result = await response.json();
                setExpertAdvice(result.data);
            }
        } catch (e) {
            console.error('Expert advice fetch failed', e);
        } finally {
            setAdviceLoading(false);
        }
    };

    const handleApplyAction = async (action) => {
        try {
            await fetch('/api/precision-ag/records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cropId: selectedZone,
                    action: action.action,
                    inputUsed: action.technicalMedicine || action.action,
                    dosage: action.dose,
                    decisionLogic: expertAdvice?.decisionLogic
                })
            });
            alert(`Action "${action.action}" recorded successfully!`);
        } catch (e) { console.error('Record failed', e); }
    };

    const fetchZoneHealth = async (analysisData = latestAnalysis) => {
        if (!selectedZone) return;
        setLoading(true);
        if (analysisData && analysisData.healthScore) setLatestAnalysis(analysisData);
        try {
            const response = await fetch(`/api/precision-ag/zone-health`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    zoneId: selectedZone,
                    lat: location?.lat || 28.6139,
                    lon: location?.lon || 77.2090,
                    cropType: currentCropType,
                    daysAfterSowing: currentDaysAfterSowing,
                    sensorData: { soilMoisture: 65, temperature: 28 },
                    imageAnalysis: analysisData
                })
            });
            if (response.ok) {
                const result = await response.json();
                setZoneHealth(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch zone health:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Leaf width={24} height={24} className="text-[#00D09C]" />
                        Precision Ag
                    </h1>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-0.5">
                        {currentCropType} • Day {currentDaysAfterSowing} • {selectedCropData?.name}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchExpertAdvice}
                        disabled={adviceLoading}
                        className="p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-[#00D09C]/10 text-white/40 hover:text-[#00D09C] transition-all"
                    >
                        <Refresh width={18} height={18} className={adviceLoading ? 'animate-spin' : ''} />
                    </button>

                    <select
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-bold text-xs focus:outline-none"
                    >
                        {zones.map(zone => (
                            <option key={zone.id} value={zone.id} className="bg-[#1A1A1A]">{zone.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Compact Grid */}
            <div className="hidden md:grid grid-cols-12 gap-5 items-start">
                {/* Left: Health & Yield (Compact) */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <ZoneHealthMeter zoneHealth={zoneHealth} loading={loading} zoneName={zones.find(z => z.id === selectedZone)?.name} />
                    <ImpactPrediction prediction={expertAdvice?.impactPrediction} loading={adviceLoading} />
                    <div className="grid grid-cols-2 gap-3">
                        <SmallStatCard icon={<Droplet width={18} height={18} className="text-[#4D9FFF]" />} label="Soil" value={`${zoneHealth?.breakdown?.soilMoisture?.value || '--'}%`} />
                        <SmallStatCard icon={<NavArrowUp width={18} height={18} className="text-[#FFC857]" />} label="Vigor" value={zoneHealth?.breakdown?.cropVigor?.score || '--'} />
                    </div>
                </div>

                {/* Middle: Tactical Map */}
                <div className="col-span-12 lg:col-span-5 space-y-4">
                    <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden h-[380px]">
                        <FieldZoneMap zones={zones} selectedZone={selectedZone} onZoneSelect={setSelectedZone} zoneHealth={zoneHealth} location={location} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <PhotoAnalyzer zoneId={selectedZone} onAnalysisComplete={fetchZoneHealth} />
                        <AgronomyCalendar schedule={expertAdvice?.cropCalendar} loading={adviceLoading} />
                    </div>
                </div>

                {/* Right: Expert Interventions */}
                <div className="col-span-12 lg:col-span-4">
                    <ZoneRecommendations advice={expertAdvice} loading={adviceLoading} onApplyAction={handleApplyAction} />
                </div>
            </div>

            {/* Mobile Layout */}
            {zones.length > 0 && (
                <div className="md:hidden space-y-6">
                    <ZoneHealthMeter zoneHealth={zoneHealth} loading={loading} zoneName={selectedCropData?.name} />
                    <ZoneRecommendations advice={expertAdvice} loading={adviceLoading} onApplyAction={handleApplyAction} />
                </div>
            )}

            {/* Empty State */}
            {zones.length === 0 && !loading && (
                <div className="p-12 bg-white/5 border border-white/10 rounded-[2.5rem] text-center">
                    <Leaf className="mx-auto text-white/10 mb-4" width={48} height={48} />
                    <h3 className="text-xl font-black text-white mb-2">No Crops Registered</h3>
                    <p className="text-white/40 mb-6">Please add your crops in the Crop Management area to see analysis.</p>
                </div>
            )}
        </div>
    );
}

function SmallStatCard({ icon, label, value }) {
    return (
        <div className="bg-[#111111]/40 border border-white/5 rounded-[1.5rem] p-4 group">
            <div className="bg-white/5 p-2 rounded-xl w-fit mb-2">{icon}</div>
            <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">{label}</p>
            <p className="text-base font-black text-white">{value}</p>
        </div>
    );
}
