import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, Plane } from 'lucide-react';
import { useEffect, useState } from 'react';

// Helper function to get airport code from city name
function getAirportCode(cityName) {
  // This is a simplified mapping - in a real app you would use an airports API or database
  const airportMap = {
    'Marrakech': 'RAK',
    'Casablanca': 'CMN',
    'Fes': 'FEZ',
    'Rabat': 'RBA',
    'Tangier': 'TNG',
    'Agadir': 'AGA',
    'Ouarzazate': 'OZZ',
    'Essaouira': 'ESU',
    'Nador': 'NDR',
    'Oujda': 'OUD',
    'Dakhla': 'VIL',
    'Al Hoceima': 'AHU',
    'Tetouan': 'TTU',
    'Laayoune': 'EUN',
    'Errachidia': 'ERH',
    'Zagora': 'ZAG',
    'Beni Mellal': 'BEM',
    'Guelmim': 'GLN',
    'Tan Tan': 'TTA',
  };
  
  // Try to find the city in our mapping
  const cityKey = Object.keys(airportMap).find(key => 
    cityName.toLowerCase().includes(key.toLowerCase())
  );
  
  // Return the airport code or a default
  return cityKey ? airportMap[cityKey] : cityName.substring(0, 3).toUpperCase();
}

// Helper function to format flight duration
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// Helper function to format time
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function FlightSearchResults({ origin, destination }) {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlights = async () => {
      if (!origin || !destination) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get airport codes for origin and destination
        const originCode = `${getAirportCode(origin)}.AIRPORT`;
        const destCode = `${getAirportCode(destination)}.AIRPORT`;
        
        // Set departure date to a month from now
        const departureDate = new Date();
        departureDate.setDate(departureDate.getDate() + 30);
        const formattedDate = departureDate.toLocaleDateString('en-CA');
        console.log(`Departure date: ${formattedDate}`);
        const options = {
          method: 'GET',
          url: 'https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights',
          params: {
            fromId: originCode,
            toId: destCode,
            departDate: formattedDate,
            pageNo: '1',
            adults: '1',
            children: '0',
            sort: 'BEST',
            cabinClass: 'ECONOMY',
            currency_code: 'MAD'
          },
          headers: {
            'x-rapidapi-key': '34ef06ebe7mshb328da340021f84p1b40e8jsn9bd024b73686',
            'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
          }
        };

        const requestUrl = `https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?fromId=${originCode}&toId=${destCode}&departDate=${formattedDate}&pageNo=1&adults=1&children=0&sort=BEST&cabinClass=ECONOMY&currency_code=MAD`;
        console.log("Request URL:", requestUrl);
        
        const response = await axios.request(options);
        console.log("API response:", response.data); // Log the full response
        
        // Check if response data might be review data instead of flights
        if (response.data && response.data.data && Array.isArray(response.data.data) && 
            response.data.data.length > 0 && response.data.data[0].hasOwnProperty('numericRating')) {
          console.log("Received review data instead of flight data");
          throw new Error('Invalid API response: received reviews instead of flights');
        }
        
        // Check for expected flight data structure
        if (response.data && response.data.data && response.data.data.flightDeals) {
          setFlights(response.data.data.flightDeals.slice(0, 3)); // Take first 3 flights only
        } else {
          // If API returns unexpected format, use fallback data
          throw new Error('Unexpected API response format');
        }
      } catch (err) {
        console.error("Error fetching flight data:", err);
        
        // Create a more user-friendly error message
        const errorMessage = "Unable to fetch real flight data at this time";
        setError(errorMessage);
        
        // Always create fallback data when API fails
        const fallbackDepartureDate = new Date();
        fallbackDepartureDate.setDate(fallbackDepartureDate.getDate() + 30);
        const fallbackDateStr = fallbackDepartureDate.toISOString().split('T')[0];
        
        // Set more realistic fallback data for Morocco flights
        setFlights([
          {
            id: 'f1',
            price: { amount: 189, currencyCode: 'EUR' },
            segments: [
              {
                departureTime: `${fallbackDateStr}T08:30:00`,
                arrivalTime: `${fallbackDateStr}T10:45:00`,
                duration: 135,
                departureAirport: { code: getAirportCode(origin) },
                arrivalAirport: { code: getAirportCode(destination) },
                marketingAirline: { name: 'Royal Air Maroc' },
                flightNumber: 'AT202'
              }
            ]
          },
          {
            id: 'f2',
            price: { amount: 172, currencyCode: 'EUR' },
            segments: [
              {
                departureTime: `${fallbackDateStr}T14:20:00`,
                arrivalTime: `${fallbackDateStr}T16:05:00`,
                duration: 105,
                departureAirport: { code: getAirportCode(origin) },
                arrivalAirport: { code: getAirportCode(destination) },
                marketingAirline: { name: 'Air Arabia Maroc' },
                flightNumber: 'G9573'
              }
            ]
          },
          {
            id: 'f3',
            price: { amount: 210, currencyCode: 'EUR' },
            segments: [
              {
                departureTime: `${fallbackDateStr}T16:45:00`,
                arrivalTime: `${fallbackDateStr}T18:40:00`,
                duration: 115,
                departureAirport: { code: getAirportCode(origin) },
                arrivalAirport: { code: getAirportCode(destination) },
                marketingAirline: { name: 'TUI fly Maroc' },
                flightNumber: 'TB319'
              }
            ]
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlights();
  }, [origin, destination]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-600 font-medium">Searching for the best flights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center mb-3">
          <AlertCircle className="text-rose-500 mr-2" />
          <h3 className="text-rose-700 font-medium">Unable to load flights</h3>
        </div>
        <p className="text-rose-600 text-sm">We're working on getting the latest flight information.</p>
      </div>
    );
  }

  if (!flights || flights.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <div className="flex flex-col items-center">
          <Plane className="text-slate-400 mb-3 h-10 w-10" />
          <h3 className="text-slate-700 font-medium">No flights found</h3>
          <p className="text-slate-500 mt-2">Try changing your departure or arrival cities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {flights.map((flight, index) => {
        // Get first segment for display (handling both API and fallback data formats)
        const segment = flight.segments && flight.segments[0];
        if (!segment) return null;
        
        return (
          <motion.div
            key={flight.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-indigo-100 p-5 hover:shadow-md transition-all duration-300"
          >
            {/* Flight header with airline and price */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Plane className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {segment.marketingAirline?.name || 'Airline'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {segment.flightNumber || `Flight #${index + 100}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  {flight.price.amount} {flight.price.currencyCode}
                </div>
                <div className="text-xs text-gray-500">per person</div>
              </div>
            </div>
            
            {/* Flight route visualization */}
            <div className="flex items-center justify-between mb-5">
              <div className="text-center w-1/4">
                <div className="text-gray-900 font-semibold">
                  {formatTime(segment.departureTime)}
                </div>
                <div className="text-sm text-gray-600">
                  {segment.departureAirport.code}
                </div>
              </div>
              
              <div className="w-2/4 flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-2">
                  {formatDuration(segment.duration)}
                </div>
                <div className="w-full h-px bg-gray-200 relative">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-600"></div>
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Plane className="h-3 w-3 text-indigo-500 transform -rotate-45" />
                  </div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-600"></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Direct
                </div>
              </div>
              
              <div className="text-center w-1/4">
                <div className="text-gray-900 font-semibold">
                  {formatTime(segment.arrivalTime)}
                </div>
                <div className="text-sm text-gray-600">
                  {segment.arrivalAirport.code}
                </div>
              </div>
            </div>
            
            {/* Book button */}
            <div className="flex justify-end mt-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 text-sm font-medium text-white rounded-xl
                         bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md
                         hover:shadow-lg focus:outline-none transition-all duration-300"
              >
                Book Now
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}