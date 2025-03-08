import axios from 'axios';

const GOOGLE_MAPS_API_KEY = "AIzaSyB10DGDrJaB7IauMg99tM97DUH9QC4rcO8";

async function fetchPlacePhoto(placeName, location) {
  try {
    // First, search for the place to get its place_id
    const searchResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
        `${placeName} ${location}`
      )}&inputtype=textquery&fields=place_id,photos&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!searchResponse.data.candidates?.[0]?.photos?.[0]?.photo_reference) {
      return null;
    }

    const photoReference = searchResponse.data.candidates[0].photos[0].photo_reference;
    
    // Then get the actual photo URL
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
  } catch (error) {
    console.error(`Error fetching photo for ${placeName}:`, error);
    return null;
  }
}

export { fetchPlacePhoto };

