import { NextResponse } from 'next/server';

const DEFAULT_PARAMETERS = ['T2M', 'PRECTOT', 'RH2M', 'WS2M'];
const NASA_BASE =
  process.env.NASA_EARTHDATA_API_BASE?.replace(/\/$/, '') ||
  'https://power.larc.nasa.gov/api';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const parameterList = searchParams.getAll('parameter');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required query parameters: lat, lon' },
        { status: 400 }
      );
    }

    const now = new Date();
    const endDate =
      end ||
      `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(
        2,
        '0'
      )}${String(now.getUTCDate()).padStart(2, '0')}`;

    const startDate =
      start ||
      (() => {
        const clone = new Date(now);
        clone.setUTCDate(clone.getUTCDate() - 30);
        return `${clone.getUTCFullYear()}${String(
          clone.getUTCMonth() + 1
        ).padStart(2, '0')}${String(clone.getUTCDate()).padStart(2, '0')}`;
      })();

    const parameters =
      parameterList.length > 0 ? parameterList : DEFAULT_PARAMETERS;

    const url = `${NASA_BASE}/temporal/daily/point?parameters=${parameters.join(
      ','
    )}&start=${startDate}&end=${endDate}&latitude=${lat}&longitude=${lon}&format=JSON`;

    const headers = buildNasaAuthHeaders();
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `NASA data request failed (${response.status}): ${errorText}`
      );
    }

    const body = await response.json();
    const data = body?.properties?.parameter || {};

    return NextResponse.json({
      source: 'NASA POWER',
      retrievedAt: new Date().toISOString(),
      metadata: {
        parameters,
        temporalResolution: 'daily',
        spatialResolution: 'point',
        latitude: Number(lat),
        longitude: Number(lon),
        startDate,
        endDate,
      },
      data,
    });
  } catch (error) {
    console.error('[nasa.integration] error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to fetch NASA climate data.' },
      { status: 500 }
    );
  }
}

function buildNasaAuthHeaders() {
  const headers = {};
  const token = process.env.NASA_EARTHDATA_TOKEN;
  const email = process.env.NASA_EARTHDATA_EMAIL;
  const password = process.env.NASA_EARTHDATA_PASSWORD;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  if (email && password) {
    const encoded = Buffer.from(`${email}:${password}`).toString('base64');
    headers.Authorization = `Basic ${encoded}`;
  }

  return headers;
}


