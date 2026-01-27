'use client';

import { useState, useEffect } from 'react';
import FieldSetupForm from './FieldSetupForm';
import PhotoUploadSystem from './PhotoUploadSystem';
import AnalysisTrigger from './AnalysisTrigger';
import PrecisionAgDashboard from './PrecisionAgDashboard';
import { NavArrowLeft, InfoEmpty } from 'iconoir-react';

/**
 * Precision Agriculture Flow Manager
 * Manages the transition between DRAFT -> READY -> ANALYZING -> DONE
 */

export default function PrecisionAgFlow({ location }) {
    const [status, setStatus] = useState('LOADING'); // LOADING, DRAFT, DETAILS_COMPLETE, ANALYZING, RESULTS_READY
    const [fieldData, setFieldData] = useState(null);
    const [photos, setPhotos] = useState([]);

    // Check for existing crops on mount
    useEffect(() => {
        const checkExisting = async () => {
            try {
                const response = await fetch('/api/crops');
                const result = await response.json();
                if (result.success && result.data.length > 0) {
                    setStatus('RESULTS_READY');
                } else {
                    setStatus('DRAFT');
                }
            } catch (e) {
                setStatus('DRAFT');
            }
        };
        checkExisting();
    }, []);

    const handleDetailsComplete = (data) => {
        setFieldData(data);
        setStatus('DETAILS_COMPLETE');
    };

    const handlePhotosComplete = (uploadedPhotos) => {
        setPhotos(uploadedPhotos);
        setStatus('ANALYZING');
    };

    const handleAnalysisDone = async () => {
        // Persist the new crop to the database
        if (fieldData) {
            try {
                await fetch('/api/crops', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: fieldData.cropType,
                        health: 75, // Initial simulated health
                        status: 'Initial Scan Complete',
                        area: String(fieldData.fieldArea || 'Main Field'),
                        stage: fieldData.sowingDate ? 'Vegetative' : 'Unknown',
                        sowingDate: fieldData.sowingDate,
                        expectedYield: 'Calculating...',
                        issues: ['Initial scan baseline']
                    })
                });
            } catch (e) {
                console.error('Failed to persist new crop:', e);
            }
        }
        setStatus('RESULTS_READY');
    };

    const resetFlow = () => {
        setStatus('DRAFT');
        setFieldData(null);
        setPhotos([]);
    };

    return (
        <div className="w-full">
            {status === 'LOADING' && (
                <div className="flex flex-col items-center justify-center p-24">
                    <div className="w-12 h-12 border-4 border-[#00D09C]/20 border-t-[#00D09C] rounded-full animate-spin mb-4" />
                    <p className="text-white/40 font-black uppercase tracking-widest text-xs">Synchronizing Crops...</p>
                </div>
            )}

            {status === 'DRAFT' && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="max-w-4xl mx-auto mb-12 text-center">
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">Start Precision Analysis</h2>
                        <p className="text-white/40 text-lg font-medium">Complete your field profile to unlock AI intelligence</p>
                    </div>
                    <FieldSetupForm onComplete={handleDetailsComplete} />
                </div>
            )}

            {status === 'DETAILS_COMPLETE' && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                    <PhotoUploadSystem
                        fieldData={fieldData}
                        onComplete={handlePhotosComplete}
                        onBack={() => setStatus('DRAFT')}
                    />
                </div>
            )}

            {status === 'ANALYZING' && (
                <div className="animate-in zoom-in-95 fade-in duration-1000">
                    <AnalysisTrigger onComplete={handleAnalysisDone} />
                </div>
            )}

            {status === 'RESULTS_READY' && (
                <div className="animate-in fade-in duration-1000">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={resetFlow}
                            className="flex items-center gap-2 text-white/40 hover:text-white transition-all font-bold text-sm"
                        >
                            <NavArrowLeft width={18} height={18} />
                            Start New Analysis
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#00D09C]/10 rounded-xl border border-[#00D09C]/20">
                            <div className="w-2 h-2 bg-[#00D09C] rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-[#00D09C] uppercase tracking-widest">Expert Intel Active</span>
                        </div>
                    </div>
                    <PrecisionAgDashboard
                        location={location}
                        cropType={fieldData?.cropType}
                    />
                </div>
            )}
        </div>
    );
}
