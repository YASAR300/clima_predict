'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  defaultLocation,
  loadActiveLocationId,
  loadSavedLocations,
  persistLocations,
  setActiveLocation,
} from '@/utils/locationPreferences';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [savedLocations, setSavedLocations] = useState([defaultLocation]);
  const [activeLocationId, setActiveLocationId] = useState(defaultLocation.id);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const locations = loadSavedLocations();
    const activeId = loadActiveLocationId();
    const validActive = locations.some((loc) => loc.id === activeId)
      ? activeId
      : locations[0].id;
    setSavedLocations(locations);
    setActiveLocationId(validActive);

    const handleLocationsUpdated = (event) => {
      const { locations: updated } = event.detail || {};
      if (updated) {
        setSavedLocations(updated);
      }
    };
    const handleActiveUpdated = (event) => {
      if (event.detail?.id) {
        setActiveLocationId(event.detail.id);
      }
    };

    window.addEventListener('clima-locations-updated', handleLocationsUpdated);
    window.addEventListener(
      'clima-active-location-changed',
      handleActiveUpdated
    );

    return () => {
      window.removeEventListener(
        'clima-locations-updated',
        handleLocationsUpdated
      );
      window.removeEventListener(
        'clima-active-location-changed',
        handleActiveUpdated
      );
    };
  }, []);

  const displayName = useCallback(
    (location) => location.customName?.trim() || location.label,
    []
  );

  const applyLocationChanges = useCallback(
    (locations, nextActiveId = activeLocationId) => {
      const result = persistLocations(locations, nextActiveId);
      setSavedLocations(result.locations);
      setActiveLocationId(result.activeId);
      return result;
    },
    [activeLocationId]
  );

  const toggleAddLocationPanel = () => {
    setShowAddLocation((prev) => {
      const next = !prev;
      if (!next) {
        setSearchQuery('');
        setSearchResults([]);
        setSearchError('');
      }
      return next;
    });
  };

  const handleSearchLocations = async (event) => {
    event?.preventDefault();
    if (!searchQuery.trim()) {
      setSearchError('Enter a city, town, or place name to search.');
      setSearchResults([]);
      return;
    }
    setSearchError('');
    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/weather/geocode?query=${encodeURIComponent(searchQuery.trim())}`
      );
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || 'Search failed.');
      }
      const results = await response.json();
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No matches found. Try a nearby city or adjust spelling.');
      }
    } catch (error) {
      setSearchError(error.message || 'Unable to search locations right now.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddLocation = (result) => {
    const exists = savedLocations.some(
      (loc) => loc.lat === String(result.lat) && loc.lon === String(result.lon)
    );
    if (exists) {
      setFeedback({
        type: 'warning',
        message: `${result.label} is already in your saved locations.`,
      });
      return;
    }

    const newLocation = {
      id: `loc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      label: result.label,
      lat: String(result.lat),
      lon: String(result.lon),
      customName: '',
    };
    applyLocationChanges([...savedLocations, newLocation], newLocation.id);
    setFeedback({
      type: 'success',
      message: `${result.label} added and set as active.`,
    });
    setShowAddLocation(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
  };

  const handleSetActive = (locationId) => {
    const active = setActiveLocation(locationId);
    setActiveLocationId(active.id);
    setFeedback({
      type: 'success',
      message: `Switched weather data to ${displayName(active)}.`,
    });
  };

  const handleStartEdit = (location) => {
    setEditingId(location.id);
    setEditingValue(displayName(location));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const trimmed = editingValue.trim();
    const updated = savedLocations.map((loc) =>
      loc.id === editingId ? { ...loc, customName: trimmed } : loc
    );
    applyLocationChanges(updated);
    setFeedback({
      type: 'success',
      message: 'Location name updated.',
    });
    setEditingId(null);
    setEditingValue('');
  };

  const handleDeleteLocation = (location) => {
    if (location.id === defaultLocation.id) {
      setFeedback({
        type: 'warning',
        message: 'The default location cannot be removed.',
      });
      return;
    }
    const updated = savedLocations.filter((loc) => loc.id !== location.id);
    const nextActive =
      activeLocationId === location.id ? defaultLocation.id : activeLocationId;
    applyLocationChanges(updated, nextActive);
    setFeedback({
      type: 'success',
      message: `${displayName(location)} removed.`,
    });
  };

  const feedbackColor = useMemo(() => {
    if (!feedback) return 'text-[#B0B0B0]';
    if (feedback.type === 'success') return 'text-[#00D09C]';
    if (feedback.type === 'warning') return 'text-[#FFC857]';
    return 'text-[#FF6B35]';
  }, [feedback]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="max-w-md mx-auto">
        <header className="px-5 pt-5 pb-4 flex items-center gap-4">
          <Link href="/profile" className="p-2">
            <span className="text-xl">←</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">App Settings</h1>
        </header>

        <div className="px-5 space-y-4 pb-10">
          <div className="bg-[#252525] rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">
              Notifications
            </h2>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-white">
                  Push Notifications
                </div>
                <div className="text-xs text-[#B0B0B0]">
                  Receive weather alerts
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-[#00D09C]' : 'bg-[#707070]'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                ></div>
              </button>
            </div>
          </div>

          <div className="bg-[#252525] rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">
              Location Services
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">
                  Use device location
                </div>
                <div className="text-xs text-[#B0B0B0]">
                  Enable GPS to detect your current position
                </div>
              </div>
              <button
                onClick={() => setLocationServices(!locationServices)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  locationServices ? 'bg-[#00D09C]' : 'bg-[#707070]'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    locationServices ? 'translate-x-6' : 'translate-x-1'
                  }`}
                ></div>
              </button>
            </div>
          </div>

          <div className="bg-[#252525] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Saved Locations
                </h2>
                <p className="text-xs text-[#B0B0B0]">
                  Manage cities used across the app
                </p>
              </div>
              <button
                onClick={toggleAddLocationPanel}
                className="text-xs font-semibold bg-[#00D09C] text-[#0D0D0D] px-3 py-2 rounded-xl hover:bg-[#00b886] transition-colors"
              >
                {showAddLocation ? 'Close' : 'Add'}
              </button>
            </div>

            {feedback && (
              <div
                className={`text-xs ${feedbackColor} bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-3`}
              >
                {feedback.message}
              </div>
            )}

            <div className="space-y-3">
              {savedLocations.map((location) => {
                const isActive = location.id === activeLocationId;
                const isEditing = editingId === location.id;
                return (
                  <div
                    key={location.id}
                    className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              value={editingValue}
                              onChange={(event) =>
                                setEditingValue(event.target.value)
                              }
                              className="w-full bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00D09C]"
                              placeholder="Location name"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="flex-1 bg-[#00D09C] text-[#0D0D0D] text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#00b886] transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex-1 bg-[#333333] text-white/80 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#444444] transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-white truncate">
                                {displayName(location)}
                              </p>
                              {isActive && (
                                <span className="text-[10px] uppercase tracking-wide bg-[#00D09C]/20 text-[#00D09C] px-2 py-1 rounded-full">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#707070] truncate">
                              {location.label}
                            </p>
                            <p className="text-[11px] text-[#505050] mt-1">
                              {location.lat}, {location.lon}
                            </p>
                          </>
                        )}
                      </div>
                      {!isEditing && (
                        <div className="flex flex-col gap-2">
                          {!isActive && (
                            <button
                              onClick={() => handleSetActive(location.id)}
                              className="text-[11px] font-semibold bg-[#00D09C] text-[#0D0D0D] px-2.5 py-1.5 rounded-lg hover:bg-[#00b886] transition-colors"
                            >
                              Set Active
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEdit(location)}
                            className="text-[11px] font-semibold bg-[#333333] text-white/80 px-2.5 py-1.5 rounded-lg hover:bg-[#444444] transition-colors"
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(location)}
                            className="text-[11px] font-semibold bg-[#2B1A1A] text-[#FF6B35] px-2.5 py-1.5 rounded-lg hover:bg-[#422323] transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {showAddLocation && (
              <div className="mt-4 border border-white/10 rounded-xl bg-[#1A1A1A]">
                <form onSubmit={handleSearchLocations} className="p-4 space-y-3">
                  <div className="text-sm font-semibold text-white">
                    Add a location
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search by city or place name"
                      className="flex-1 bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00D09C]"
                    />
                    <button
                      type="submit"
                      disabled={searchLoading}
                      className="text-xs font-semibold bg-[#00D09C] text-[#0D0D0D] px-3 py-2 rounded-lg hover:bg-[#00b886] transition-colors disabled:opacity-60"
                    >
                      {searchLoading ? 'Searching…' : 'Search'}
                    </button>
                  </div>
                  {searchError && (
                    <p className="text-xs text-[#FF6B35]">{searchError}</p>
                  )}
                </form>

                {searchResults.length > 0 && (
                  <div className="border-t border-white/10">
                    <div className="max-h-60 overflow-y-auto divide-y divide-white/10">
                      {searchResults.map((result) => (
                        <div
                          key={`${result.lat}-${result.lon}`}
                          className="px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-white font-semibold truncate">
                              {result.label}
                            </p>
                            <p className="text-xs text-[#707070]">
                              {result.lat}, {result.lon}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddLocation(result)}
                            className="text-xs font-semibold bg-[#00D09C] text-[#0D0D0D] px-3 py-1.5 rounded-lg hover:bg-[#00b886] transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#252525] rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">Units</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-[#1A1A1A] rounded-xl">
                <div className="text-sm font-medium text-white">
                  Temperature: Celsius
                </div>
              </button>
              <button className="w-full text-left p-3 bg-[#1A1A1A] rounded-xl">
                <div className="text-sm font-medium text-white">
                  Wind Speed: km/h
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

