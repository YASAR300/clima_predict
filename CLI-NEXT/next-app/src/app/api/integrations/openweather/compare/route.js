import { NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required query parameters: lat, lon' },
        { status: 400 }
      );
    }

    if (!OPENWEATHER_API_KEY) {
      return NextResponse.json(
        {
          error:
            'OpenWeatherMap API key is not configured. Set OPENWEATHER_API_KEY in your environment variables.',
        },
        { status: 500 }
      );
    }

    const currentUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=8`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
    ]);

    if (!currentResponse.ok) {
      const error = await currentResponse.json().catch(() => null);
      throw new Error(
        error?.message ||
          `Failed to fetch current conditions: ${currentResponse.status}`
      );
    }

    if (!forecastResponse.ok) {
      const error = await forecastResponse.json().catch(() => null);
      throw new Error(
        error?.message ||
          `Failed to fetch forecast data: ${forecastResponse.status}`
      );
    }

    const current = await currentResponse.json();
    const forecast = await forecastResponse.json();

    const comparison = buildComparison(current, forecast?.list ?? []);

    return NextResponse.json({
      location: {
        name: current?.name,
        country: current?.sys?.country,
        coordinates: { lat, lon },
      },
      retrievedAt: new Date().toISOString(),
      current: comparison.current,
      forecastWindow: comparison.forecastWindow,
      differences: comparison.differences,
      confidence: comparison.confidence,
    });
  } catch (error) {
    console.error('[openweather.compare] error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to compare forecasts right now.' },
      { status: 500 }
    );
  }
}

function buildComparison(current, forecastList) {
  const now = new Date();
  const nextForecast = forecastList[0];
  const hourlyForecasts = forecastList.slice(0, 8);

  const currentSummary = {
    temperature: current?.main?.temp ?? null,
    humidity: current?.main?.humidity ?? null,
    pressure: current?.main?.pressure ?? null,
    windSpeed: current?.wind?.speed != null ? current.wind.speed * 3.6 : null,
    windDirection: current?.wind?.deg ?? null,
    weather: current?.weather?.[0]?.description,
    timestamp: now.toISOString(),
  };

  const forecastSummary = hourlyForecasts.map((entry) => ({
    temperature: entry?.main?.temp ?? null,
    humidity: entry?.main?.humidity ?? null,
    pressure: entry?.main?.pressure ?? null,
    windSpeed: entry?.wind?.speed != null ? entry.wind.speed * 3.6 : null,
    windDirection: entry?.wind?.deg ?? null,
    weather: entry?.weather?.[0]?.description,
    timestamp: entry?.dt_txt ?? new Date(entry?.dt * 1000).toISOString(),
  }));

  const firstForecast = forecastSummary[0];
  const tempDelta =
    currentSummary.temperature != null && firstForecast?.temperature != null
      ? Number(
          (currentSummary.temperature - firstForecast.temperature).toFixed(1)
        )
      : null;
  const humidityDelta =
    currentSummary.humidity != null && firstForecast?.humidity != null
      ? currentSummary.humidity - firstForecast.humidity
      : null;

  const deltas = {
    temperature: tempDelta,
    humidity: humidityDelta,
    pressure:
      currentSummary.pressure != null && firstForecast?.pressure != null
        ? currentSummary.pressure - firstForecast.pressure
        : null,
    windSpeed:
      currentSummary.windSpeed != null && firstForecast?.windSpeed != null
        ? Number(
            (currentSummary.windSpeed - firstForecast.windSpeed).toFixed(1)
          )
        : null,
  };

  const deltaScores = Object.values(deltas)
    .filter((value) => typeof value === 'number')
    .map((value) => Math.abs(value));

  const meanDelta =
    deltaScores.length > 0
      ? deltaScores.reduce((sum, value) => sum + value, 0) / deltaScores.length
      : null;

  const confidence =
    meanDelta == null
      ? null
      : meanDelta < 1
      ? 'high'
      : meanDelta < 3
      ? 'medium'
      : 'low';

  return {
    current: currentSummary,
    forecastWindow: forecastSummary,
    differences: deltas,
    confidence,
  };
}


