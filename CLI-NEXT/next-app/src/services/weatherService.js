// Weather Service - Fetches real data from Next.js API routes
const API_BASE = '/api/weather';

export const weatherService = {
  // Get current weather
  async getCurrentWeather(lat = '19.0760', lon = '72.8777', city = 'Mumbai') {
    try {
      const response = await fetch(`${API_BASE}/current?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`);
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
  async getForecast(lat = '19.0760', lon = '72.8777') {
    try {
      const response = await fetch(`${API_BASE}/forecast?lat=${lat}&lon=${lon}`);
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
  async getHourlyForecast(lat = '19.0760', lon = '72.8777') {
    try {
      const response = await fetch(`${API_BASE}/hourly?lat=${lat}&lon=${lon}`);
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

