import { NextResponse } from 'next/server';

const ALLOWED_LAYERS = new Set([
  'precipitation_new',
  'temp_new',
  'clouds_new',
  'pressure_new',
  'wind_new',
]);

export async function GET(request, { params }) {
  try {
    const { layer, z, x, y } = params;

    if (!ALLOWED_LAYERS.has(layer)) {
      return NextResponse.json(
        { error: 'Requested layer is not available.' },
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

    const tileUrl = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;
    const response = await fetch(tileUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: `OpenWeather tile request failed (${response.status}).` },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', 'image/png');
    headers.set('Cache-Control', 'public, max-age=300');

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('Tile proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy OpenWeather tile.' },
      { status: 500 }
    );
  }
}


