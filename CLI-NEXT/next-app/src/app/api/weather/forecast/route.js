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

    // Group forecasts by day
    const dailyForecasts = {};
    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      // Use YYYY-MM-DD format for consistent grouping
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = {
          date: dateKey,
          temps: [],
          conditions: [],
          precipitation: [],
          humidity: [],
          windSpeed: [],
          icons: [],
          timestamps: [],
        };
      }

      dailyForecasts[dateKey].temps.push(item.main.temp);
      dailyForecasts[dateKey].conditions.push(item.weather[0].main);
      dailyForecasts[dateKey].precipitation.push(item.rain?.['3h'] || item.snow?.['3h'] || 0);
      dailyForecasts[dateKey].humidity.push(item.main.humidity);
      dailyForecasts[dateKey].windSpeed.push(item.wind.speed * 3.6); // m/s to km/h
      dailyForecasts[dateKey].icons.push(getWeatherIcon(item.weather[0].icon));
      dailyForecasts[dateKey].timestamps.push(date);
    });

    // Format to 7-day forecast
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const sortedDays = Object.keys(dailyForecasts).sort();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formattedForecast = sortedDays.slice(0, 7).map((dateKey, index) => {
      const day = dailyForecasts[dateKey];
      const date = new Date(dateKey + 'T00:00:00');
      const isToday = dateKey === today.toISOString().split('T')[0];
      
      // Calculate precipitation probability (based on total precipitation)
      const totalPrecip = day.precipitation.reduce((a, b) => a + b, 0);
      const hasPrecip = day.precipitation.some(p => p > 0);
      const precipProbability = hasPrecip ? Math.min(Math.round((totalPrecip / 5) * 100), 100) : 0;
      
      // Get most common condition and icon for the day
      const conditionCounts = {};
      day.conditions.forEach(c => conditionCounts[c] = (conditionCounts[c] || 0) + 1);
      const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) => 
        conditionCounts[a] > conditionCounts[b] ? a : b
      );
      const conditionIndex = day.conditions.indexOf(mostCommonCondition);
      const dayIcon = day.icons[conditionIndex] || day.icons[Math.floor(day.icons.length / 2)];
      
      return {
        day: isToday ? 'Today' : dayNames[date.getDay()],
        date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
        tempMax: Math.round(Math.max(...day.temps)),
        tempMin: Math.round(Math.min(...day.temps)),
        condition: mostCommonCondition,
        icon: dayIcon,
        precipitation: precipProbability,
        humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
        windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length),
      };
    });

    // Ensure we have exactly 7 days
    const currentLength = formattedForecast.length;
    if (currentLength < 7) {
      const lastDay = formattedForecast[currentLength - 1];
      for (let i = currentLength; i < 7; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(nextDate.getDate() + i);
        const isNextToday = nextDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
        
        formattedForecast.push({
          day: isNextToday ? 'Today' : dayNames[nextDate.getDay()],
          date: `${monthNames[nextDate.getMonth()]} ${nextDate.getDate()}`,
          tempMax: lastDay ? lastDay.tempMax : 28,
          tempMin: lastDay ? lastDay.tempMin : 22,
          condition: lastDay ? lastDay.condition : 'Clear',
          icon: lastDay ? lastDay.icon : '☀️',
          precipitation: lastDay ? lastDay.precipitation : 0,
          humidity: lastDay ? lastDay.humidity : 65,
          windSpeed: lastDay ? lastDay.windSpeed : 12,
        });
      }
    }

    return NextResponse.json(formattedForecast);
  } catch (error) {
    console.error('Forecast API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forecast data' },
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

