'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IoStatsChart,
  IoArrowBack,
  IoAdd,
  IoWater,
  IoRefresh,
  IoSunny,
  IoThermometer
} from 'react-icons/io5';

export default function Sensors() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await fetch('/api/sensors');
        const data = await res.json();
        setSensors(data);
      } catch (error) {
        console.error('Failed to fetch sensors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSensors();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Optimal': return '#00D09C';
      case 'Good': return '#4D9FFF';
      case 'High': return '#FFC857';
      default: return '#B0B0B0';
    }
  };

  const getSensorIcon = (iconStr) => {
    switch (iconStr) {
      case '💧': return IoWater;
      case '🌡️': return IoThermometer;
      case '☀️': return IoSunny;
      default: return IoStatsChart;
    }
  };

  return (
    <div className="min-h-screen text-white pb-10">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-0">
        {/* Header */}
        <header className="pt-8 pb-4 flex items-center justify-between gap-4 md:mb-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-90 transition-all hover:bg-white/10">
              <IoArrowBack size={20} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">Sensor Network</h1>
              <p className="hidden md:block text-white/40 text-sm font-medium uppercase tracking-widest mt-1">Real-time IoT nodes monitoring your region</p>
            </div>
          </div>
          <button className="p-4 bg-[#00D09C] text-[#0D0D0D] rounded-2xl shadow-lg shadow-[#00D09C]/20 active:scale-95 transition-all hover:bg-[#00D09C]/90">
            <IoAdd size={24} />
          </button>
        </header>

        {/* Status Banner */}
        <div className="mb-10">
          <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
              <div className="bg-white/20 backdrop-blur-md rounded-[2rem] p-6 shadow-xl">
                <IoRefresh size={56} className={`text-white ${loading ? 'animate-spin' : ''}`} />
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-2 leading-none">
                  {loading ? 'Scanning...' : `${sensors.length} Sensors Active`}
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/80 font-bold uppercase tracking-widest text-sm">
                  <span className={`w-2 h-2 bg-white rounded-full ${loading ? 'animate-ping' : 'animate-pulse'}`} />
                  {loading ? 'Synchronizing neural links' : 'All systems operational'}
                </div>
              </div>
              <div className="bg-white/10 px-8 py-4 rounded-3xl border border-white/20 font-black text-white uppercase tracking-widest text-sm">
                {loading ? 'Checking' : 'Healthy'}
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Cards Grid */}
        <div>
          <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-6 ml-1">Live Node Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white/5 rounded-[2.5rem] p-8 h-[250px] animate-pulse border border-white/5" />
              ))
            ) : sensors.length > 0 ? (
              sensors.map((sensor, index) => {
                const statusColor = getStatusColor(sensor.status);
                const Icon = getSensorIcon(sensor.icon);
                return (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-5">
                        <div
                          className="rounded-2xl p-4 bg-white/5 group-hover:bg-white/10 transition-colors"
                          style={{ color: statusColor }}
                        >
                          <Icon size={32} />
                        </div>
                        <div>
                          <div className="text-lg font-black text-white mb-0.5">
                            {sensor.name}
                          </div>
                          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            Updated {sensor.lastUpdated}
                          </div>
                        </div>
                      </div>
                      <div
                        className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/5"
                        style={{ backgroundColor: `${statusColor}22`, color: statusColor }}
                      >
                        {sensor.status}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-6">
                      <span
                        className="text-5xl font-black tracking-tighter"
                        style={{ color: statusColor }}
                      >
                        {sensor.value}
                      </span>
                      <span className="text-lg font-bold text-white/20 uppercase">{sensor.unit}</span>
                    </div>

                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min((sensor.value / (sensor.unit === '°C' ? 50 : 100)) * 100, 100)}%`,
                          backgroundColor: statusColor,
                          boxShadow: `0 0 15px ${statusColor}44`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <p className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">No active sensor nodes found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
