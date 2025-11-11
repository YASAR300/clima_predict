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
    // Use reverse geocoding API (you can use OpenWeather geocoding or another service)
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '0248b76a1e11603cd1afcb3d2a90e830'}`
    );
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        return data[0].name;
      }
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Location name error:', error);
    return 'Unknown Location';
  }
};

// Default location (Mumbai)
export const defaultLocation = {
  lat: '19.0760',
  lon: '72.8777',
  city: 'Mumbai',
};

