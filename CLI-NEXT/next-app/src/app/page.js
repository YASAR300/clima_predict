'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNavigation from '@/components/BottomNavigation';
import { weatherAlerts } from '@/data/staticData';
import { apiService } from '@/services/apiService';
import { weatherService } from '@/services/weatherService';
import { 
  Pin, 
  Bell, 
  Settings, 
  Cloud, 
  WarningTriangle, 
  Droplet, 
  Wind, 
  Eye, 
  Map, 
  Network, 
  EvPlug, 
  Rain,
  Thunderstorm,
  FireFlame,
  NavArrowRight
} from 'iconoir-react';

export default function Home() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [airQuality, setAirQuality] = useState(null);

  useEffect(() => {
    // Check API health and fetch weather data
    const initializeData = async () => {
      setLoading(true);
      
      // Check backend API health
      const health = await apiService.checkHealth();
      setApiStatus(health.success ? 'connected' : 'disconnected');
      
      // Fetch real weather data
      const weather = await weatherService.getCurrentWeather();
      if (weather.success) {
        setWeatherData(weather.data);
        if (weather.data.airQuality) {
          setAirQuality({
            aqi: weather.data.airQuality.aqi * 20, // Convert 1-5 to 0-100 scale
            category: weather.data.airQuality.category,
            pm25: weather.data.airQuality.pm25,
            pm10: weather.data.airQuality.pm10,
            recommendation: getAQIRecommendation(weather.data.airQuality.aqi),
          });
        }
      }
      
      setLoading(false);
    };

    initializeData();
    
    // Refresh every 10 minutes
    const interval = setInterval(initializeData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getAQIRecommendation = (aqi) => {
    const recommendations = {
      1: 'Air quality is good. Enjoy outdoor activities.',
      2: 'Air quality is acceptable for most people.',
      3: 'Sensitive groups should limit outdoor activities',
      4: 'Everyone should limit outdoor activities',
      5: 'Avoid outdoor activities if possible',
    };
    return recommendations[aqi] || 'Check air quality before going outside';
  };

  const getAlertIcon = (icon) => {
    const iconMap = {
      '🌧️': Rain,
      '⛈️': Thunderstorm,
      '🔥': FireFlame,
      '⚠️': WarningTriangle,
    };
    const IconComponent = iconMap[icon] || WarningTriangle;
    return IconComponent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-pulse flex justify-center">
            <Cloud width={48} height={48} className="text-[#00D09C]" />
          </div>
          <div className="text-lg text-[#B0B0B0]">Loading weather data...</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white pb-20">
        <div className="max-w-md mx-auto px-5 pt-5">
          <div className="text-center py-10">
            <div className="mb-4 flex justify-center">
              <WarningTriangle width={48} height={48} className="text-[#FF6B35]" />
            </div>
            <div className="text-lg text-[#B0B0B0] mb-2">Unable to load weather data</div>
            <div className="text-sm text-[#707070] mb-4">Please check your internet connection</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#00D09C] text-[#0D0D0D] px-4 py-2 rounded-xl font-semibold select-none"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Retry
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white pb-20 overflow-x-hidden">
      <div className="w-full max-w-md mx-auto min-h-screen">
      {/* Header */}
        <header className="w-full px-5 pt-3 pb-3">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Pin width={16} height={16} className="text-[#00D09C] flex-shrink-0" />
              <span className="text-base font-medium text-white truncate">{weatherData.location}</span>
              {apiStatus === 'connected' && (
                <span className="text-xs bg-[#00D09C]/20 text-[#00D09C] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-1">Live</span>
              )}
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href="/alerts" className="p-1.5 select-none" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                <Bell width={20} height={20} className="text-white" />
              </Link>
              <Link href="/settings" className="p-1.5 select-none" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                <Settings width={20} height={20} className="text-white" />
              </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
        <main className="w-full px-5 overflow-x-hidden">
          {/* Current Weather Card */}
          <div className="mb-5 w-full">
            <Link href="/weather-details" className="block w-full select-none" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
              <div className="bg-gradient-to-br from-[#00D09C] to-[#4D9FFF] rounded-3xl p-6 shadow-[0_0_20px_rgba(0,208,156,0.3)] w-full overflow-hidden">
                <div className="text-center w-full">
                  <div className="text-7xl font-bold text-white mb-1 leading-none">
                {weatherData.temperature}°
              </div>
                  <div className="text-2xl text-white mb-1 font-medium truncate">{weatherData.condition}</div>
                  <div className="text-base text-white/90 mb-5">
                Feels like {weatherData.feelsLike}°
              </div>
                  <div className="flex justify-around pt-4 border-t border-white/20 w-full">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Droplet width={28} height={28} className="text-white mb-1.5" />
                      <span className="text-base font-semibold text-white">{weatherData.humidity}%</span>
                      <span className="text-xs text-white/80">Humidity</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Wind width={28} height={28} className="text-white mb-1.5" />
                      <span className="text-base font-semibold text-white">{weatherData.windSpeed} km/h</span>
                      <span className="text-xs text-white/80">Wind</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Eye width={28} height={28} className="text-white mb-1.5" />
                      <span className="text-base font-semibold text-white">{weatherData.visibility} km</span>
                      <span className="text-xs text-white/80">Visibility</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
                    </div>

          {/* Quick Actions */}
          <div className="mb-5 w-full">
            <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Link href="/weather-map" className="bg-[#252525] rounded-2xl p-4 border border-[#4D9FFF]/30 active:scale-[0.98] transition-transform w-full overflow-hidden select-none" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                <div className="bg-[#4D9FFF]/20 rounded-xl p-3 w-fit mb-2.5">
                  <Map width={32} height={32} className="text-[#4D9FFF]" />
                    </div>
                <div className="text-base font-medium text-white truncate">Weather Map</div>
              </Link>
              <Link href="/sensors" className="bg-[#252525] rounded-2xl p-4 border border-[#9D4EDD]/30 active:scale-[0.98] transition-transform w-full overflow-hidden select-none" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                <div className="bg-[#9D4EDD]/20 rounded-xl p-3 w-fit mb-2.5">
                  <Network width={32} height={32} className="text-[#9D4EDD]" />
                  </div>
                <div className="text-base font-medium text-white truncate">Sensors</div>
              </Link>
              <Link href="/alerts" className="bg-[#252525] rounded-2xl p-4 border border-[#FF6B35]/30 active:scale-[0.98] transition-transform w-full overflow-hidden select-none" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                <div className="bg-[#FF6B35]/20 rounded-xl p-3 w-fit mb-2.5">
                  <WarningTriangle width={32} height={32} className="text-[#FF6B35]" />
                </div>
                <div className="text-base font-medium text-white truncate">Alerts</div>
              </Link>
              <Link href="/backend-test" className="bg-[#252525] rounded-2xl p-4 border border-[#FFC857]/30 active:scale-[0.98] transition-transform w-full overflow-hidden select-none" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                <div className="bg-[#FFC857]/20 rounded-xl p-3 w-fit mb-2.5">
                  <EvPlug width={32} height={32} className="text-[#FFC857]" />
              </div>
                <div className="text-base font-medium text-white truncate">Backend Test</div>
              </Link>
            </div>
          </div>

          {/* Weather Alerts */}
        {weatherAlerts.length > 0 && (
            <div className="mb-5 w-full">
              <h2 className="text-lg font-semibold text-white mb-3">Active Alerts</h2>
              <div className="space-y-3 w-full">
                {weatherAlerts.slice(0, 2).map((alert, index) => (
                  <Link key={index} href="/alerts" className="block w-full active:scale-[0.98] transition-transform select-none" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                    <div className="bg-[#252525] rounded-2xl p-4 border w-full overflow-hidden" style={{ borderColor: `${alert.color}4D` }}>
                      <div className="flex items-start gap-3 w-full">
                        <div className="bg-opacity-20 rounded-xl p-2.5 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${alert.color}33` }}>
                          {(() => {
                            const IconComponent = getAlertIcon(alert.icon);
                            return <IconComponent width={24} height={24} style={{ color: alert.color }} />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="text-base font-medium text-white mb-1 truncate">{alert.title}</div>
                          <div className="text-sm text-[#B0B0B0] line-clamp-2 leading-relaxed break-words">{alert.description}</div>
                        </div>
                        <NavArrowRight width={20} height={20} className="text-[#707070] flex-shrink-0 mt-1" />
            </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Air Quality */}
          {airQuality && (
            <div className="mb-24 w-full">
              <h2 className="text-lg font-semibold text-white mb-3">Air Quality</h2>
              <div className="bg-[#252525] rounded-2xl p-5 w-full overflow-hidden">
                <div className="flex justify-between items-start mb-3 w-full">
                    <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#B0B0B0] mb-1">AQI</div>
                    <div className="text-5xl font-bold text-[#FFC857] mb-1 leading-none">{airQuality.aqi}</div>
                    <div className="text-sm text-[#B0B0B0] font-medium truncate">{airQuality.category}</div>
                    </div>
                  <div className="bg-[#FFC857]/20 rounded-full p-3 flex-shrink-0 ml-3">
                    <Wind width={40} height={40} className="text-[#FFC857]" />
                  </div>
                </div>
                <div className="text-sm text-[#B0B0B0] leading-relaxed break-words">{airQuality.recommendation}</div>
              </div>
              </div>
          )}
        </main>
          </div>

      <BottomNavigation />
    </div>
  );
}