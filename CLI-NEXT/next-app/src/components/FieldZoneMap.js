'use client';

import { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Settings } from 'iconoir-react';


/**
 * Field Zone Map Component
 * Interactive Leaflet.js map with zone visualization
 * Shows health-coded zones and allows zone selection
 * Responsive: Full height on desktop, compact on mobile
 */

export default function FieldZoneMap({ zones, selectedZone, onZoneSelect, zoneHealth, location }) {
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);

    useEffect(() => {
        // Dynamically import Leaflet (client-side only)
        if (typeof window !== 'undefined') {
            import('leaflet').then((L) => {
                import('leaflet/dist/leaflet.css');
                initializeMap(L);
            });
        }
    }, []);

    const initializeMap = (L) => {
        if (!mapRef.current || leafletMapRef.current) return;

        const map = L.map(mapRef.current).setView(
            [location?.lat || 28.6139, location?.lon || 77.2090],
            13
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add zone markers
        zones.forEach((zone, index) => {
            const baseLat = Number(location?.lat || 28.6139);
            const baseLon = Number(location?.lon || 77.2090);

            const lat = baseLat + (index * 0.01);
            const lon = baseLon + (index * 0.01);

            const healthColor = getZoneHealthColor(zone.id, selectedZone, zoneHealth);

            const marker = L.circleMarker([lat, lon], {
                radius: 15,
                fillColor: healthColor,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            }).addTo(map);

            marker.bindPopup(`
        <div style="font-family: sans-serif;">
          <strong>${zone.name}</strong><br/>
          Area: ${zone.area} ha<br/>
          Crop: ${zone.crop}
        </div>
      `);

            marker.on('click', () => {
                onZoneSelect(zone.id);
            });
        });

        leafletMapRef.current = map;
        setMapLoaded(true);
    };

    const getZoneHealthColor = (zoneId, selectedZone, zoneHealth) => {
        if (zoneId !== selectedZone || !zoneHealth) return '#808080';

        const score = zoneHealth.overallScore;
        if (score >= 85) return '#00D09C';
        if (score >= 70) return '#4D9FFF';
        if (score >= 50) return '#FFC857';
        if (score >= 30) return '#FF6B35';
        return '#FF3B30';
    };

    return (
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden relative group hover:border-white/10 transition-all">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#4D9FFF]/10 rounded-xl">
                            <MapIcon width={20} height={20} className="text-[#4D9FFF]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">Field Zones</h3>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                                Interactive Map View
                            </p>
                        </div>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl">
                        <Settings width={18} height={18} className="text-white/40" />
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div
                ref={mapRef}
                className="w-full h-[400px] md:h-[500px] bg-[#0D0D0D]"
                style={{ minHeight: '400px' }}
            />

            {/* Loading Overlay */}
            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D0D]/90 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#00D09C]/20 border-t-[#00D09C] rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm font-bold text-white/60">Loading map...</p>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white/40 uppercase tracking-wider">Health Legend:</span>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#00D09C]" />
                            <span className="text-white/60 font-medium">Excellent</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#4D9FFF]" />
                            <span className="text-white/60 font-medium">Good</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#FFC857]" />
                            <span className="text-white/60 font-medium">Moderate</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
                            <span className="text-white/60 font-medium">Poor</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
