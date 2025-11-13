'use client';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function handleResponse(response) {
  const contentType = response.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      body?.error ||
      body?.message ||
      (typeof body === 'string' ? body : 'Unknown error');
    throw new Error(message);
  }

  return body;
}

export const integrationService = {
  async getOpenWeatherComparison({ lat, lon }) {
    const url = `/api/integrations/openweather/compare?lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  async getNasaClimateData({ lat, lon, start, end, parameters = [] }) {
    const url = new URL('/api/integrations/nasa', window.location.origin);
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lon);
    if (start) url.searchParams.set('start', start);
    if (end) url.searchParams.set('end', end);
    parameters.forEach((param) => url.searchParams.append('parameter', param));
    const response = await fetch(url.toString());
    return handleResponse(response);
  },

  async searchPlaces({ query, lat, lon, radius }) {
    const url = new URL('/api/integrations/osm/search', window.location.origin);
    url.searchParams.set('query', query);
    if (lat && lon) {
      url.searchParams.set('lat', lat);
      url.searchParams.set('lon', lon);
    }
    if (radius) url.searchParams.set('radius', radius);
    const response = await fetch(url.toString());
    return handleResponse(response);
  },

  async getRealtimeAqi({ city, lat, lon }) {
    const url = new URL('/api/integrations/aqi', window.location.origin);
    if (city) {
      url.searchParams.set('city', city);
    } else {
      url.searchParams.set('lat', lat);
      url.searchParams.set('lon', lon);
    }
    const response = await fetch(url.toString());
    return handleResponse(response);
  },

  async getTomorrowForecast({ lat, lon, timesteps = [] }) {
    const url = new URL('/api/integrations/tomorrow', window.location.origin);
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lon);
    timesteps.forEach((step) => url.searchParams.append('timestep', step));
    const response = await fetch(url.toString());
    return handleResponse(response);
  },

  async getMeteostatHistory({ lat, lon, start, end }) {
    const url = new URL('/api/integrations/meteostat', window.location.origin);
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lon);
    if (start) url.searchParams.set('start', start);
    if (end) url.searchParams.set('end', end);
    const response = await fetch(url.toString());
    return handleResponse(response);
  },

  async createCarbonEstimate(payload) {
    const response = await fetch('/api/integrations/climatiq', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  async askAiAdvisor({ prompt, context, provider }) {
    const response = await fetch('/api/integrations/ai-advisor', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ prompt, context, provider }),
    });
    return handleResponse(response);
  },

  async sendWebhook({ message, title, target, metadata }) {
    const response = await fetch('/api/integrations/webhooks', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ message, title, target, metadata }),
    });
    return handleResponse(response);
  },
};

export default integrationService;


