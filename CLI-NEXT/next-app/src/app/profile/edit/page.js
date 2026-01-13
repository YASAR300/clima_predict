'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    IoArrowBack,
    IoPerson,
    IoMail,
    IoCall,
    IoLocation,
    IoServer,
    IoLeaf,
    IoCheckmarkCircle,
    IoCamera
} from 'react-icons/io5';

export default function EditProfile() {
    const [formData, setFormData] = useState({
        name: 'Farmer Name',
        email: 'farmer@example.com',
        phone: '+91 98765 43210',
        location: 'Surat, Gujarat',
        farmSize: '15.5',
        crops: 'Wheat, Cotton, Rice, Sugarcane',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Profile updated successfully!');
    };

    return (
        <div className="min-h-screen text-white pb-12 uppercase">
            <div className="w-full max-w-6xl mx-auto px-6 md:px-0">
                {/* Header */}
                <header className="pt-8 pb-4 flex items-center gap-4 md:mb-10">
                    <Link href="/profile" className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-90 transition-all hover:bg-white/10">
                        <NavArrowRight className="rotate-180" width={20} height={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">Identity Management</h1>
                        <p className="hidden md:block text-white/40 text-sm font-medium uppercase tracking-widest mt-1">Personnel records and operational configuration</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Avatar & Quick Actions */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/5 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00D09C]/10 to-[#4D9FFF]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="relative inline-block mb-6">
                                    <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-[2.5rem] w-32 h-32 md:w-40 md:h-40 flex items-center justify-center border-4 border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                        <IoPerson size={64} className="text-white md:hidden" />
                                        <IoPerson size={80} className="text-white hidden md:block" />
                                    </div>
                                    <button className="absolute bottom-0 right-0 bg-[#0D0D0D] p-3 rounded-2xl border border-white/10 text-[#00D09C] hover:scale-110 transition-all shadow-xl">
                                        <IoCamera size={20} />
                                    </button>
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">{formData.name}</h3>
                                <div className="text-[10px] font-black text-white/20 tracking-widest uppercase">Senior Agronomist</div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-4">
                            <div className="text-[8px] font-black text-white/20 tracking-[0.4em] uppercase mb-4 ml-1">Account Security</div>
                            <button className="w-full py-4 px-6 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-white/10 transition-all text-left flex justify-between items-center group">
                                Change Access Key
                                <IoArrowBack size={16} className="text-white/20 group-hover:text-white transition-all" />
                            </button>
                            <button className="w-full py-4 px-6 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-white/10 transition-all text-left flex justify-between items-center group text-red-500">
                                Terminate Records
                                <IoArrowBack size={16} className="text-red-500/20 group-hover:text-red-500 transition-all" />
                            </button>
                        </div>
                    </div>

                    {/* Right: Detailed Records */}
                    <div className="lg:col-span-8">
                        <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-8 md:p-12 border border-white/5">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField label="Personnel Identifier" name="name" value={formData.name} onChange={handleChange} icon={IoPerson} />
                                    <FormField label="Communication Vector" name="email" value={formData.email} onChange={handleChange} icon={IoMail} />
                                    <FormField label="Mobile Telemetry" name="phone" value={formData.phone} onChange={handleChange} icon={IoCall} />
                                    <FormField label="Geospatial Hub" name="location" value={formData.location} onChange={handleChange} icon={IoLocation} />
                                    <FormField label="Agronomic Expansion (Acres)" name="farmSize" value={formData.farmSize} onChange={handleChange} icon={IoServer} type="number" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/20 tracking-[0.2em] ml-1 uppercase">Biological Inventory</label>
                                    <div className="relative">
                                        <textarea
                                            name="crops"
                                            value={formData.crops}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full bg-white/5 border border-white/5 rounded-3xl px-6 py-5 text-sm font-black text-white placeholder-white/20 outline-none focus:bg-white/10 focus:border-[#00D09C]/30 transition-all resize-none uppercase"
                                            placeholder="Enter crop list…"
                                        />
                                        <IoLeaf className="absolute top-5 right-6 text-white/10" size={24} />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-[#00D09C] to-[#4D9FFF] rounded-[2rem] py-5 text-[#0D0D0D] font-black tracking-[0.2em] text-xs hover:opacity-90 shadow-2xl active:scale-95 transition-all uppercase"
                                    >
                                        Synchronize Records
                                    </button>
                                    <Link href="/profile" className="flex-1">
                                        <button
                                            type="button"
                                            className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-5 text-white font-black tracking-[0.2em] text-xs hover:bg-white/10 transition-all uppercase"
                                        >
                                            Discard Changes
                                        </button>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormField({ label, name, value, onChange, icon: Icon, type = "text" }) {
    return (
        <div className="space-y-3 pt-1">
            <label className="text-[10px] font-black text-white/20 tracking-[0.2em] ml-1 uppercase">{label}</label>
            <div className="relative group">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-black text-white placeholder-white/20 outline-none group-hover:bg-white/[0.08] focus:bg-white/10 focus:border-[#00D09C]/30 transition-all uppercase"
                />
                <Icon className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[#00D09C] transition-colors" size={18} />
            </div>
        </div>
    );
}
