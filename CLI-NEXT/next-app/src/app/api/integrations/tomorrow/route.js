import { NextResponse } from 'next/server';

const TOMORROW_IO_API_KEY = process.env.TOMORROW_IO_API_KEY;
const TOMORROW_BASE_URL =
  'https://api.tomorrow.io/v4/weather/forecast?timesteps=1h&units=metric';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const timesteps = searchParams.getAll('timestep');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required query parameters: lat, lon' },
        { status: 400 }
      );
    }

    if (!TOMORROW_IO_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Tomorrow.io API key is not configured. Set TOMORROW_IO_API_KEY in your environment variables.',
        },
        { status: 500 }
      );
    }

    const url = new URL(TOMORROW_BASE_URL);
    url.searchParams.set('location', `${lat},${lon}`);
    if (timesteps.length > 0) {
      url.searchParams.delete('timesteps');
      timesteps.forEach((step) => url.searchParams.append('timesteps', step));
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'apikey': TOMORROW_IO_API_KEY,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Tomorrow.io request failed (${response.status}): ${body}`
      );
    }

    const data = await response.json();

    return NextResponse.json({
      source: 'Tomorrow.io',
      retrievedAt: new Date().toISOString(),
      location: { lat: Number(lat), lon: Number(lon) },
      timelines: data?.timelines ?? [],
      warnings: data?.warnings ?? [],
    });
  } catch (error) {
    console.error('[tomorrow.integration] error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Unable to fetch hyperlocal weather forecast.',
      },
      { status: 500 }
    );
  }
}


