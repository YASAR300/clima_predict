import { NextResponse } from 'next/server';

const METEOSTAT_API_KEY = process.env.METEOSTAT_API_KEY;
const METEOSTAT_API_HOST =
  process.env.METEOSTAT_API_HOST || 'meteostat.p.rapidapi.com';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required query parameters: lat, lon' },
        { status: 400 }
      );
    }

    if (!METEOSTAT_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Meteostat API key is not configured. Set METEOSTAT_API_KEY in your environment variables.',
        },
        { status: 500 }
      );
    }

    const now = new Date();
    const defaultEnd = now.toISOString().slice(0, 10);
    const defaultStart = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate()
    )
      .toISOString()
      .slice(0, 10);

    const url = new URL('https://meteostat.p.rapidapi.com/point/daily');
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lon);
    url.searchParams.set('start', start || defaultStart);
    url.searchParams.set('end', end || defaultEnd);

    const response = await fetch(url.toString(), {
      headers: {
        'X-RapidAPI-Key': METEOSTAT_API_KEY,
        'X-RapidAPI-Host': METEOSTAT_API_HOST,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Meteostat request failed (${response.status}): ${body}`);
    }

    const data = await response.json();

    return NextResponse.json({
      source: 'Meteostat',
      retrievedAt: new Date().toISOString(),
      location: { lat: Number(lat), lon: Number(lon) },
      start: start || defaultStart,
      end: end || defaultEnd,
      units: data?.meta?.units,
      data: data?.data ?? [],
    });
  } catch (error) {
    console.error('[meteostat.integration] error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to fetch historical climate data.' },
      { status: 500 }
    );
  }
}


