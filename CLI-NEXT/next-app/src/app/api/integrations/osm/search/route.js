import { NextResponse } from 'next/server';

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const radiusParam = searchParams.get('radius');

    if (!query) {
      return NextResponse.json(
        { error: 'Missing required query parameter: query' },
        { status: 400 }
      );
    }

    const radius = clampRadius(radiusParam);
    const viewbox =
      lat && lon ? buildViewbox(Number(lat), Number(lon), radius) : null;

    const url = new URL(NOMINATIM_ENDPOINT);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '10');
    url.searchParams.set('dedupe', '1');
    url.searchParams.set('namedetails', '1');
    url.searchParams.set('extratags', '1');
    url.searchParams.set('q', query);
    if (viewbox) {
      url.searchParams.set(
        'viewbox',
        `${viewbox.left},${viewbox.top},${viewbox.right},${viewbox.bottom}`
      );
      url.searchParams.set('bounded', '1');
    }

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'ClimaPredictNextApp/1.0 (+https://clima-predict.example)',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OSM Nominatim error (${response.status}): ${body}`);
    }

    const results = await response.json();

    return NextResponse.json({
      query,
      radius,
      results: results.map((item) => ({
        id: item.place_id,
        name: item.display_name,
        category: item.category,
        type: item.type,
        importance: item.importance,
        lat: Number(item.lat),
        lon: Number(item.lon),
        address: item.namedetails?.name || item.display_name,
        tags: item.extratags || {},
        boundingBox: item.boundingbox || null,
      })),
    });
  } catch (error) {
    console.error('[osm.search] error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to search OpenStreetMap data.' },
      { status: 500 }
    );
  }
}

function clampRadius(radiusParam) {
  const numeric = Number(radiusParam);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.min(Math.max(numeric, 500), 100000);
  }
  return 5000;
}

function buildViewbox(lat, lon, radiusMeters) {
  const earthRadius = 6378137; // meters
  const angularDistance = radiusMeters / earthRadius;

  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const minLat = latRad - angularDistance;
  const maxLat = latRad + angularDistance;

  const sinAngular = Math.sin(angularDistance);
  const cosLat = Math.cos(latRad);
  const deltaLon =
    cosLat === 0 ? angularDistance : Math.asin(Math.min(1, sinAngular / cosLat));

  const minLon = lonRad - deltaLon;
  const maxLon = lonRad + deltaLon;

  return {
    left: ((minLon * 180) / Math.PI).toFixed(6),
    right: ((maxLon * 180) / Math.PI).toFixed(6),
    top: ((maxLat * 180) / Math.PI).toFixed(6),
    bottom: ((minLat * 180) / Math.PI).toFixed(6),
  };
}


