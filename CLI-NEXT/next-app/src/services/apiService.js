import { apiConfig } from '@/config/apiConfig';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Call Error:', error);
    return { success: false, error: error.message };
  }
};

// API Service Methods
export const apiService = {
  // Health Check
  async checkHealth() {
    return apiCall(apiConfig.healthEndpoint);
  },

  // Forecast - requires lat, lon, village
  async getForecast({ lat, lon, village }) {
    if (!lat || !lon || !village) {
      return { success: false, error: 'Missing required parameters: lat, lon, village' };
    }
    const endpoint = `${apiConfig.forecastEndpoint}?lat=${lat}&lon=${lon}&village=${encodeURIComponent(village)}`;
    return apiCall(endpoint);
  },

  // Sensors - POST only for adding readings
  // Backend doesn't have GET endpoint, so we use static data or sync endpoint
  async addSensorReading(reading) {
    const requiredFields = ['sensor_id', 'village', 'timestamp', 'type', 'value', 'units'];
    const missingFields = requiredFields.filter(field => !reading[field]);
    
    if (missingFields.length > 0) {
      return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` };
    }

    return apiCall(apiConfig.sensorEndpoint, {
      method: 'POST',
      body: JSON.stringify(reading),
    });
  },

  // Feedback
  async submitFeedback(feedback) {
    return apiCall(apiConfig.feedbackEndpoint, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },

  // Sync
  async syncData(data) {
    return apiCall(apiConfig.syncEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Model
  async getLatestModel() {
    return apiCall(apiConfig.modelEndpoint);
  },

  // Insurance/Claim Estimate
  async getClaimEstimate(data) {
    return apiCall(apiConfig.claimEstimateEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Metrics
  async getMetrics() {
    return apiCall(apiConfig.metricsEndpoint);
  },
};

export default apiService;

