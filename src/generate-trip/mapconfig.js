export const MAP_CONFIG = {
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry', 'geocoding'],
    language: 'en',
    region: 'US'
  };