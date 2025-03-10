import axios from 'axios';

async function fetchPlacePhoto(placeName, location) {
  try {
    const response = await axios.get('http://localhost:5000/api/place-photo', {
      params: { 
        query: placeName, 
        location: location 
      }
    });
    
    return response.data.imageUrl || '/default-city.jpg';
  } catch (error) {
    console.error(`Error fetching photo for ${placeName}:`, error);
    return '/default-city.jpg';
  }
}

export { fetchPlacePhoto };

