'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [19.076, 72.8777]; // Mumbai as a default focus
const DEFAULT_ZOOM = 6;
const MAP_CONTAINER_ID = 'weather-map-container';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

const LAYER_DEFINITIONS = [
  {
    id: 'precipitation_new',
    label: 'Precipitation',
    emoji: '🌦️',
    accent: '#4D9FFF',
    description: 'Visualises rainfall intensity across the region',
  },
  {
    id: 'temp_new',
    label: 'Temperature',
    emoji: '🌡️',
    accent: '#FF6B35',
    description: 'Shows surface temperature distribution',
  },
  {
    id: 'clouds_new',
    label: 'Clouds',
    emoji: '☁️',
    accent: '#9D4EDD',
    description: 'Highlights cloud coverage and density',
  },
  {
    id: 'pressure_new',
    label: 'Pressure',
    emoji: '🔽',
    accent: '#FFC857',
    description: 'Displays mean sea-level pressure patterns',
  },
  {
    id: 'wind_new',
    label: 'Wind',
    emoji: '💨',
    accent: '#00D09C',
    description: 'Illustrates surface wind intensity',
  },
];

const buildOverlayUrl = (layerId) =>
  `/api/owm-tiles/${layerId}/{z}/{x}/{y}.png`;

const WeatherMapInner = () => {
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [selectedLayer, setSelectedLayer] = useState(LAYER_DEFINITIONS[0]);
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);
  const [isLocating, setIsLocating] = useState(false);

  const [activePoint, setActivePoint] = useState(null);
  const [pointWeather, setPointWeather] = useState(null);
  const [pointLoading, setPointLoading] = useState(false);
  const [pointError, setPointError] = useState('');
  const [isClientReady, setIsClientReady] = useState(false);

  const baseTileUrl = useMemo(
    () => 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    []
  );

  const overlayTileUrl = useMemo(() => {
    return buildOverlayUrl(selectedLayer.id);
  }, [selectedLayer]);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (!isClientReady) {
      return;
    }
    const existingContainer = document.getElementById(MAP_CONTAINER_ID);
    if (existingContainer && existingContainer._leaflet_id) {
      existingContainer._leaflet_id = undefined;
    }
  }, [isClientReady]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setPointError('Geolocation is not supported in this browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setActivePoint({
          lat: latitude,
          lon: longitude,
          label: 'Your location',
        });
        setIsLocating(false);
      },
      (error) => {
        setPointError(error.message || 'Unable to fetch your location.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000 * 60 * 5,
      }
    );
  }, []);

  const fetchWeatherForPoint = useCallback(
    async ({ lat, lng }, metadata = {}) => {
      setPointError('');
      setPointLoading(true);
      try {
        const response = await fetch(
          `/api/weather/current?lat=${lat}&lon=${lng}`
        );
        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(
            error?.error || 'Unable to retrieve weather details for this point.'
          );
        }
        const data = await response.json();
        setPointWeather({
          location: metadata.label || data.location || 'Selected location',
          coords: { lat, lon: lng },
          temperature: data.temperature,
          feelsLike: data.feelsLike,
          humidity: data.humidity,
          pressure: data.pressure,
          windSpeed: data.windSpeed ?? null,
          windDirection: data.windDirection,
          description: data.description,
        });
        setActivePoint({
          lat,
          lon: lng,
          label: metadata.label || data.location || 'Selected location',
        });
      } catch (error) {
        console.error('Failed to fetch weather at point', error);
        setPointError(
          error.message || 'Something went wrong fetching weather details.'
        );
      } finally {
        setPointLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    async (query) => {
      if (!query) {
        return;
      }
      try {
        setPointError('');
        setPointLoading(true);
        const response = await fetch(
          `/api/weather/geocode?query=${encodeURIComponent(query)}`
        );
        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || 'Location search failed.');
        }
        const results = await response.json();
        if (!results.length) {
          setPointError('No matching locations were found.');
          return;
        }
        const location = results[0];
        const { lat, lon, label } = location;
        setMapCenter([lat, lon]);
        await fetchWeatherForPoint({ lat, lng: lon }, { label });
      } catch (error) {
        console.error('Search error', error);
        setPointError(error.message || 'Unable to search for this location.');
      } finally {
        setPointLoading(false);
      }
    },
    [fetchWeatherForPoint]
  );

  const MapEffect = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.flyTo(center, map.getZoom() < 6 ? DEFAULT_ZOOM : map.getZoom(), {
          duration: 1.2,
        });
      }
    }, [center, map]);
    return null;
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (event) => {
        const { latlng } = event;
        fetchWeatherForPoint(latlng);
      },
    });
    return null;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.35)]">
        <div className="h-[400px] w-full">
          {isClientReady ? (
            <MapContainer
              id={MAP_CONTAINER_ID}
              center={mapCenter}
              zoom={DEFAULT_ZOOM}
              minZoom={2}
              zoomControl={false}
              className="h-full w-full bg-[#111]"
              scrollWheelZoom
            >
              <MapEffect center={mapCenter} />
              <MapClickHandler />
              <ZoomControl position="topright" />
              <TileLayer attribution={TILE_ATTRIBUTION} url={baseTileUrl} />
              {overlayTileUrl && (
                <TileLayer
                  key={selectedLayer.id}
                  url={overlayTileUrl}
                  attribution='Weather data &copy; <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">OpenWeatherMap</a>'
                  opacity={overlayOpacity}
                />
              )}

              {activePoint && (
                <CircleMarker
                  center={[activePoint.lat, activePoint.lon]}
                  radius={10}
                  pathOptions={{ color: '#00D09C', weight: 2, fillOpacity: 0.4 }}
                >
                  <Tooltip direction="top" offset={[0, -6]} permanent>
                    {activePoint.label}
                  </Tooltip>
                  {pointWeather && (
                    <Popup>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-[#0D0D0D]">
                          {pointWeather.location}
                        </p>
                        {pointWeather.temperature != null && (
                          <p>
                            Temperature:{' '}
                            <span className="font-medium">
                              {Math.round(pointWeather.temperature)}°C
                            </span>
                          </p>
                        )}
                        {pointWeather.feelsLike != null && (
                          <p>Feels like: {Math.round(pointWeather.feelsLike)}°C</p>
                        )}
                        {pointWeather.humidity != null && (
                          <p>Humidity: {pointWeather.humidity}%</p>
                        )}
                        {pointWeather.windSpeed != null && (
                          <p>
                            Wind: {Math.round(pointWeather.windSpeed)} km/h
                            {pointWeather.windDirection ? (
                              <span className="ml-1">• {pointWeather.windDirection}</span>
                            ) : null}
                          </p>
                        )}
                        {pointWeather.description && (
                          <p className="capitalize">{pointWeather.description}</p>
                        )}
                      </div>
                    </Popup>
                  )}
                </CircleMarker>
              )}
            </MapContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-[#1A1A1A]">
              <div className="text-center space-y-2">
                <div className="animate-spin text-3xl">🛰️</div>
                <p className="text-xs text-[#B0B0B0]">Initialising map…</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute left-4 top-4 flex flex-col gap-3">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="bg-[#0D0D0D]/80 backdrop-blur px-3 py-2 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors disabled:opacity-60"
          >
            {isLocating ? 'Locating…' : 'Use my location'}
          </button>
        </div>
      </div>

      <LayerButtons
        selectedLayer={selectedLayer}
        onSelectLayer={setSelectedLayer}
      />

      <div className="bg-[#252525] rounded-2xl p-4 border border-white/10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-white font-medium">Layer opacity</p>
            <p className="text-xs text-[#B0B0B0]">
              Adjust overlay visibility to compare with the base map.
            </p>
          </div>
          <span className="text-sm font-semibold text-white">
            {Math.round(overlayOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={overlayOpacity}
          onChange={(event) => setOverlayOpacity(Number(event.target.value))}
          className="w-full accent-[#00D09C]"
        />
      </div>

      <SearchPanel
        onSearch={handleSearch}
        loading={pointLoading}
      />

      <InspectorPanel
        layer={selectedLayer}
        weather={pointWeather}
        loading={pointLoading}
        error={pointError}
      />
    </div>
  );
};

const LayerButtons = ({ selectedLayer, onSelectLayer }) => (
  <div className="bg-[#252525] rounded-2xl p-4 border border-white/10">
    <div className="grid grid-cols-2 gap-3">
      {LAYER_DEFINITIONS.map((layer) => {
        const isActive = selectedLayer.id === layer.id;
        return (
          <button
            key={layer.id}
            onClick={() => onSelectLayer(layer)}
            className={`flex items-center gap-3 rounded-2xl border p-3 transition-transform ${
              isActive
                ? 'border-white/60 bg-white/10 scale-[0.99]'
                : 'border-white/10 bg-[#1A1A1A]'
            }`}
          >
            <span
              className="text-2xl flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${layer.accent}33` }}
            >
              {layer.emoji}
            </span>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">
                {layer.label}
              </p>
              <p className="text-xs text-[#B0B0B0]">{layer.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const SearchPanel = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }
    onSearch(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#252525] rounded-2xl p-4 border border-white/10 space-y-3"
    >
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a city or location"
          className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-[#707070] focus:outline-none focus:ring-2 focus:ring-[#00D09C]"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#00D09C] text-[#0D0D0D] font-semibold px-4 py-2 rounded-xl hover:bg-[#00b886] transition-colors disabled:opacity-60"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>
      <p className="text-xs text-[#707070]">
        Powered by OpenWeatherMap geocoding API. Try queries like &ldquo;Paris&rdquo;
        or &ldquo;San Francisco, US&rdquo;.
      </p>
    </form>
  );
};

const InspectorPanel = ({ layer, weather, loading, error }) => {
  return (
    <div className="bg-[#252525] rounded-2xl p-4 border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">
            {layer.label} layer active
          </p>
          <p className="text-xs text-[#B0B0B0]">{layer.description}</p>
        </div>
        <span className="text-lg">{layer.emoji}</span>
      </div>

      {error && (
        <div className="text-sm text-[#FF6B35]">
          {error}
        </div>
      )}

      {!error && loading && (
        <div className="text-sm text-[#B0B0B0]">Loading weather details…</div>
      )}

      {!error && !loading && weather && (
        <div className="grid grid-cols-2 gap-3 text-sm text-white">
          <InfoBadge label="Location" value={weather.location} />
          <InfoBadge
            label="Temperature"
            value={
              weather.temperature != null
                ? `${Math.round(weather.temperature)}°C`
                : '—'
            }
          />
          <InfoBadge
            label="Feels like"
            value={
              weather.feelsLike != null
                ? `${Math.round(weather.feelsLike)}°C`
                : '—'
            }
          />
          <InfoBadge
            label="Humidity"
            value={
              weather.humidity != null ? `${weather.humidity}%` : '—'
            }
          />
          <InfoBadge
            label="Pressure"
            value={
              weather.pressure != null ? `${weather.pressure} hPa` : '—'
            }
          />
          <InfoBadge
            label="Wind"
            value={
              weather.windSpeed != null
                ? `${Math.round(weather.windSpeed)} km/h${
                    weather.windDirection ? ` • ${weather.windDirection}` : ''
                  }`
                : '—'
            }
          />
          <InfoBadge
            label="Conditions"
            value={
              weather.description
                ? weather.description.charAt(0).toUpperCase() +
                  weather.description.slice(1)
                : '—'
            }
            className="col-span-2"
          />
        </div>
      )}

      {!error && !loading && !weather && (
        <p className="text-sm text-[#B0B0B0]">
          Click anywhere on the map or search for a city to inspect current
          conditions.
        </p>
      )}
    </div>
  );
};

const InfoBadge = ({ label, value, className = '' }) => (
  <div
    className={`bg-[#1A1A1A] border border-white/5 rounded-xl px-3 py-2 ${className}`}
  >
    <p className="text-xs text-[#707070] mb-1">{label}</p>
    <p className="text-sm font-semibold text-white break-words">{value}</p>
  </div>
);

export default WeatherMapInner;


