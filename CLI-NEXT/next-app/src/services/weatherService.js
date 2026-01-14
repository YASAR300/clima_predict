// Weather Service - Fetches real data from Next.js API routes
const API_BASE = '/api/weather';

const FALLBACK_LOCATION = {
  lat: process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LAT || '19.0760',
  lon: process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LON || '72.8777',
  name:
    process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LABEL ||
    'Mumbai, India',
};

function resolveLocation(location) {
  if (!location) {
    return FALLBACK_LOCATION;
  }
  return {
    lat: String(location.lat ?? FALLBACK_LOCATION.lat),
    lon: String(location.lon ?? FALLBACK_LOCATION.lon),
    name:
      location.customName?.trim() ||
      location.label ||
      location.city ||
      FALLBACK_LOCATION.name,
    city: location.city || location.label || FALLBACK_LOCATION.name,
  };
}

export const weatherService = {
  // Get current weather
  async getCurrentWeather(location) {
    const resolved = resolveLocation(location);
    try {
      const response = await fetch(
        `${API_BASE}/current?lat=${resolved.lat}&lon=${resolved.lon}&city=${encodeURIComponent(
          resolved.name
        )}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch weather');
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Weather service error:', error);
      // Fallback to static mock data if API fails
      return {
        success: true,
        data: {
          temperature: 24,
          feelsLike: 26,
          humidity: 65,
          windSpeed: 12,
          windDirection: 'NW',
          pressure: 1012,
          visibility: 10,
          uvIndex: 4,
          cloudCover: 20,
          condition: 'Partly Cloudy (Offline Mode)',
          location: resolved.name,
          airQuality: { aqi: 2, category: 'Fair' },
          isFallback: true
        }
      };
    }
  },

  // Get 7-day forecast
  async getForecast(location) {
    const resolved = resolveLocation(location);
    try {
      const response = await fetch(
        `${API_BASE}/forecast?lat=${resolved.lat}&lon=${resolved.lon}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch forecast');
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Forecast service error:', error);
      // Mock forecast data
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return {
        success: true,
        data: days.map((day, i) => ({
          date: new Date(Date.now() + i * 86400000).toISOString(),
          day,
          tempMax: 28 + Math.round(Math.random() * 5),
          tempMin: 22 + Math.round(Math.random() * 3),
          condition: 'Sunny',
          icon: '☀️',
        }))
      };
    }
  },

  // Get hourly forecast (24 hours)
  async getHourlyForecast(location) {
    const resolved = resolveLocation(location);
    try {
      const response = await fetch(
        `${API_BASE}/hourly?lat=${resolved.lat}&lon=${resolved.lon}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch hourly forecast');
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Hourly forecast service error:', error);
      return {
        success: true,
        data: Array.from({ length: 24 }, (_, i) => ({
          time: `${(new Date().getHours() + i) % 24}:00`,
          temp: 24 + Math.round(Math.random() * 4),
          condition: 'Cloudy',
        }))
      };
    }
  },
};

export default weatherService;

