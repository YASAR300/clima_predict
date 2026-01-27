'use client';

import { useState } from 'react';
import { Check, NavArrowRight, Leaf, Calendar, Map as MapIcon, Droplet } from 'iconoir-react';

/**
 * Field Setup Form - STEP 1 (BLOCKING)
 * User cannot proceed without completing this
 * Enterprise-grade data collection
 */

const CROP_LIBRARY = [
    // Grains
    { value: 'rice', label: 'Rice (Paddy)', icon: '🌾', group: 'Grains' },
    { value: 'wheat', label: 'Wheat', icon: '🌾', group: 'Grains' },
    { value: 'corn', label: 'Maize (Corn)', icon: '🌽', group: 'Grains' },
    { value: 'barley', label: 'Barley', icon: '🌾', group: 'Grains' },
    { value: 'millet', label: 'Millet', icon: '🌾', group: 'Grains' },
    { value: 'sorghum', label: 'Sorghum', icon: '🌾', group: 'Grains' },
    { value: 'oats', label: 'Oats', icon: '🥣', group: 'Grains' },
    // Vegetables
    { value: 'tomato', label: 'Tomato', icon: '🍅', group: 'Vegetables' },
    { value: 'potato', label: 'Potato', icon: '🥔', group: 'Vegetables' },
    { value: 'onion', label: 'Onion', icon: '🧅', group: 'Vegetables' },
    { value: 'garlic', label: 'Garlic', icon: '🧄', group: 'Vegetables' },
    { value: 'carrot', label: 'Carrot', icon: '🥕', group: 'Vegetables' },
    { value: 'cabbage', label: 'Cabbage', icon: '🥬', group: 'Vegetables' },
    { value: 'broccoli', label: 'Broccoli', icon: '🥦', group: 'Vegetables' },
    { value: 'spinach', label: 'Spinach', icon: '🥬', group: 'Vegetables' },
    { value: 'pepper', label: 'Chili/Pepper', icon: '🌶️', group: 'Vegetables' },
    { value: 'cucumber', label: 'Cucumber', icon: '🥒', group: 'Vegetables' },
    // Fruits
    { value: 'apple', label: 'Apple', icon: '🍎', group: 'Fruits' },
    { value: 'banana', label: 'Banana', icon: '🍌', group: 'Fruits' },
    { value: 'grape', label: 'Grapes', icon: '🍇', group: 'Fruits' },
    { value: 'mango', label: 'Mango', icon: '🥭', group: 'Fruits' },
    { value: 'orange', label: 'Citrus/Orange', icon: '🍊', group: 'Fruits' },
    { value: 'strawberry', label: 'Strawberry', icon: '🍓', group: 'Fruits' },
    { value: 'watermelon', label: 'Watermelon', icon: '🍉', group: 'Fruits' },
    // Cash Crops
    { value: 'cotton', label: 'Cotton', icon: '🌿', group: 'Cash Crops' },
    { value: 'sugarcane', label: 'Sugarcane', icon: '🎋', group: 'Cash Crops' },
    { value: 'coffee', label: 'Coffee', icon: '☕', group: 'Cash Crops' },
    { value: 'tea', label: 'Tea', icon: '🍃', group: 'Cash Crops' },
    { value: 'cocoa', label: 'Cocoa', icon: '🍫', group: 'Cash Crops' },
    { value: 'rubber', label: 'Rubber', icon: '🪵', group: 'Cash Crops' },
    { value: 'soybean', label: 'Soybean', icon: '🫘', group: 'Legumes' },
    { value: 'peanut', label: 'Peanut', icon: '🥜', group: 'Legumes' },
    { value: 'sunflower', label: 'Sunflower', icon: '🌻', group: 'Oilseeds' },
    { value: 'mustard', label: 'Mustard', icon: '🌼', group: 'Oilseeds' }
];

export default function FieldSetupForm({ onComplete, initialData = {} }) {
    const [formData, setFormData] = useState({
        cropType: initialData.cropType || '',
        sowingDate: initialData.sowingDate || '',
        fieldArea: initialData.fieldArea || '',
        irrigationType: initialData.irrigationType || '',
        zones: initialData.zones || [{ id: 'zone_1', name: 'Main Field', area: '' }],
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});

    const filteredCrops = CROP_LIBRARY.filter(crop =>
        crop.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.group.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const irrigationTypes = [
        { value: 'drip', label: 'Drip Irrigation', icon: '💧' },
        { value: 'sprinkler', label: 'Sprinkler', icon: '🚿' },
        { value: 'flood', label: 'Flood Irrigation', icon: '🌊' },
        { value: 'rainfed', label: 'Rainfed', icon: '🌧️' }
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.cropType) newErrors.cropType = 'Please select a crop type';
        if (!formData.sowingDate) newErrors.sowingDate = 'Please enter sowing date';
        if (!formData.fieldArea || formData.fieldArea <= 0) newErrors.fieldArea = 'Please enter valid field area';
        if (!formData.irrigationType) newErrors.irrigationType = 'Please select irrigation type';

        // Validate zones
        formData.zones.forEach((zone, index) => {
            if (!zone.name) newErrors[`zone_${index}_name`] = 'Zone name required';
            if (!zone.area || zone.area <= 0) newErrors[`zone_${index}_area`] = 'Zone area required';
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onComplete(formData);
        }
    };

    const addZone = () => {
        setFormData({
            ...formData,
            zones: [...formData.zones, { id: `zone_${formData.zones.length + 1}`, name: '', area: '' }]
        });
    };

    const removeZone = (index) => {
        if (formData.zones.length > 1) {
            const newZones = formData.zones.filter((_, i) => i !== index);
            setFormData({ ...formData, zones: newZones });
        }
    };

    const updateZone = (index, field, value) => {
        const newZones = [...formData.zones];
        newZones[index][field] = value;
        setFormData({ ...formData, zones: newZones });
    };

    const progress = () => {
        let completed = 0;
        const total = 5; // crop, date, area, irrigation, zones

        if (formData.cropType) completed++;
        if (formData.sowingDate) completed++;
        if (formData.fieldArea > 0) completed++;
        if (formData.irrigationType) completed++;
        if (formData.zones.every(z => z.name && z.area > 0)) completed++;

        return Math.round((completed / total) * 100);
    };

    const isFormComplete = progress() === 100;

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white/60">Setup Progress</h3>
                    <span className="text-2xl font-black text-[#00D09C]">{progress()}%</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#00D09C] to-[#4D9FFF] transition-all duration-500 rounded-full"
                        style={{ width: `${progress()}%` }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Crop Selection */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[#00D09C]/10 rounded-2xl">
                                <Leaf width={24} height={24} className="text-[#00D09C]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">Crop Information</h3>
                                <p className="text-sm text-white/40 font-medium">Search and select your crop</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search crops (e.g. Rice, Mango, Legumes...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white font-bold focus:outline-none focus:border-[#00D09C] transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredCrops.map((crop) => (
                            <button
                                key={crop.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, cropType: crop.label })}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${formData.cropType === crop.label
                                    ? 'bg-[#00D09C]/10 border-[#00D09C] shadow-lg shadow-[#00D09C]/20'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{crop.icon}</div>
                                <div className="text-[11px] font-black text-white leading-tight">{crop.label}</div>
                                <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">{crop.group}</div>
                            </button>
                        ))}

                        {filteredCrops.length === 0 && (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-white/30 font-bold mb-4">Crop not found? Add it manually:</p>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, cropType: searchTerm })}
                                    className="px-6 py-2 bg-[#00D09C] text-black font-black rounded-xl hover:scale-105 transition-all"
                                >
                                    Use "{searchTerm}" as Crop
                                </button>
                            </div>
                        )}
                    </div>
                    {errors.cropType && <p className="text-[#FF6B35] text-sm font-bold mt-3">{errors.cropType}</p>}
                </div>

                {/* Sowing Date & Field Area */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <label className="block mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar width={20} height={20} className="text-[#4D9FFF]" />
                                <span className="text-sm font-black uppercase tracking-wider text-white/60">Sowing Date</span>
                            </div>
                            <input
                                type="date"
                                value={formData.sowingDate}
                                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#00D09C] transition-all"
                            />
                        </label>
                        {errors.sowingDate && <p className="text-[#FF6B35] text-sm font-bold">{errors.sowingDate}</p>}
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <label className="block mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <MapIcon width={20} height={20} className="text-[#9D4EDD]" />
                                <span className="text-sm font-black uppercase tracking-wider text-white/60">Field Area (hectares)</span>
                            </div>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={formData.fieldArea}
                                onChange={(e) => setFormData({ ...formData, fieldArea: parseFloat(e.target.value) })}
                                placeholder="e.g., 2.5"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#00D09C] transition-all"
                            />
                        </label>
                        {errors.fieldArea && <p className="text-[#FF6B35] text-sm font-bold">{errors.fieldArea}</p>}
                    </div>
                </div>

                {/* Irrigation Type */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-[#4D9FFF]/10 rounded-2xl">
                            <Droplet width={24} height={24} className="text-[#4D9FFF]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">Irrigation Method</h3>
                            <p className="text-sm text-white/40 font-medium">How do you water your crops?</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {irrigationTypes.map((irrigation) => (
                            <button
                                key={irrigation.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, irrigationType: irrigation.value })}
                                className={`p-5 rounded-2xl border-2 transition-all duration-300 ${formData.irrigationType === irrigation.value
                                    ? 'bg-[#4D9FFF]/10 border-[#4D9FFF] shadow-lg shadow-[#4D9FFF]/20'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{irrigation.icon}</div>
                                <div className="text-xs font-bold text-white">{irrigation.label}</div>
                            </button>
                        ))}
                    </div>
                    {errors.irrigationType && <p className="text-[#FF6B35] text-sm font-bold mt-3">{errors.irrigationType}</p>}
                </div>

                {/* Zones */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black text-white">Field Zones</h3>
                            <p className="text-sm text-white/40 font-medium">Divide your field into monitoring zones</p>
                        </div>
                        <button
                            type="button"
                            onClick={addZone}
                            className="px-4 py-2 bg-[#00D09C]/10 border border-[#00D09C]/30 rounded-xl text-sm font-bold text-[#00D09C] hover:bg-[#00D09C]/20 transition-all"
                        >
                            + Add Zone
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.zones.map((zone, index) => (
                            <div key={zone.id} className="flex gap-4 items-start">
                                <div className="flex-1 grid md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={zone.name}
                                        onChange={(e) => updateZone(index, 'name', e.target.value)}
                                        placeholder="Zone name (e.g., North Field)"
                                        className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#00D09C] transition-all"
                                    />
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={zone.area}
                                        onChange={(e) => updateZone(index, 'area', parseFloat(e.target.value))}
                                        placeholder="Area (hectares)"
                                        className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#00D09C] transition-all"
                                    />
                                </div>
                                {formData.zones.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeZone(index)}
                                        className="p-3 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-xl text-[#FF6B35] hover:bg-[#FF6B35]/20 transition-all"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6">
                    <p className="text-sm text-white/40 font-medium">
                        {isFormComplete ? '✅ All fields complete!' : '⚠️ Complete all fields to proceed'}
                    </p>
                    <button
                        type="submit"
                        disabled={!isFormComplete}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg transition-all duration-300 ${isFormComplete
                            ? 'bg-gradient-to-r from-[#00D09C] to-[#4D9FFF] text-white shadow-lg shadow-[#00D09C]/30 hover:shadow-[#00D09C]/50 hover:scale-105'
                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                            }`}
                    >
                        <span>Continue to Photos</span>
                        <NavArrowRight width={24} height={24} />
                    </button>
                </div>
            </form>
        </div>
    );
}
