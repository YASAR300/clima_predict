import { NextResponse } from 'next/server';

const OPENWEATHER_GEOCODE_URL = 'https://api.openweathermap.org/geo/1.0/direct';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json([]);
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENWEATHER_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const geocodeUrl = `${OPENWEATHER_GEOCODE_URL}?q=${encodeURIComponent(
      query
    )}&limit=5&appid=${apiKey}`;

    const response = await fetch(geocodeUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: `OpenWeather geocoding failed (${response.status}).` },
        { status: response.status }
      );
    }

    const results = await response.json();
    const formatted = results.map((location) => ({
      lat: location.lat,
      lon: location.lon,
      label: [location.name, location.state, location.country]
        .filter(Boolean)
        .join(', '),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Geocode proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to search locations.' },
      { status: 500 }
    );
  }
}


