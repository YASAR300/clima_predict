'use client';

import { useEffect, useMemo, useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { useActiveLocation } from '@/hooks/useActiveLocation';
import integrationService from '@/services/integrationService';

const formatNumber = (value, decimals = 1) => {
  if (value == null || Number.isNaN(value)) return '—';
  return Number(value).toFixed(decimals);
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function Insights() {
  const { activeLocation } = useActiveLocation();

  const [comparison, setComparison] = useState(null);
  const [comparisonError, setComparisonError] = useState('');

  const [nasaData, setNasaData] = useState(null);
  const [nasaError, setNasaError] = useState('');

  const [aqiData, setAqiData] = useState(null);
  const [aqiError, setAqiError] = useState('');

  const [tomorrowData, setTomorrowData] = useState(null);
  const [tomorrowError, setTomorrowError] = useState('');

  const [meteostatData, setMeteostatData] = useState(null);
  const [meteostatError, setMeteostatError] = useState('');

  const [places, setPlaces] = useState([]);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState('');

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [carbonForm, setCarbonForm] = useState({
    electricityUnit: 'kwh',
    electricityValue: '',
    country: 'IN',
    state: '',
  });
  const [carbonResult, setCarbonResult] = useState(null);
  const [carbonLoading, setCarbonLoading] = useState(false);
  const [carbonError, setCarbonError] = useState('');

  const [webhookStatus, setWebhookStatus] = useState('');
  const [webhookLoading, setWebhookLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!activeLocation?.lat || !activeLocation?.lon) {
      return;
    }

    const { lat, lon } = activeLocation;

    const loadComparison = async () => {
      try {
        const result = await integrationService.getOpenWeatherComparison({
          lat,
          lon,
        });
        if (!cancelled) {
          setComparison(result);
          setComparisonError('');
        }
      } catch (error) {
        if (!cancelled) {
          setComparison(null);
          setComparisonError(error.message);
        }
      }
    };

    const loadNasaData = async () => {
      try {
        const result = await integrationService.getNasaClimateData({
          lat,
          lon,
          parameters: ['T2M', 'PRECTOT', 'RH2M', 'WS2M'],
        });
        if (!cancelled) {
          setNasaData(result);
          setNasaError('');
        }
      } catch (error) {
        if (!cancelled) {
          setNasaData(null);
          setNasaError(error.message);
        }
      }
    };

    const loadAqiData = async () => {
      try {
        const result = await integrationService.getRealtimeAqi({ lat, lon });
        if (!cancelled) {
          setAqiData(result);
          setAqiError('');
        }
      } catch (error) {
        if (!cancelled) {
          setAqiData(null);
          setAqiError(error.message);
        }
      }
    };

    const loadTomorrow = async () => {
      try {
        const result = await integrationService.getTomorrowForecast({
          lat,
          lon,
          timesteps: ['10m', '1h'],
        });
        if (!cancelled) {
          setTomorrowData(result);
          setTomorrowError('');
        }
      } catch (error) {
        if (!cancelled) {
          setTomorrowData(null);
          setTomorrowError(error.message);
        }
      }
    };

    const loadMeteostat = async () => {
      try {
        const result = await integrationService.getMeteostatHistory({
          lat,
          lon,
        });
        if (!cancelled) {
          setMeteostatData(result);
          setMeteostatError('');
        }
      } catch (error) {
        if (!cancelled) {
          setMeteostatData(null);
          setMeteostatError(error.message);
        }
      }
    };

    loadComparison();
    loadNasaData();
    loadAqiData();
    loadTomorrow();
    loadMeteostat();

    return () => {
      cancelled = true;
    };
  }, [activeLocation]);

  const nasaSummary = useMemo(() => {
    if (!nasaData?.data) {
      return null;
    }
    const parameterAverages = {};
    for (const [key, value] of Object.entries(nasaData.data)) {
      const values = Object.values(value || {}).map(Number).filter((v) => !Number.isNaN(v));
      if (values.length === 0) continue;
      const average =
        values.reduce((sum, val) => sum + val, 0) / values.length;
      parameterAverages[key] = average;
    }
    return parameterAverages;
  }, [nasaData]);

  const meteostatSummary = useMemo(() => {
    if (!meteostatData?.data?.length) {
      return null;
    }
    const temps = meteostatData.data
      .map((entry) => entry.tavg)
      .filter((value) => value != null);
    const rain = meteostatData.data
      .map((entry) => entry.prcp || 0)
      .filter((value) => value != null);
    return {
      avgTemp:
        temps.length > 0
          ? temps.reduce((sum, val) => sum + val, 0) / temps.length
          : null,
      totalRainfall:
        rain.length > 0 ? rain.reduce((sum, val) => sum + val, 0) : null,
      hottestDay: meteostatData.data.reduce((prev, curr) =>
        (curr.tmax ?? -Infinity) > (prev.tmax ?? -Infinity) ? curr : prev
      ),
      coldestDay: meteostatData.data.reduce((prev, curr) =>
        (curr.tmin ?? Infinity) < (prev.tmin ?? Infinity) ? curr : prev
      ),
    };
  }, [meteostatData]);

  const hyperlocalPreview = useMemo(() => {
    if (!tomorrowData?.timelines?.length) return [];
    const hourly = tomorrowData.timelines.find(
      (timeline) => timeline.timestep === '1h'
    );
    if (!hourly?.intervals) return [];
    return hourly.intervals.slice(0, 5).map((interval) => ({
      time: interval.startTime,
      temperature: interval.values?.temperature,
      precipitation: interval.values?.precipitationProbability,
      windSpeed: interval.values?.windSpeed,
    }));
  }, [tomorrowData]);

  const handleSearchPlaces = async (event) => {
    event.preventDefault();
    if (!placeQuery.trim() || !activeLocation) {
      setPlaceError('Enter a keyword to search hazard hotspots.');
      return;
    }
    setPlaceLoading(true);
    setPlaceError('');
    try {
      const results = await integrationService.searchPlaces({
        query: placeQuery.trim(),
        lat: activeLocation.lat,
        lon: activeLocation.lon,
        radius: '50000',
      });
      setPlaces(results.results || []);
      if (!results.results?.length) {
        setPlaceError('No nearby matches. Try different keywords or radius.');
      }
    } catch (error) {
      setPlaces([]);
      setPlaceError(error.message);
    } finally {
      setPlaceLoading(false);
    }
  };

  const handleCarbonSubmit = async (event) => {
    event.preventDefault();
    if (!carbonForm.electricityValue) {
      setCarbonError('Enter a usage value to estimate emissions.');
      return;
    }
    setCarbonLoading(true);
    setCarbonError('');
    try {
      const payload = {
        type: 'electricity',
        electricity_unit: carbonForm.electricityUnit,
        electricity_value: Number(carbonForm.electricityValue),
        country: carbonForm.country,
      };
      if (carbonForm.state) {
        payload.state = carbonForm.state;
      }
      const result = await integrationService.createCarbonEstimate(payload);
      setCarbonResult(result.estimate);
    } catch (error) {
      setCarbonResult(null);
      setCarbonError(error.message);
    } finally {
      setCarbonLoading(false);
    }
  };

  const handleAiSubmit = async (event) => {
    event.preventDefault();
    if (!aiPrompt.trim()) {
      setAiError('Ask a question to get AI advice.');
      return;
    }
    setAiError('');
    setAiLoading(true);
    try {
      const contextPieces = [];
      if (comparison) {
        contextPieces.push(
          `Forecast confidence is ${comparison.confidence}. Temperature delta: ${comparison.differences.temperature}.`
        );
      }
      if (aqiData) {
        contextPieces.push(
          `Air quality index is ${aqiData.aqi} with dominant pollutant ${aqiData.dominentPollutant}.`
        );
      }
      if (nasaSummary) {
        contextPieces.push(
          `NASA climate averages: ${JSON.stringify(nasaSummary)}`
        );
      }
      const context = contextPieces.join('\n');
      const result = await integrationService.askAiAdvisor({
        prompt: aiPrompt.trim(),
        context,
      });
      setAiResponse(result.message);
    } catch (error) {
      setAiResponse('');
      setAiError(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleWebhookSend = async () => {
    if (!comparison && !aqiData) {
      setWebhookStatus(
        'Collect weather data before dispatching alerts to Slack or Discord.'
      );
      return;
    }
    setWebhookLoading(true);
    setWebhookStatus('');
    try {
      const messageLines = [];
      if (comparison) {
        messageLines.push(
          `Forecast confidence: ${comparison.confidence || 'unknown'}`
        );
        if (comparison.differences?.temperature != null) {
          messageLines.push(
            `Temp delta: ${comparison.differences.temperature}°C`
          );
        }
      }
      if (aqiData) {
        messageLines.push(`AQI: ${aqiData.aqi} (${aqiData.dominentPollutant})`);
      }
      const metadata = {
        Location: activeLocation?.label || 'Selected area',
        'Updated at': new Date().toLocaleTimeString(),
      };
      const result = await integrationService.sendWebhook({
        title: 'ClimaPredict Daily Snapshot',
        message: messageLines.join('\n'),
        metadata,
      });
      if (result.failed?.length) {
        setWebhookStatus(
          `Delivered: ${result.delivered.length}, Failed: ${result.failed
            .map((item) => item.target)
            .join(', ')}`
        );
      } else {
        setWebhookStatus('Alert sent to configured channels.');
      }
    } catch (error) {
      setWebhookStatus(error.message);
    } finally {
      setWebhookLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Insights & Intelligence</h1>
          <p className="text-sm text-white/60">
            Real-time climate intelligence for {activeLocation?.label || 'your location'}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Forecast Confidence & Comparisons
              </h2>
              <p className="text-xs text-white/60">
                Validated using live OpenWeatherMap data and short-term models.
              </p>
            </div>
            <span className="text-sm font-semibold bg-white/10 rounded-full px-3 py-1">
              OpenWeatherMap
            </span>
          </header>

          {comparisonError ? (
            <p className="text-sm text-[#FF6B35]">{comparisonError}</p>
          ) : comparison ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ForecastCard
                title="Confidence"
                value={comparison.confidence || '—'}
                subtitle="Based on delta across temperature, pressure, humidity."
                icon="✅"
              />
              <ForecastCard
                title="Temperature Δ"
                value={`${formatNumber(comparison.differences?.temperature, 1)}°C`}
                subtitle="Actual vs next modelled period"
                icon="🌡️"
              />
              <ForecastCard
                title="Humidity Δ"
                value={`${comparison.differences?.humidity ?? '—'}%`}
                subtitle="Deviation from forecast baseline"
                icon="💧"
              />
            </div>
          ) : (
            <p className="text-sm text-white/60">
              Pulling live weather data for your location…
            </p>
          )}
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">NASA Climate Metrics</h2>
              <p className="text-xs text-white/60">
                NASA POWER satellite layer for temperature, rainfall, humidity, and wind.
              </p>
            </div>
            <span className="text-sm font-semibold bg-white/10 rounded-full px-3 py-1">
              NASA EarthData
            </span>
          </header>

          {nasaError ? (
            <p className="text-sm text-[#FF6B35]">{nasaError}</p>
          ) : nasaSummary ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoBadge
                icon="🌡️"
                label="Surface Temp"
                value={`${formatNumber(nasaSummary.T2M)}°C`}
              />
              <InfoBadge
                icon="🌧️"
                label="Daily Rain"
                value={`${formatNumber(nasaSummary.PRECTOT)} mm`}
              />
              <InfoBadge
                icon="💧"
                label="Humidity"
                value={`${formatNumber(nasaSummary.RH2M)}%`}
              />
              <InfoBadge
                icon="💨"
                label="Wind"
                value={`${formatNumber(nasaSummary.WS2M)} m/s`}
              />
            </div>
          ) : (
            <p className="text-sm text-white/60">
              Fetching satellite-backed averages…
            </p>
          )}
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Air Quality & Health</h2>
              <p className="text-xs text-white/60">
                AQICN live sensors with health guidance for PM₂.₅ & PM₁₀.
              </p>
            </div>
            <span className="text-sm font-semibold bg-white/10 rounded-full px-3 py-1">
              AQICN
            </span>
          </header>

          {aqiError ? (
            <p className="text-sm text-[#FF6B35]">{aqiError}</p>
          ) : aqiData ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InfoBadge
                icon="🧪"
                label="AQI Index"
                value={aqiData.aqi}
              />
              <InfoBadge
                icon="🌬️"
                label="Dominant Pollutant"
                value={aqiData.dominentPollutant?.toUpperCase() || '—'}
              />
              <InfoBadge
                icon="📍"
                label="Monitoring Station"
                value={aqiData.city || '—'}
              />
          </div>
          ) : (
            <p className="text-sm text-white/60">
              Checking pollution monitors near you…
            </p>
          )}
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Hyperlocal Forecast (10 min cadence)
              </h2>
              <p className="text-xs text-white/60">
                Machine-learning models from Tomorrow.io, trusted by aviation and logistics.
              </p>
                </div>
            <span className="text-sm font-semibold bg-white/10 rounded-full px-3 py-1">
              Tomorrow.io
            </span>
          </header>

          {tomorrowError ? (
            <p className="text-sm text-[#FF6B35]">{tomorrowError}</p>
          ) : hyperlocalPreview.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {hyperlocalPreview.map((interval) => (
                <div
                  key={interval.time}
                  className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-2"
                >
                  <p className="text-xs text-white/60">
                    {new Date(interval.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-xl font-semibold">
                    {formatNumber(interval.temperature, 0)}°C
                  </p>
                  <p className="text-xs text-white/60">
                    Rain: {formatNumber(interval.precipitation ?? 0, 0)}%
                  </p>
                  <p className="text-xs text-white/60">
                    Wind: {formatNumber(interval.windSpeed, 1)} m/s
                  </p>
                </div>
              ))}
              </div>
          ) : (
            <p className="text-sm text-white/60">
              Loading high-resolution forecast slices…
            </p>
          )}
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Historical Trends</h2>
              <p className="text-xs text-white/60">
                Meteostat historical archive for on-season pattern discovery.
              </p>
                </div>
            <span className="text-sm font-semibold bg-white/10 rounded-full px-3 py-1">
              Meteostat
            </span>
          </header>

          {meteostatError ? (
            <p className="text-sm text-[#FF6B35]">{meteostatError}</p>
          ) : meteostatSummary ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoBadge
                icon="🌡️"
                label="Avg Temp (12 mo)"
                value={`${formatNumber(meteostatSummary.avgTemp)}°C`}
              />
              <InfoBadge
                icon="🌧️"
                label="Total Rain"
                value={`${formatNumber(meteostatSummary.totalRainfall)} mm`}
              />
              <InfoBadge
                icon="🔥"
                label="Hottest Day"
                value={
                  meteostatSummary.hottestDay
                    ? `${formatDate(meteostatSummary.hottestDay.date)} (${formatNumber(
                        meteostatSummary.hottestDay.tmax
                      )}°C)`
                    : '—'
                }
              />
              <InfoBadge
                icon="❄️"
                label="Coldest Day"
                value={
                  meteostatSummary.coldestDay
                    ? `${formatDate(meteostatSummary.coldestDay.date)} (${formatNumber(
                        meteostatSummary.coldestDay.tmin
                      )}°C)`
                    : '—'
                }
              />
                </div>
          ) : (
            <p className="text-sm text-white/60">
              Requesting past climate records…
            </p>
          )}
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Geo Hotspots</h2>
              <p className="text-xs text-white/60">
                Explore OpenStreetMap data for nearby vulnerable sites (flood zones, pollution hotspots).
              </p>
              </div>
            <span className="text-sm font-semibold bg-white/10 rounded-full px-3 py-1">
              OpenStreetMap
            </span>
          </header>

          <form
            onSubmit={handleSearchPlaces}
            className="flex flex-col sm:flex-row gap-3 items-stretch"
          >
            <input
              value={placeQuery}
              onChange={(event) => setPlaceQuery(event.target.value)}
              placeholder="Search: flood shelter, hospital, pollution hotspot…"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00D09C]"
            />
            <button
              type="submit"
              disabled={placeLoading}
              className="px-4 py-3 rounded-xl bg-[#00D09C] text-black text-sm font-semibold hover:bg-[#00b886] transition disabled:opacity-60"
            >
              {placeLoading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {placeError && <p className="text-xs text-[#FF6B35]">{placeError}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {places.slice(0, 6).map((place) => (
              <div
                key={place.id}
                className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2"
              >
                <p className="text-sm font-semibold">{place.name}</p>
                <p className="text-xs text-white/60">{place.address}</p>
                <div className="flex items-center gap-3 text-xs text-white/60 flex-wrap">
                  {place.category && (
                    <span className="bg-white/10 px-2 py-1 rounded-full">
                      {place.category}
                    </span>
                  )}
                  {place.type && (
                    <span className="bg-white/10 px-2 py-1 rounded-full">
                      {place.type}
                    </span>
                  )}
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=16/${place.lat}/${place.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00D09C] hover:underline"
                  >
                    View map
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Carbon Impact Calculator</h2>
              <p className="text-xs text-white/60">
                Estimate emissions for electricity usage using Climatiq.
              </p>
            </div>
            <span className="text-sm font-semibold bg-white/10 rounded-full px-3 py-1">
              Climatiq
            </span>
          </header>

          <form
            onSubmit={handleCarbonSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <div className="space-y-2">
              <label className="text-xs text-white/60">Electricity used</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={carbonForm.electricityValue}
                onChange={(event) =>
                  setCarbonForm((prev) => ({
                    ...prev,
                    electricityValue: event.target.value,
                  }))
                }
                placeholder="Usage amount"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00D09C]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Unit</label>
              <select
                value={carbonForm.electricityUnit}
                onChange={(event) =>
                  setCarbonForm((prev) => ({
                    ...prev,
                    electricityUnit: event.target.value,
                  }))
                }
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00D09C]"
              >
                <option value="kwh">kWh</option>
                <option value="mwh">MWh</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Country ISO code</label>
              <input
                value={carbonForm.country}
                onChange={(event) =>
                  setCarbonForm((prev) => ({
                    ...prev,
                    country: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="IN"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00D09C]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">
                State / Region (optional)
              </label>
              <input
                value={carbonForm.state}
                onChange={(event) =>
                  setCarbonForm((prev) => ({
                    ...prev,
                    state: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="MH"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00D09C]"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={carbonLoading}
                className="w-full bg-[#00D09C] text-black font-semibold rounded-xl px-4 py-3 hover:bg-[#00b886] transition disabled:opacity-60"
              >
                {carbonLoading ? 'Calculating…' : 'Estimate Emissions'}
              </button>
            </div>
          </form>

          {carbonError && (
            <p className="text-xs text-[#FF6B35]">{carbonError}</p>
          )}

          {carbonResult && (
            <div className="bg-black/30 border border-white/10 rounded-xl p-4">
              <p className="text-sm font-semibold mb-2">
                Estimated Footprint
              </p>
              <div className="text-xs text-white/60 space-y-1">
                <p>
                  CO₂e: {formatNumber(carbonResult.co2e, 3)}{' '}
                  {carbonResult.co2e_unit || ''}
                </p>
                <p>
                  Region: {carbonResult.emission_factor?.region || 'N/A'}
                </p>
                <p>
                  Activity: {carbonResult.emission_factor?.activity_id || 'N/A'}
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">AI Weather Assistant</h2>
              <p className="text-xs text-white/60">
                Ask OpenAI or Hugging Face models for contextual farming or safety advice.
              </p>
            </div>
            <span className="text-sm font-semibold bg-white/10 rounded-full px-3 py-1">
              OpenAI / Hugging Face
            </span>
          </header>

          <form onSubmit={handleAiSubmit} className="space-y-3">
            <textarea
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              placeholder="Example: Should I irrigate tomorrow morning? Any extreme weather alerts I should plan for?"
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00D09C]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={aiLoading}
                className="px-4 py-3 bg-[#00D09C] text-black rounded-xl text-sm font-semibold hover:bg-[#00b886] transition disabled:opacity-60"
              >
                {aiLoading ? 'Thinking…' : 'Ask AI'}
              </button>
            </div>
          </form>

          {aiError && <p className="text-xs text-[#FF6B35]">{aiError}</p>}
          {aiResponse && (
            <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-white/80 whitespace-pre-line">
              {aiResponse}
            </div>
          )}
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Community Alerts</h2>
              <p className="text-xs text-white/60">
                Broadcast an update to your Slack or Discord community.
              </p>
            </div>
            <span className="text-sm font-semibold bg-white/10 rounded-full px-3 py-1">
              Slack • Discord
            </span>
          </header>

          <button
            onClick={handleWebhookSend}
            disabled={webhookLoading}
            className="w-full bg-[#4D9FFF] text-black font-semibold rounded-xl px-4 py-3 hover:bg-[#428de0] transition disabled:opacity-60"
          >
            {webhookLoading ? 'Sending…' : 'Send Daily Weather Briefing'}
          </button>

          {webhookStatus && (
            <p className="text-xs text-white/60">{webhookStatus}</p>
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}

function ForecastCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/60">{subtitle}</p>
    </div>
  );
}

function InfoBadge({ icon, label, value }) {
  return (
    <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-1">
      <div className="flex items-center gap-2 text-white/80 text-sm font-semibold">
        <span className="text-lg">{icon}</span>
        {label}
      </div>
      <p className="text-base text-white font-semibold">{value}</p>
    </div>
  );
}

