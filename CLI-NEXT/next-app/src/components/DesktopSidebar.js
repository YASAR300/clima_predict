'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ViewGrid,
    Map,
    Network,
    Bell,
    Settings,
    Cloud,
    Pin,
    ModernTv,
    Journal,
    StatsUpSquare,
    Xmark,
    Search
} from 'iconoir-react';

const sidebarItems = [
    { href: '/', icon: ViewGrid, label: 'Control Center' },
    { href: '/weather-map', icon: Map, label: 'Spectral Analytics' },
    { href: '/forecast', icon: StatsUpSquare, label: 'Weekly Outlook' },
    { href: '/insights', icon: ModernTv, label: 'Climate Intelligence' },
    { href: '/community', icon: Journal, label: 'Feed & Insights' },
    { href: '/sensors', icon: Network, label: 'Sensor Grid' },
    { href: '/alerts', icon: Bell, label: 'Hazard Alerts' },
    { href: '/settings', icon: Settings, label: 'Configuration' },
];

export default function DesktopSidebar() {
    const pathname = usePathname();
    const [location, setLocation] = useState('Mumbai Central, IN');
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load saved location from localStorage
    useEffect(() => {
        const savedLocation = localStorage.getItem('selectedLocation');
        if (savedLocation) {
            setLocation(savedLocation);
        }
    }, []);

    // Search for locations
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/api/weather/geocode?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.results) {
                setSearchResults(data.results.slice(0, 5)); // Top 5 results
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Select location
    const selectLocation = (locationData) => {
        const locationName = `${locationData.name}, ${locationData.country}`;
        setLocation(locationName);
        localStorage.setItem('selectedLocation', locationName);
        localStorage.setItem('selectedLocationData', JSON.stringify(locationData));
        setShowLocationModal(false);
        setSearchQuery('');
        setSearchResults([]);

        // Reload page to fetch new weather data
        window.location.reload();
    };

    return (
        <>
            <aside className="hidden lg:flex flex-col h-screen w-72 bg-[#0D0D0D] border-r border-white/5 p-6 sticky top-0">
                <div className="flex items-center gap-3 mb-12">
                    <div className="p-3 bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-2xl">
                        <Cloud width={24} height={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">ClimaPredict</h1>
                        <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">Precision Meteorology</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${isActive
                                        ? 'bg-gradient-to-r from-[#00D09C] to-[#4D9FFF] text-white shadow-xl'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon width={20} height={20} className={isActive ? 'text-white' : 'group-hover:text-white'} />
                                <span className="text-xs font-black uppercase tracking-wider">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto">
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00D09C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[#00D09C]">
                                <Pin width={18} height={18} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] uppercase font-black text-white/20 tracking-widest">Selected Region</span>
                                <span className="text-xs font-black truncate text-white/80">{location}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowLocationModal(true)}
                            className="relative z-10 w-full py-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 text-[#00D09C]"
                        >
                            Switch Location
                        </button>
                    </div>
                </div>
            </aside>

            {/* Location Switcher Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-[3rem] p-8 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Switch Location</h2>
                            <button
                                onClick={() => {
                                    setShowLocationModal(false);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                                className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"
                            >
                                <Xmark width={20} height={20} className="text-white/40" />
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" width={18} height={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search city or location..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold text-white outline-none focus:bg-white/10 focus:border-[#00D09C]/30 transition-all uppercase placeholder:text-white/10"
                            />
                        </div>

                        {isSearching && (
                            <div className="text-center py-8 text-white/40 text-xs font-bold uppercase tracking-widest">
                                Searching...
                            </div>
                        )}

                        {searchResults.length > 0 && (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {searchResults.map((result, index) => (
                                    <button
                                        key={index}
                                        onClick={() => selectLocation(result)}
                                        className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Pin width={16} height={16} className="text-[#00D09C]" />
                                            <div>
                                                <div className="text-sm font-black text-white group-hover:text-[#00D09C] transition-colors">
                                                    {result.name}
                                                </div>
                                                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                                                    {result.state ? `${result.state}, ` : ''}{result.country}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                            <div className="text-center py-8 text-white/40 text-xs font-bold uppercase tracking-widest">
                                No locations found
                            </div>
                        )}

                        {searchQuery.length < 2 && (
                            <div className="text-center py-8 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                                Type at least 2 characters to search
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
