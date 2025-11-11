// API Configuration
// Remove trailing slash from URL
const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clima-predict.onrender.com';
  return url.replace(/\/$/, ''); // Remove trailing slash
};

const API_BASE_URL = getBaseUrl();

export const apiConfig = {
  baseUrl: API_BASE_URL,
  forecastEndpoint: `${API_BASE_URL}/api/v1/forecast`,
  feedbackEndpoint: `${API_BASE_URL}/api/v1/feedback`,
  sensorEndpoint: `${API_BASE_URL}/api/v1/sensor`,
  syncEndpoint: `${API_BASE_URL}/api/v1/sync`,
  modelEndpoint: `${API_BASE_URL}/api/v1/model/latest`,
  claimEstimateEndpoint: `${API_BASE_URL}/api/v1/claim_estimate`,
  metricsEndpoint: `${API_BASE_URL}/api/v1/metrics`,
  healthEndpoint: `${API_BASE_URL}/health`,
};

