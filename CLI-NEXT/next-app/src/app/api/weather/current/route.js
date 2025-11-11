import { NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '0248b76a1e11603cd1afcb3d2a90e830';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || '19.0760';
    const lon = searchParams.get('lon') || '72.8777';
    const city = searchParams.get('city') || 'Mumbai';

    // Fetch current weather
    const weatherUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json().catch(() => ({}));
      console.error('OpenWeather API error:', weatherResponse.status, errorData);
      throw new Error(`OpenWeather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    // Fetch air quality
    let airQuality = null;
    try {
      const aqiUrl = `${OPENWEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
      const aqiResponse = await fetch(aqiUrl);
      if (aqiResponse.ok) {
        const aqiData = await aqiResponse.json();
        airQuality = {
          aqi: aqiData.list[0]?.main?.aqi || 1,
          pm25: aqiData.list[0]?.components?.pm2_5 || 0,
          pm10: aqiData.list[0]?.components?.pm10 || 0,
          category: getAQICategory(aqiData.list[0]?.main?.aqi || 1),
        };
      }
    } catch (error) {
      console.error('Air quality fetch error:', error);
    }

    // Format response
    const formattedData = {
      temperature: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 3.6), // m/s to km/h
      windDirection: getWindDirection(weatherData.wind.deg),
      pressure: weatherData.main.pressure,
      visibility: (weatherData.visibility || 10000) / 1000, // meters to km
      uvIndex: 0, // OpenWeather free tier doesn't include UV
      cloudCover: weatherData.clouds.all,
      dewPoint: calculateDewPoint(weatherData.main.temp, weatherData.main.humidity),
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      icon: getWeatherIcon(weatherData.weather[0].icon),
      location: weatherData.name || city,
      country: weatherData.sys?.country || 'IN',
      lastUpdated: new Date().toISOString(),
      airQuality,
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

function getWeatherIcon(iconCode) {
  const iconMap = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌦️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️',
  };
  return iconMap[iconCode] || '⛅';
}

function getWindDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(deg / 22.5) % 16];
}

function calculateDewPoint(temp, humidity) {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100.0);
  return Math.round((b * alpha) / (a - alpha) * 10) / 10;
}

function getAQICategory(aqi) {
  const categories = {
    1: 'Good',
    2: 'Fair',
    3: 'Moderate',
    4: 'Poor',
    5: 'Very Poor',
  };
  return categories[aqi] || 'Moderate';
}

