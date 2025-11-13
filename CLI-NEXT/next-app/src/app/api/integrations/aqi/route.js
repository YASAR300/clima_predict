import { NextResponse } from 'next/server';

const AQICN_API_TOKEN = process.env.AQICN_API_TOKEN;
const AQICN_BASE_URL = 'https://api.waqi.info/feed';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const city = searchParams.get('city');

    if (!AQICN_API_TOKEN) {
      return NextResponse.json(
        {
          error:
            'AQICN API token is not configured. Set AQICN_API_TOKEN in your environment variables.',
        },
        { status: 500 }
      );
    }

    if (!city && (!lat || !lon)) {
      return NextResponse.json(
        {
          error:
            'Provide either a city name (?city=Delhi) or geographic coordinates (?lat=..&lon=..).',
        },
        { status: 400 }
      );
    }

    const endpoint = city
      ? `${AQICN_BASE_URL}/${encodeURIComponent(city)}/?token=${AQICN_API_TOKEN}`
      : `${AQICN_BASE_URL}/geo:${lat};${lon}/?token=${AQICN_API_TOKEN}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`AQICN request failed (${response.status}): ${body}`);
    }

    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(
        data.data || data.message || 'AQICN API returned an error response.'
      );
    }

    const pollutantComponents = data.data.iaqi || {};

    return NextResponse.json({
      source: 'AQICN',
      retrievedAt: new Date().toISOString(),
      city: data.data.city?.name,
      coordinates: data.data.city?.geo,
      aqi: data.data.aqi,
      dominentPollutant: data.data.dominentpol,
      pollutants: Object.fromEntries(
        Object.entries(pollutantComponents).map(([key, value]) => [
          key,
          value?.v ?? null,
        ])
      ),
      attributions: data.data.attributions,
      time: data.data.time,
    });
  } catch (error) {
    console.error('[aqi.integration] error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to fetch air quality data.' },
      { status: 500 }
    );
  }
}


