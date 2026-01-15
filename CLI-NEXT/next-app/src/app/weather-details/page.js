'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { weatherService } from '@/services/weatherService';
import { useActiveLocation } from '@/hooks/useActiveLocation';
import {
  Cloud,
  Droplet,
  Wind,
  Eye,
  Map,
  NavArrowRight
} from 'iconoir-react';

export default function WeatherDetails() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { activeLocation } = useActiveLocation();

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      const result = await weatherService.getCurrentWeather(activeLocation);
      if (result.success) {
        setWeatherData(result.data);
      }
      setLoading(false);
    };

    fetchWeather();
  }, [activeLocation]);

  if (loading || !weatherData) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-bounce">
            <Cloud width={56} height={56} className="text-[#00D09C]" />
          </div>
          <div className="text-lg font-semibold text-white/50">Analyzing details...</div>
        </div>
      </div>
    );
  }

  const detailCards = [
    { label: 'Feels Like', value: `${weatherData.feelsLike}°`, icon: Droplet, color: '#FF6B35' },
    { label: 'Humidity', value: `${weatherData.humidity}%`, icon: Droplet, color: '#4D9FFF' },
    { label: 'Wind Speed', value: `${weatherData.windSpeed}`, unit: 'km/h', icon: Wind, color: '#00D09C' },
    { label: 'Visibility', value: `${weatherData.visibility}`, unit: 'km', icon: Eye, color: '#9D4EDD' },
    { label: 'Pressure', value: `${weatherData.pressure}`, unit: 'hPa', icon: Map, color: '#FFC857' },
    { label: 'Dew Point', value: `${weatherData.dewPoint}°`, icon: Droplet, color: '#00D09C' },
  ];

  return (
    <div className="min-h-screen text-white pb-10">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-0">
        {/* Header */}
        <header className="pt-8 pb-4 flex items-center gap-4 md:mb-8">
          <Link href="/" className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-90 transition-all hover:bg-white/10">
            <NavArrowRight className="rotate-180" width={20} height={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">Weather Deep-Dive</h1>
            <p className="hidden md:block text-white/40 text-sm font-medium uppercase tracking-widest mt-1">Detailed atmospheric parameters for {activeLocation.label}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Hero Card - Left on Desktop */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00D09C]/5 rounded-full blur-[80px]" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-8xl md:text-9xl mb-6 drop-shadow-2xl animate-float">{weatherData.icon}</div>
                <div className="text-7xl md:text-8xl font-black mb-2 tracking-tighter">{weatherData.temperature}°</div>
                <div className="text-xl md:text-2xl font-bold text-[#00D09C] uppercase tracking-[0.3em] mb-4">{weatherData.condition}</div>
                <p className="text-sm md:text-base text-white/40 text-center font-medium leading-relaxed uppercase tracking-widest max-w-[200px]">{weatherData.description}</p>
              </div>
            </div>
          </div>

          {/* Right Section on Desktop */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Detailed Stats Grid */}
            <div>
              <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-6 ml-1">Condition Parameters</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {detailCards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/5 group hover:bg-white/10 hover:border-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors" style={{ color: card.color }}>
                        <card.icon width={20} height={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{card.label}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black whitespace-nowrap text-white">{card.value}</span>
                      {card.unit && <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{card.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AQI Integration */}
            {weatherData.airQuality && (
              <div className="bg-white/5 rounded-[2.5rem] p-8 md:p-10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.07] transition-all">
                <div className="flex items-center gap-6">
                  <div className="p-6 bg-[#FFC857]/10 rounded-[2rem] border border-[#FFC857]/20 flex-shrink-0">
                    <Wind width={40} height={40} className="text-[#FFC857]" />
                  </div>
                  <div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#FFC857]">Atmospheric Quality Level</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <div className="text-5xl md:text-6xl font-black">{weatherData.airQuality.aqi * 20}</div>
                      <span className="text-sm font-bold text-white/30 uppercase">AQI</span>
                    </div>
                    <div className="text-sm md:text-base font-bold text-white/60 uppercase mt-1 tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FFC857] animate-pulse" />
                      {weatherData.airQuality.category}
                    </div>
                  </div>
                </div>

                <div className="hidden md:block w-px h-16 bg-white/10" />

                <div className="flex-1">
                  <p className="text-sm md:text-base text-white/40 italic font-medium leading-relaxed">
                    "The current air quality is {weatherData.airQuality.category.toLowerCase()}. Ideal for most outdoor agricultural activities with minimal health risks."
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
