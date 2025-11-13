import { NextResponse } from 'next/server';

const OPENWEATHER_REVERSE_URL =
  'https://api.openweathermap.org/geo/1.0/reverse';

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

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENWEATHER_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const url = `${OPENWEATHER_REVERSE_URL}?lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&limit=1&appid=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: `OpenWeather reverse geocoding failed (${response.status}).` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const location = Array.isArray(data) ? data[0] : null;

    if (!location) {
      return NextResponse.json({ label: 'Unknown Location' });
    }

    const label = [location.name, location.state, location.country]
      .filter(Boolean)
      .join(', ');

    return NextResponse.json({
      label: label || 'Unknown Location',
      raw: location,
    });
  } catch (error) {
    console.error('Reverse geocode proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve location name.' },
      { status: 500 }
    );
  }
}


