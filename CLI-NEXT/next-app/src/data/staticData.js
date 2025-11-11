// Comprehensive static data for the app

export const currentWeather = {
  temperature: 28.5,
  feelsLike: 31.2,
  humidity: 65,
  windSpeed: 12.5,
  windDirection: 'NE',
  pressure: 1013,
  visibility: 10,
  uvIndex: 7,
  cloudCover: 45,
  dewPoint: 21.3,
  condition: 'Partly Cloudy',
  icon: '⛅',
  location: 'Mumbai, Maharashtra',
  lastUpdated: '2 mins ago',
};

export const weeklyForecast = [
  {
    day: 'Monday',
    date: 'Nov 8',
    tempMax: 32,
    tempMin: 24,
    condition: 'Sunny',
    icon: '☀️',
    precipitation: 10,
    humidity: 60,
    windSpeed: 15,
  },
  {
    day: 'Tuesday',
    date: 'Nov 9',
    tempMax: 30,
    tempMin: 23,
    condition: 'Partly Cloudy',
    icon: '⛅',
    precipitation: 20,
    humidity: 65,
    windSpeed: 12,
  },
  {
    day: 'Wednesday',
    date: 'Nov 10',
    tempMax: 29,
    tempMin: 22,
    condition: 'Rainy',
    icon: '🌧️',
    precipitation: 80,
    humidity: 85,
    windSpeed: 18,
  },
  {
    day: 'Thursday',
    date: 'Nov 11',
    tempMax: 31,
    tempMin: 24,
    condition: 'Thunderstorm',
    icon: '⛈️',
    precipitation: 90,
    humidity: 80,
    windSpeed: 25,
  },
  {
    day: 'Friday',
    date: 'Nov 12',
    tempMax: 33,
    tempMin: 25,
    condition: 'Sunny',
    icon: '☀️',
    precipitation: 5,
    humidity: 55,
    windSpeed: 10,
  },
  {
    day: 'Saturday',
    date: 'Nov 13',
    tempMax: 34,
    tempMin: 26,
    condition: 'Hot',
    icon: '🔥',
    precipitation: 0,
    humidity: 50,
    windSpeed: 8,
  },
  {
    day: 'Sunday',
    date: 'Nov 14',
    tempMax: 31,
    tempMin: 24,
    condition: 'Cloudy',
    icon: '☁️',
    precipitation: 30,
    humidity: 70,
    windSpeed: 14,
  },
];

export const getHourlyForecast = () => {
  const hours = [];
  const baseTemp = 25;
  for (let i = 0; i < 24; i++) {
    hours.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      temp: baseTemp + (i % 12) - 3,
      condition: i % 3 === 0 ? 'Sunny' : i % 3 === 1 ? 'Cloudy' : 'Rainy',
      icon: i % 3 === 0 ? '☀️' : i % 3 === 1 ? '☁️' : '🌧️',
      precipitation: (i % 4) * 20,
      windSpeed: 10 + (i % 5),
    });
  }
  return hours;
};

export const airQuality = {
  aqi: 85,
  category: 'Moderate',
  pm25: 45,
  pm10: 78,
  o3: 32,
  no2: 28,
  so2: 12,
  co: 0.8,
  recommendation: 'Sensitive groups should limit outdoor activities',
};

export const weatherAlerts = [
  {
    type: 'Heavy Rain',
    severity: 'Warning',
    title: 'Heavy Rainfall Expected',
    description: 'Heavy rainfall expected in the next 24 hours. Possible flooding in low-lying areas.',
    startTime: '2025-11-08 14:00',
    endTime: '2025-11-09 06:00',
    icon: '🌧️',
    color: '#FF6B35',
  },
  {
    type: 'Thunderstorm',
    severity: 'Advisory',
    title: 'Thunderstorm Alert',
    description: 'Thunderstorms likely on Thursday evening. Stay indoors during peak hours.',
    startTime: '2025-11-11 16:00',
    endTime: '2025-11-11 22:00',
    icon: '⛈️',
    color: '#9D4EDD',
  },
  {
    type: 'Heat Wave',
    severity: 'Watch',
    title: 'High Temperature Alert',
    description: 'Temperatures may reach 38°C this weekend. Stay hydrated and avoid direct sun exposure.',
    startTime: '2025-11-13 10:00',
    endTime: '2025-11-13 18:00',
    icon: '🔥',
    color: '#FFC857',
  },
];

export const farmingRecommendations = [
  {
    title: 'Irrigation Schedule',
    description: 'Water your crops early morning (5-7 AM) to minimize evaporation',
    icon: '💧',
    priority: 'High',
    category: 'Watering',
  },
  {
    title: 'Pest Control',
    description: 'Apply organic pesticides before the rain on Wednesday',
    icon: '🐛',
    priority: 'Medium',
    category: 'Protection',
  },
  {
    title: 'Fertilizer Application',
    description: "Best time to apply nitrogen fertilizer is after Thursday's rain",
    icon: '🌱',
    priority: 'High',
    category: 'Nutrition',
  },
  {
    title: 'Harvesting Window',
    description: 'Ideal harvesting conditions on Friday and Saturday',
    icon: '🌾',
    priority: 'Medium',
    category: 'Harvesting',
  },
  {
    title: 'Soil Preparation',
    description: "Good time for tilling after Wednesday's rainfall",
    icon: '🚜',
    priority: 'Low',
    category: 'Soil',
  },
];

export const cropHealth = [
  {
    crop: 'Rice',
    health: 85,
    status: 'Healthy',
    area: '5.2 acres',
    stage: 'Flowering',
    expectedYield: '4.5 tons',
    issues: [],
  },
  {
    crop: 'Wheat',
    health: 72,
    status: 'Fair',
    area: '3.8 acres',
    stage: 'Vegetative',
    expectedYield: '3.2 tons',
    issues: ['Mild pest infestation', 'Low nitrogen'],
  },
  {
    crop: 'Cotton',
    health: 90,
    status: 'Excellent',
    area: '4.5 acres',
    stage: 'Boll Formation',
    expectedYield: '2.8 tons',
    issues: [],
  },
  {
    crop: 'Sugarcane',
    health: 65,
    status: 'Needs Attention',
    area: '6.0 acres',
    stage: 'Tillering',
    expectedYield: '45 tons',
    issues: ['Water stress', 'Nutrient deficiency'],
  },
];

export const weatherStats = {
  avgTemp: 27.5,
  maxTemp: 38.2,
  minTemp: 18.5,
  totalRainfall: 245,
  rainyDays: 45,
  sunnyDays: 180,
  cloudyDays: 140,
  avgHumidity: 68,
  avgWindSpeed: 12.5,
};

export const sensorData = [
  {
    name: 'Soil Moisture',
    value: 65,
    unit: '%',
    status: 'Optimal',
    icon: '💧',
    lastUpdated: '5 mins ago',
  },
  {
    name: 'Soil Temperature',
    value: 24,
    unit: '°C',
    status: 'Good',
    icon: '🌡️',
    lastUpdated: '5 mins ago',
  },
  {
    name: 'Soil pH',
    value: 6.8,
    unit: 'pH',
    status: 'Neutral',
    icon: '⚗️',
    lastUpdated: '1 hour ago',
  },
  {
    name: 'Light Intensity',
    value: 85000,
    unit: 'lux',
    status: 'High',
    icon: '☀️',
    lastUpdated: '2 mins ago',
  },
];

export const insuranceData = {
  policyNumber: 'CLI-2024-789456',
  coverageAmount: 500000,
  premium: 12500,
  status: 'Active',
  expiryDate: '2025-12-31',
  claimsHistory: [
    {
      date: '2024-08-15',
      type: 'Crop Damage',
      amount: 45000,
      status: 'Approved',
    },
    {
      date: '2024-06-20',
      type: 'Flood Damage',
      amount: 32000,
      status: 'Settled',
    },
  ],
  riskScore: 35,
  riskCategory: 'Low',
};

export const marketPrices = [
  {
    crop: 'Rice',
    price: 2850,
    unit: 'per quintal',
    change: '+5.2%',
    trend: 'up',
  },
  {
    crop: 'Wheat',
    price: 2450,
    unit: 'per quintal',
    change: '-2.1%',
    trend: 'down',
  },
  {
    crop: 'Cotton',
    price: 8500,
    unit: 'per quintal',
    change: '+8.5%',
    trend: 'up',
  },
  {
    crop: 'Sugarcane',
    price: 350,
    unit: 'per quintal',
    change: '+1.2%',
    trend: 'up',
  },
];

export const communityPosts = [
  {
    author: 'Rajesh Kumar',
    location: 'Nashik',
    time: '2 hours ago',
    content: 'Heavy rainfall expected tomorrow. Make sure to cover your crops!',
    likes: 45,
    comments: 12,
    avatar: '👨‍🌾',
  },
  {
    author: 'Priya Sharma',
    location: 'Pune',
    time: '5 hours ago',
    content: 'Best fertilizer application time is after the rain. Got great results last season.',
    likes: 78,
    comments: 23,
    avatar: '👩‍🌾',
  },
  {
    author: 'Amit Patel',
    location: 'Mumbai',
    time: '1 day ago',
    content: 'Organic pest control methods working well. Happy to share tips!',
    likes: 156,
    comments: 45,
    avatar: '👨‍🌾',
  },
];

export const weatherTips = [
  {
    title: 'Monsoon Preparation',
    description: 'Ensure proper drainage systems are in place before heavy rains',
    icon: '🌧️',
    category: 'Seasonal',
  },
  {
    title: 'Heat Protection',
    description: 'Use mulching to protect soil from extreme heat',
    icon: '🔥',
    category: 'Protection',
  },
  {
    title: 'Frost Warning',
    description: 'Cover sensitive crops when temperature drops below 5°C',
    icon: '❄️',
    category: 'Protection',
  },
  {
    title: 'Wind Damage Prevention',
    description: 'Install windbreaks for crops vulnerable to strong winds',
    icon: '💨',
    category: 'Protection',
  },
];

export const achievements = [
  {
    title: 'Weather Watcher',
    description: 'Checked weather 30 days in a row',
    icon: '🏆',
    unlocked: true,
    date: '2024-10-15',
  },
  {
    title: 'Data Collector',
    description: 'Recorded 100 sensor readings',
    icon: '📊',
    unlocked: true,
    date: '2024-09-20',
  },
  {
    title: 'Community Helper',
    description: 'Helped 50 farmers with tips',
    icon: '🤝',
    unlocked: false,
    progress: 35,
  },
  {
    title: 'Forecast Master',
    description: 'Accurate predictions for 90 days',
    icon: '🎯',
    unlocked: false,
    progress: 67,
  },
];

export const newsUpdates = [
  {
    title: 'New Weather Satellite Launched',
    description: 'Enhanced accuracy for regional forecasts',
    time: '3 hours ago',
    category: 'Technology',
    image: '🛰️',
  },
  {
    title: 'Government Announces Crop Insurance Scheme',
    description: 'Better coverage for farmers affected by climate change',
    time: '1 day ago',
    category: 'Policy',
    image: '📋',
  },
  {
    title: 'Climate Change Impact Study Released',
    description: 'New research on monsoon patterns in India',
    time: '2 days ago',
    category: 'Research',
    image: '📚',
  },
];

