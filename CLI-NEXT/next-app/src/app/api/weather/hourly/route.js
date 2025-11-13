import { NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const DEFAULT_COORDS = {
  lat: process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LAT || '19.0760',
  lon: process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LON || '72.8777',
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || DEFAULT_COORDS.lat;
    const lon = searchParams.get('lon') || DEFAULT_COORDS.lon;

    if (!OPENWEATHER_API_KEY) {
      return NextResponse.json(
        {
          error:
            'OpenWeatherMap API key missing. Set OPENWEATHER_API_KEY in your environment variables.',
        },
        { status: 500 }
      );
    }

    // Fetch 5-day forecast (3-hour intervals)
    const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);
    
    if (!forecastResponse.ok) {
      const errorData = await forecastResponse.json().catch(() => ({}));
      console.error('OpenWeather API error:', forecastResponse.status, errorData);
      throw new Error(`OpenWeather API error: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    // Format to 24-hour forecast
    // OpenWeather provides 3-hour intervals, so we use the first 8 forecasts (24 hours)
    const hourlyForecast = forecastData.list.slice(0, 8).map((item) => {
      const date = new Date(item.dt * 1000);
      const hours = date.getHours();
      const timeString = `${hours.toString().padStart(2, '0')}:00`;
      
      return {
        hour: timeString,
        temp: Math.round(item.main.temp),
        condition: item.weather[0].main,
        icon: getWeatherIcon(item.weather[0].icon),
        precipitation: Math.min(Math.round((item.rain?.['3h'] || item.snow?.['3h'] || 0) * 10), 100),
        windSpeed: Math.round(item.wind.speed * 3.6), // m/s to km/h
        humidity: item.main.humidity,
      };
    });

    return NextResponse.json(hourlyForecast);
  } catch (error) {
    console.error('Hourly forecast API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hourly forecast data' },
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
