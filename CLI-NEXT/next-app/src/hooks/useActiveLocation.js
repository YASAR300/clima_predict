'use client';

import { useEffect, useState } from 'react';
import {
  defaultLocation,
  getActiveLocation,
  loadSavedLocations,
} from '@/utils/locationPreferences';

export function useActiveLocation() {
  const [activeLocation, setActiveLocation] = useState(defaultLocation);
  const [allLocations, setAllLocations] = useState([defaultLocation]);

  useEffect(() => {
    const initialise = () => {
      const locations = loadSavedLocations();
      setAllLocations(locations);
      setActiveLocation(getActiveLocation());
    };

    initialise();

    const handleActiveChange = () => {
      setActiveLocation(getActiveLocation());
    };

    const handleLocationsUpdate = () => {
      setAllLocations(loadSavedLocations());
      setActiveLocation(getActiveLocation());
    };

    window.addEventListener(
      'clima-active-location-changed',
      handleActiveChange
    );
    window.addEventListener('clima-locations-updated', handleLocationsUpdate);

    return () => {
      window.removeEventListener(
        'clima-active-location-changed',
        handleActiveChange
      );
      window.removeEventListener(
        'clima-locations-updated',
        handleLocationsUpdate
      );
    };
  }, []);

  return { activeLocation, locations: allLocations };
}


