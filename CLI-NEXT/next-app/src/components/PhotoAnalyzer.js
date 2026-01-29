'use client';

import { useState } from 'react';
import { Camera, Upload, Xmark } from 'iconoir-react';

/**
 * Photo Analyzer Component
 * Upload and analyze crop photos using AI
 * Responsive: Full width on mobile, compact on desktop
 */

export default function PhotoAnalyzer({ zoneId, onAnalysisComplete }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisStage, setAnalysisStage] = useState('');
    const [result, setResult] = useState(null);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const [userDescription, setUserDescription] = useState('');

    const analyzeImage = async () => {
        if (!selectedImage) return;

        setAnalyzing(true);
        setResult(null);

        // Analysis stages for visual feedback
        const stages = [
            'Verifying plant validity (Google Vision)...',
            'Running statistical disease detection (Hugging Face)...',
            'Synthesizing final diagnosis (OpenAI Intelligence)...'
        ];

        try {
            // Fake stages for UX feel
            setAnalysisStage(stages[0]);
            await new Promise(r => setTimeout(r, 1000));
            setAnalysisStage(stages[1]);
            await new Promise(r => setTimeout(r, 1000));
            setAnalysisStage(stages[2]);

            const response = await fetch('/api/precision-ag/analyze-vision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: selectedImage,
                    description: userDescription,
                    context: {
                        zoneId,
                        location: 'Ahmedabad, IN', // Fallback
                        cropType: 'Rice' // Fallback
                    }
                })
            });

            const data = await response.json();
            setResult(data);

            if (data.status === 'success' && onAnalysisComplete) {
                onAnalysisComplete(data);
            }
        } catch (error) {
            console.error('Vision analysis failed:', error);
            setResult({
                status: 'error',
                message: 'Connection failed. Please check your internet and try again.',
                healthScore: 0,
                issues: ['Network error during analysis'],
                recommendations: ['Retry upload']
            });
        } finally {
            setAnalyzing(false);
            setAnalysisStage('');
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setResult(null);
    };

    return (
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6 hover:border-white/10 transition-all">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#9D4EDD]/10 rounded-xl">
                    <Camera width={20} height={20} className="text-[#9D4EDD]" />
                </div>
                <div>
                    <h3 className="text-base font-black text-white">Photo Analysis</h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                        AI Crop Health Detection
                    </p>
                </div>
            </div>

            {/* Upload Area */}
            {!selectedImage ? (
                <label className="block cursor-pointer group">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    <div className="border border-dashed border-white/10 group-hover:border-[#9D4EDD]/40 rounded-2xl p-6 text-center transition-all bg-white/[0.02]">
                        <div className="w-12 h-12 mx-auto mb-3 bg-[#9D4EDD]/10 rounded-xl flex items-center justify-center group-hover:bg-[#9D4EDD]/20 transition-all">
                            <Upload width={24} height={24} className="text-[#9D4EDD]" />
                        </div>
                        <p className="text-[11px] font-black text-white/60 group-hover:text-white/80 transition-colors uppercase tracking-widest">
                            Upload Photo
                        </p>
                        <p className="text-[9px] text-white/20 mt-1 uppercase font-bold">
                            Max 10MB
                        </p>
                    </div>
                </label>
            ) : (
                <div className="space-y-4">
                    {/* Image Preview */}
                    <div className="relative rounded-2xl overflow-hidden">
                        <img
                            src={selectedImage}
                            alt="Crop"
                            className="w-full h-48 object-cover"
                        />
                        <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-xl hover:bg-black/80 transition-all"
                        >
                            <Xmark width={16} height={16} className="text-white" />
                        </button>
                    </div>

                    {/* User Description Input */}
                    {!result && !analyzing && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block ml-1">
                                User Observations (Describe Symptoms)
                            </label>
                            <textarea
                                value={userDescription}
                                onChange={(e) => setUserDescription(e.target.value)}
                                placeholder="Describe spots, wilting, or unusual growth patterns..."
                                className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-white/80 focus:outline-none focus:border-[#9D4EDD]/40 transition-all resize-none placeholder:text-white/10"
                            />
                        </div>
                    )}

                    {/* Analyze Button */}
                    {!result && (
                        <button
                            onClick={analyzeImage}
                            disabled={analyzing}
                            className="w-full bg-[#9D4EDD] hover:bg-[#9D4EDD]/90 shadow-lg shadow-[#9D4EDD]/20 border border-white/10 rounded-2xl px-4 py-4 text-white text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            {analyzing ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="uppercase tracking-widest text-[10px]">Processing Ensemble</span>
                                    </div>
                                    <span className="text-[11px] font-bold opacity-70 animate-pulse">{analysisStage}</span>
                                </div>
                            ) : (
                                <span className="flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                                    <Camera width={20} height={20} />
                                    START AI ENSEMBLE SCAN
                                </span>
                            )}
                        </button>
                    )}

                    {/* Results */}
                    {result && (
                        <div className={`rounded-2xl p-4 space-y-3 ${result.status === 'error' ? 'bg-red-500/10 border border-red-500/20' :
                            result.status === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' :
                                'bg-black/20'
                            }`}>
                            {result.message && (
                                <div className={`text-xs font-bold flex items-center gap-2 ${result.status === 'error' ? 'text-red-400' :
                                    result.status === 'warning' ? 'text-amber-400' :
                                        'text-[#00D09C]'
                                    }`}>
                                    {result.status === 'error' ? '❌ ' : result.status === 'warning' ? '⚠️ ' : '✅ '}
                                    {result.message}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
                                    {result.status === 'success' ? 'Health Score' : 'Validation Score'}
                                </span>
                                <span className={`text-2xl font-black ${result.status === 'error' ? 'text-red-500' :
                                    result.status === 'warning' ? 'text-amber-500' :
                                        'text-[#00D09C]'
                                    }`}>
                                    {result.healthScore}%
                                </span>
                            </div>

                            {result.issues.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                                        AI Findings
                                    </div>
                                    <ul className="space-y-1">
                                        {result.issues.map((issue, i) => (
                                            <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                                <span className={`${result.status === 'error' ? 'text-red-500' :
                                                    result.status === 'warning' ? 'text-amber-500' :
                                                        'text-[#FF6B35]'
                                                    } mt-0.5`}>•</span>
                                                {issue}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
