'use client';

import { defaultLocation as legacyDefaultLocation } from './location';

const STORAGE_KEY = 'clima:savedLocations';
const ACTIVE_KEY = 'clima:activeLocationId';

const FALLBACK_DEFAULT = {
  id: 'default-location',
  label: process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LABEL || 'Mumbai, India',
  lat: process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LAT || '19.0760',
  lon: process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LON || '72.8777',
};

export const defaultLocation = {
  id: legacyDefaultLocation?.id || FALLBACK_DEFAULT.id,
  label:
    legacyDefaultLocation?.city ||
    legacyDefaultLocation?.label ||
    FALLBACK_DEFAULT.label,
  lat: legacyDefaultLocation?.lat || FALLBACK_DEFAULT.lat,
  lon: legacyDefaultLocation?.lon || FALLBACK_DEFAULT.lon,
};

function ensureDefault(locations) {
  const hasDefault = locations.some((loc) => loc.id === defaultLocation.id);
  if (hasDefault) {
    return locations.map((loc) =>
      loc.id === defaultLocation.id
        ? { ...defaultLocation, ...loc, id: defaultLocation.id }
        : loc
    );
  }
  return [defaultLocation, ...locations];
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `loc-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function parseLocations(raw) {
  if (!Array.isArray(raw)) {
    return [defaultLocation];
  }
  return ensureDefault(
    raw
      .filter((loc) => loc && loc.lat && loc.lon)
      .map((loc) => ({
        id: loc.id || generateId(),
        label: loc.label || loc.city || `${loc.lat}, ${loc.lon}`,
        lat: String(loc.lat),
        lon: String(loc.lon),
        customName: loc.customName || '',
      }))
  );
}

export function loadSavedLocations() {
  if (typeof window === 'undefined') {
    return [defaultLocation];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [defaultLocation];
    }
    return parseLocations(JSON.parse(raw));
  } catch (error) {
    console.warn('Failed to load saved locations', error);
    return [defaultLocation];
  }
}

export function loadActiveLocationId() {
  if (typeof window === 'undefined') {
    return defaultLocation.id;
  }
  const stored = localStorage.getItem(ACTIVE_KEY);
  return stored || defaultLocation.id;
}

export function getActiveLocation() {
  const locations = loadSavedLocations();
  const activeId = loadActiveLocationId();
  return (
    locations.find((location) => location.id === activeId) || locations[0]
  );
}

function dispatchLocationsUpdated(locations) {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent('clima-locations-updated', { detail: { locations } })
  );
}

function dispatchActiveLocationChanged(id) {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent('clima-active-location-changed', { detail: { id } })
  );
}

export function persistLocations(locations, activeId) {
  if (typeof window === 'undefined') {
    return { locations: ensureDefault(locations), activeId: defaultLocation.id };
  }

  const sanitized = ensureDefault(locations);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  dispatchLocationsUpdated(sanitized);

  const validActiveId = sanitized.some((loc) => loc.id === activeId)
    ? activeId
    : sanitized[0].id;

  const previousActiveId =
    localStorage.getItem(ACTIVE_KEY) || defaultLocation.id;

  localStorage.setItem(ACTIVE_KEY, validActiveId);
  if (previousActiveId !== validActiveId) {
    dispatchActiveLocationChanged(validActiveId);
  }

  return { locations: sanitized, activeId: validActiveId };
}

export function setActiveLocation(id) {
  if (typeof window === 'undefined') {
    return defaultLocation;
  }
  const locations = loadSavedLocations();
  const validActiveId = locations.some((loc) => loc.id === id)
    ? id
    : locations[0].id;
  const previous = localStorage.getItem(ACTIVE_KEY) || defaultLocation.id;
  localStorage.setItem(ACTIVE_KEY, validActiveId);
  if (previous !== validActiveId) {
    dispatchActiveLocationChanged(validActiveId);
  }
  return locations.find((loc) => loc.id === validActiveId) || locations[0];
}


