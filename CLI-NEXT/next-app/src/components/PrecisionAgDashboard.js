'use client';

import { useState, useEffect } from 'react';
import { Leaf, NavArrowUp, Droplet, WarningTriangle, Camera, Map as MapIcon, Refresh, Calendar, Sparks } from 'iconoir-react';
import ZoneHealthMeter from './ZoneHealthMeter';
import FieldZoneMap from './FieldZoneMap';
import ZoneRecommendations from './ZoneRecommendations';
import PhotoAnalyzer from './PhotoAnalyzer';
import AgronomyCalendar from './AgronomyCalendar';
import ImpactPrediction from './ImpactPrediction';
import Link from 'next/link';
import { ReportColumns } from 'iconoir-react';

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
    const fetchCrops = async () => {
        setLoading(true);
        setAdviceLoading(true);
        try {
            const response = await fetch('/api/crops');
            const result = await response.json();
            if (result.success && result.data.length > 0) {
                const mappedCrops = result.data.map((c, index) => ({
                    id: c.id,
                    name: `${c.type} (${c.area || 'Active'}) #${index + 1}`,
                    area: parseFloat(c.area) || 0,
                    crop: c.type,
                    sowingDate: c.sowingDate,
                    agronomyRecords: c.agronomyRecords || [],
                    soilData: c.soilData
                }));
                setZones(mappedCrops);
                if (!selectedZone) setSelectedZone(mappedCrops[0].id);
            }
        } catch (e) {
            console.error('Failed to fetch crops', e);
        } finally {
            // Keep loading true until zone health is also fetched
            setTimeout(() => {
                setLoading(false);
                setAdviceLoading(false);
            }, 500);
        }
    };

    useEffect(() => {
        fetchCrops();
    }, []);

    // Derived values for the selected crop
    const selectedCropData = zones.find(z => z.id === selectedZone);
    const currentCropType = selectedCropData?.crop || 'unknown';
    const sowingDate = selectedCropData?.sowingDate;
    const currentDaysAfterSowing = sowingDate
        ? Math.floor((new Date() - new Date(sowingDate)) / (1000 * 60 * 60 * 24))
        : null;

    const [confidenceError, setConfidenceError] = useState(null);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        if (!selectedZone) {
            if (!loading) setLoading(false);
            if (!adviceLoading) setAdviceLoading(false);
            return;
        }
        fetchZoneHealth();
        fetchExpertAdvice();

        // Background refreshes - SUSPENDED if confidence error exists
        const interval = setInterval(() => {
            if (!confidenceError) {
                fetchZoneHealthSilent();
                fetchExpertAdviceSilent();
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [selectedZone, location, confidenceError]); // Now reacts to confidenceError

    const fetchZoneHealthSilent = async () => {
        if (confidenceError) return;
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
        if (confidenceError) return;
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

    const fetchExpertAdvice = async (analysisData = latestAnalysis) => {
        if (!selectedZone) return;
        setAdviceLoading(true);
        setConfidenceError(null);

        try {
            const response = await fetch(`/api/precision-ag/expert-advice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cropId: selectedZone,
                    cropType: currentCropType,
                    daysAfterSowing: currentDaysAfterSowing,
                    location,
                    soilData: {
                        n: zoneHealth?.breakdown?.nitrogen?.value || 120,
                        moisture: zoneHealth?.breakdown?.soilMoisture?.value || 60
                    },
                    weather: { temp: 28, humidity: 65 },
                    photoBase64: analysisData?.base64,
                    description: analysisData?.description
                })
            });

            if (response.ok) {
                const result = await response.json();
                setExpertAdvice(result.data);
                setLatestAnalysis(result.visualSignals);
                setIsOffline(false);
            } else if (response.status === 422) {
                const errorData = await response.json();
                setConfidenceError(errorData.message);
                setExpertAdvice(null);
                setZoneHealth(null);
                setLatestAnalysis(null);
            } else {
                setIsOffline(true);
                setExpertAdvice(null);
            }
        } catch (e) {
            console.error('Expert advice fetch failed', e);
            setIsOffline(true);
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
            await fetchCrops(); // Refresh history and health status immediately
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
                if (result.data.confidence >= 0.65) setConfidenceError(null);
            } else if (response.status === 422) {
                const errorData = await response.json();
                setConfidenceError(errorData.message);
                setZoneHealth(null);
                setExpertAdvice(null);
                setLatestAnalysis(null);
            }
        } catch (error) {
            console.error('Failed to fetch zone health:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* OPTIMIZED HEADER: CLEAN & SPACED */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00D09C]/10 rounded-xl">
                            <Leaf width={26} height={26} className="text-[#00D09C]" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight leading-none">
                            Precision Ag <span className="text-[#00D09C]">Portal</span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        {selectedCropData ? (
                            <>
                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-[#00D09C] rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{currentCropType}</span>
                                </div>
                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">
                                        {currentDaysAfterSowing !== null ? `Phase: Day ${currentDaysAfterSowing}` : 'Stable Growth'}
                                    </span>
                                </div>
                                <div className="px-3 py-1 bg-[#00D09C]/10 border border-[#00D09C]/20 rounded-full">
                                    <span className="text-[10px] font-black text-[#00D09C] uppercase tracking-widest">{selectedCropData.name}</span>
                                </div>
                            </>
                        ) : (
                            <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Authenticating Farm Assets...</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                    {!confidenceError && (
                        <button
                            onClick={fetchExpertAdvice}
                            disabled={adviceLoading}
                            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-[#00D09C]/10 text-white/40 hover:text-[#00D09C] transition-all group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-[#00D09C]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Refresh width={20} height={20} className={`${adviceLoading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                        </button>
                    )}

                    <div className="relative group">
                        <select
                            value={selectedZone || ''}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="appearance-none bg-[#111111] border border-white/10 hover:border-[#00D09C]/30 rounded-2xl px-6 py-3.5 text-white font-black text-[11px] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#00D09C]/20 transition-all cursor-pointer min-w-[200px]"
                        >
                            {zones.map(zone => (
                                <option key={zone.id} value={zone.id} className="bg-[#1A1A1A] py-4">{zone.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-[#00D09C] transition-colors">
                            <NavArrowUp className="rotate-180" width={16} height={16} />
                        </div>
                    </div>

                    <Link
                        href={`/precision-agriculture/report/${selectedZone}`}
                        className="flex items-center gap-2 px-6 py-3.5 bg-[#00D09C] border border-[#00D09C]/20 rounded-2xl text-black font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#00D09C]/20"
                    >
                        <ReportColumns width={18} height={18} />
                        View Report
                    </Link>
                </div>
            </div>

            {/* ALERTS SECTION: NON-INTRUSIVE BANNERS */}
            <div className="space-y-4 mb-8">
                {isOffline && (
                    <div className="animate-in fade-in slide-in-from-top duration-500">
                        <div className="bg-[#FF3B30]/5 border border-[#FF3B30]/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-[#FF3B30]/10 rounded-2xl">
                                    <Sparks className="text-[#FF3B30] animate-pulse" width={32} height={32} />
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-white font-black uppercase tracking-tight text-lg">High Intelligence Demand</h3>
                                    <p className="text-white/40 text-sm font-bold max-w-lg leading-relaxed">
                                        The AI Diagnostic Engine is currently handling peak agriculture load. Standard biometrics available below.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => fetchExpertAdvice()}
                                className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 active:scale-95 transition-all"
                            >
                                Attempt Re-Synthesis
                            </button>
                        </div>
                    </div>
                )}

                {confidenceError && (
                    <div className="animate-in fade-in slide-in-from-top duration-700">
                        <div className="bg-[#FFC857]/5 border border-[#FFC857]/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-[#FFC857]/10 rounded-2xl">
                                    <Camera className="text-[#FFC857]" width={32} height={32} />
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-white font-black uppercase tracking-tight text-lg">Image Fidelity Restricted</h3>
                                    <p className="text-white/40 text-sm font-bold max-w-lg leading-relaxed">
                                        Vision AI detected low quality ({(latestAnalysis?.confidence * 100).toFixed(0)}%). Upload a sharper photo for precision diagnostics.
                                    </p>
                                </div>
                            </div>
                            <div className="w-full md:w-auto">
                                <PhotoAnalyzer zoneId={selectedZone} onAnalysisComplete={fetchZoneHealth} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Interactive Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-700">

                {/* Left Column: Intelligence Summary (Sticky) */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-8 lg:sticky lg:top-8">
                    <div className="bg-[#111111] border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D09C]/5 rounded-full blur-3xl pointer-events-none" />
                        <ZoneHealthMeter
                            zoneHealth={zoneHealth}
                            loading={loading}
                            cropType={currentCropType}
                        />
                    </div>

                    <ImpactPrediction prediction={expertAdvice?.impactPrediction} loading={adviceLoading} />

                    <div className="grid grid-cols-2 gap-4">
                        <SmallStatCard
                            icon={<Droplet width={20} height={20} className="text-[#4D9FFF]" />}
                            label="Soil Moisture"
                            value={`${zoneHealth?.breakdown?.soilMoisture?.value || '--'}%`}
                        />
                        <SmallStatCard
                            icon={<NavArrowUp width={20} height={20} className="text-[#FFC857]" />}
                            label="Crop Vigor"
                            value={zoneHealth?.breakdown?.cropVigor?.score || '--'}
                        />
                    </div>
                </div>

                {/* Right Column: Visualization & Detailed Registry */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                    {/* Top Section: Field Map (Primary Content) */}
                    <div className="bg-[#111111] border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl relative min-h-[500px]">
                        <FieldZoneMap
                            zones={zones}
                            selectedZone={selectedZone}
                            onZoneSelect={setSelectedZone}
                            zoneHealth={zoneHealth}
                            location={location}
                        />
                    </div>

                    {/* Bottom Section: Action Plan & Registry (Two-Column within Right Column) */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Detailed Biological Interventions */}
                        <div className="xl:col-span-7">
                            <div className="bg-[#111111] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl min-h-[600px] flex flex-col">
                                <ZoneRecommendations advice={expertAdvice} loading={adviceLoading} onApplyAction={handleApplyAction} />
                                <div className="p-6 border-t border-white/5 bg-black/40">
                                    <Link
                                        href={`/precision-agriculture/report/${selectedZone}`}
                                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                                    >
                                        <ReportColumns width={16} height={16} />
                                        Launch Full Comprehensive Brief
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Auxiliary Data: Thermal & Agronomy */}
                        <div className="xl:col-span-5 space-y-8">
                            <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden group hover:border-[#9D4EDD]/20 transition-all">
                                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <Camera width={14} height={14} /> Thermal Capture
                                </h4>
                                <PhotoAnalyzer zoneId={selectedZone} onAnalysisComplete={fetchZoneHealth} />
                            </div>
                            <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden group hover:border-[#00D09C]/20 transition-all">
                                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <Calendar width={14} height={14} /> Agronomy Registry
                                </h4>
                                <AgronomyCalendar schedule={expertAdvice?.cropCalendar} loading={adviceLoading} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State Registry */}
            {zones.length === 0 && !loading && (
                <div className="p-24 bg-[#111111]/90 backdrop-blur-3xl border border-white/5 rounded-[4rem] text-center max-w-2xl mx-auto shadow-2xl animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-[#00D09C]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Leaf className="text-[#00D09C]" width={48} height={48} />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Farm Assets Required</h3>
                    <p className="text-white/40 text-sm font-bold leading-relaxed mb-10 px-8">
                        Your precision agricultural portal is initialized, but no crop assets were detected in our neural registry.
                    </p>
                    <button className="px-10 py-5 bg-[#00D09C] text-black font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#00D09C]/20">
                        Initialize Asset Protocol
                    </button>
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
