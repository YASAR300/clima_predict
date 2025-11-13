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
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
    }
  },
};

export default weatherService;

