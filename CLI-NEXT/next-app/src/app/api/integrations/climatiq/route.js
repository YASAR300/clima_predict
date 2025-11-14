import { NextResponse } from 'next/server';

const CLIMATIQ_ENDPOINT = 'https://api.climatiq.io/estimate';

export async function POST(request) {
  try {
    const apiKey = process.env.CLIMATIQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Climatiq API key is not configured. Set CLIMATIQ_API_KEY in your environment variables.',
        },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid body. Provide a JSON object payload.' },
        { status: 400 }
      );
    }

    if (body.type !== 'electricity') {
      return NextResponse.json(
        { error: "Currently only 'electricity' estimates are supported." },
        { status: 400 }
      );
    }

    const {
      electricity_unit: unit = 'kwh',
      electricity_value: value,
      country,
      state,
    } = body;

    if (!value || Number(value) <= 0) {
      return NextResponse.json(
        { error: 'Provide a positive electricity_value.' },
        { status: 400 }
      );
    }

    const normalizedUnit = normalizeEnergyUnit(unit);
    if (!normalizedUnit) {
      return NextResponse.json(
        {
          error:
            "Unsupported electricity_unit. Use 'kwh' or 'mwh'.",
        },
        { status: 400 }
      );
    }

    const { amount, unit: climatiqUnit } = convertEnergy(
      Number(value),
      normalizedUnit
    );

    const region = buildRegionCode(country, state);

    const payload = {
      emission_factor: {
        activity_id: 'electricity-energy_source_grid_mix',
        data_version: '27.27',
        region,
      },
      parameters: {
        energy: amount,
        energy_unit: climatiqUnit,
      },
    };

    const response = await fetch(CLIMATIQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Climatiq request failed (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();

    return NextResponse.json({
      source: 'Climatiq',
      retrievedAt: new Date().toISOString(),
      estimate: {
        co2e: data.co2e,
        co2e_unit: data.co2e_unit,
        co2e_accuracy: data.co2e_accuracy ?? null,
        coefficient: data.co2e_per_unit ?? null,
        emission_factor: data.emission_factor,
        input: data.input_parameters,
      },
    });
  } catch (error) {
    console.error('[climatiq.integration] error:', error);
    return NextResponse.json(
      {
        error:
          error.message ||
          'Unable to calculate emissions using Climatiq right now.',
      },
      { status: 500 }
    );
  }
}

function normalizeEnergyUnit(unit = '') {
  const lower = String(unit).toLowerCase();
  if (lower === 'kwh') return 'kwh';
  if (lower === 'mwh') return 'mwh';
  return null;
}

function convertEnergy(value, unit) {
  if (unit === 'kwh') {
    return { amount: value, unit: 'kWh' };
  }
  if (unit === 'mwh') {
    return { amount: value, unit: 'MWh' };
  }
  return { amount: value, unit: 'kWh' };
}

function buildRegionCode(country, state) {
  const trimmedCountry = String(country || '').trim().toUpperCase();
  const trimmedState = String(state || '').trim().toUpperCase();

  if (trimmedCountry && trimmedState) {
    return `${trimmedCountry}-${trimmedState}`;
  }
  if (trimmedCountry) {
    return trimmedCountry;
  }
  return 'INTL';
}


