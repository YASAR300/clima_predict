// Location utilities

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude.toString(),
          lon: position.coords.longitude.toString(),
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

export const getLocationName = async (lat, lon) => {
  try {
    const response = await fetch(
      `/api/weather/geocode/reverse?lat=${lat}&lon=${lon}`
    );
    if (response.ok) {
      const data = await response.json();
      return data?.label || 'Unknown Location';
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Location name error:', error);
    return 'Unknown Location';
  }
};

const envDefault = {
  label: process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LABEL,
  lat: process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LAT,
  lon: process.env.NEXT_PUBLIC_DEFAULT_LOCATION_LON,
};

// Default location (configurable via env, falls back to Mumbai)
export const defaultLocation = {
  lat: envDefault.lat || '19.0760',
  lon: envDefault.lon || '72.8777',
  city: envDefault.label || 'Mumbai, India',
  label: envDefault.label || 'Mumbai, India',
  id: 'default-location',
};

