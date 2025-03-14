import { GoogleMap, InfoWindow, Marker, MarkerClusterer, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Eye, Filter, Layers, Loader, LocateFixed, Route, Share2, X, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ItineraryPanel } from './ItineraryPanel';
import { MAP_CONFIG } from './mapconfig';

// Add this before your component definition
const getMarkerIcon = (type) => {
    // Custom SVG markers for better visibility
    const iconStyle = {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillOpacity: 0.9,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 10
    };

    switch (type?.toLowerCase()) {
      case 'hotel':
      case 'accommodation':
        return {
          ...iconStyle,
          fillColor: '#3b82f6', // blue-500
          labelOrigin: new window.google.maps.Point(0, -20),
          scale: 12 // Slightly larger for hotels
        };

      case 'restaurant':
      case 'meal':
      case 'cafe':
        return {
          ...iconStyle,
          fillColor: '#f59e0b', // amber-500
          labelOrigin: new window.google.maps.Point(0, -20),
          scale: 8 // Smaller for restaurants
        };

      case 'attraction':
      case 'landmark':
      case 'sight':
        return {
          ...iconStyle,
          fillColor: '#ef4444', // red-500
          labelOrigin: new window.google.maps.Point(0, -20),
          scale: 10
        };

      case 'transport':
      case 'station':
      case 'airport':
        return {
          ...iconStyle,
          fillColor: '#8b5cf6', // violet-500
          labelOrigin: new window.google.maps.Point(0, -20),
          scale: 9
        };

      case 'activity':
      case 'event':
        return {
          ...iconStyle,
          fillColor: '#10b981', // emerald-500
          labelOrigin: new window.google.maps.Point(0, -20),
          scale: 8
        };

      default:
        return {
          ...iconStyle,
          fillColor: '#6b7280', // gray-500
          labelOrigin: new window.google.maps.Point(0, -20)
        };
    }
};
const processLocations = (tripPlan) => {
  const locations = [];

  // Process hotels
  tripPlan?.accommodation?.hotels?.forEach(hotel => {
    locations.push({
      name: hotel.name,
      description: hotel.description || hotel.address,
      type: 'hotel',
      position: hotel.coordinates ? {
        lat: parseFloat(hotel.coordinates.latitude),
        lng: parseFloat(hotel.coordinates.longitude)
      } : null,
      day: 'Accommodation'
    });
  });

  // Process attractions
  tripPlan?.attractions?.forEach(attraction => {
    locations.push({
      name: attraction.name,
      description: attraction.details,
      type: 'attraction',
      position: attraction.coordinates ? {
        lat: parseFloat(attraction.coordinates.latitude),
        lng: parseFloat(attraction.coordinates.longitude)
      } : null,
      day: 'Points of Interest'
    });
  });

  // Process daily activities and meals
  tripPlan?.dailyPlan?.forEach(day => {
    // Process activities
    day.activities?.forEach(activity => {
      if (activity.location && activity.location !== 'N/A') {
        locations.push({
          name: activity.activity,
          description: `${activity.time} - ${activity.location}`,
          type: activity.transport === 'N/A' ? 'activity' : 'transport',
          position: null, // Will be geocoded
          originalLocation: activity.location,
          day: `Day ${day.day} - ${day.date || ''}`
        });
      }
    });

    // Process meals
    day.meals?.forEach(meal => {
      locations.push({
        name: meal.restaurant,
        description: `${meal.mealType} - ${meal.time}\n${meal.cuisineType?.join(', ')}`,
        type: 'restaurant',
        position: null, // Will be geocoded
        originalLocation: meal.location,
        day: `Day ${day.day} - ${day.date || ''}`
      });
    });
  });

  return locations;
};

export default function TripMapModal({ isOpen, onClose, tripPlan }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [geocodingQueue, setGeocodingQueue] = useState([]);
  const [geocodedLocations, setGeocodedLocations] = useState([]);
  const [activeDay, setActiveDay] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  const [showItinerary, setShowItinerary] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const mapRef = useRef(null);
  const totalLocationsToGeocode = useRef(0);

  // Load Google Maps API using shared config
  const { isLoaded } = useJsApiLoader(MAP_CONFIG);

  // Extract trip locations from the tripPlan
  useEffect(() => {
    if (isOpen && tripPlan && isLoaded) {
      const initialLocations = processLocations(tripPlan);
      const locationsToGeocode = initialLocations.filter(loc => !loc.position);
      totalLocationsToGeocode.current = locationsToGeocode.length;
      
      // Set locations with coordinates directly
      const locationsWithCoords = initialLocations.filter(loc => loc.position);
      setGeocodedLocations(locationsWithCoords);
      
      // Queue locations without coordinates for geocoding
      setGeocodingQueue(locationsToGeocode);

      // Geocode the destination for map center
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { address: tripPlan.tripDetails.destination },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            setMapCenter({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            });
          } else {
            console.error('Geocoding failed:', status);
          }
        }
      );
    }
  }, [isOpen, tripPlan, isLoaded]);

  // Move geocodeLocation inside component to access tripPlan
  const geocodeLocation = async (location) => {
    if (!window.google?.maps?.Geocoder) {
      console.error("Google Maps Geocoder not loaded");
      return null;
    }

    const geocoder = new window.google.maps.Geocoder();

    try {
      const { results } = await geocoder.geocode({
        address: `${location.originalLocation}, ${tripPlan?.tripDetails?.destination}`
      });

      if (results && results[0]) {
        return {
          ...location,
          position: {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          }
        };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    return location;
  };

  // Add a geocoding effect
  useEffect(() => {
    if (geocodingQueue.length > 0 && isLoaded) {
      const progress = ((totalLocationsToGeocode.current - geocodingQueue.length) / totalLocationsToGeocode.current) * 100;
      setGeocodingProgress(progress);
      const geocodeNext = async () => {
        const location = geocodingQueue[0];
        const geocodedLocation = await geocodeLocation(location);
        
        if (geocodedLocation?.position) {
          setGeocodedLocations(prev => [...prev, geocodedLocation]);
        }
        
        setGeocodingQueue(prev => prev.slice(1));
      };

      // Add delay to respect API rate limits
      const timer = setTimeout(geocodeNext, 500);
      return () => clearTimeout(timer);
    }
  }, [geocodingQueue, isLoaded, tripPlan]);

  const locations = [...geocodedLocations];
  // Rest of your geocoding logic...

  // Filter locations based on active day and filter type
  const filteredLocations = locations.filter(location => {
    // Filter by day if activeDay is set
    if (activeDay && !location.day.includes(`Day ${activeDay}`)) {
      return false;
    }
    
    // Filter by type
    if (filterType !== 'all') {
      return location.type === filterType;
    }
    
    return true;
  });

  // Handle map load
  const onMapLoad = (map) => {
    setMapInstance(map);
    mapRef.current = map;
    setMapLoaded(true);
    
    // Fit bounds to include all markers
    if (filteredLocations.length > 1 && map) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredLocations.forEach(location => {
        if (location.position) {
          bounds.extend(location.position);
        }
      });
      map.fitBounds(bounds);
    }
  };
  
  // Handle day selection
  const handleDaySelect = (day) => {
    // Toggle day if it's already selected
    setActiveDay(activeDay === day ? null : day);
    
    // Filter locations for the selected day
    const dayLocations = locations.filter(loc => loc.day.includes(`Day ${day}`));
    
    if (dayLocations.length > 0 && mapInstance) {
      // Fit map to show all day locations
      const bounds = new window.google.maps.LatLngBounds();
      dayLocations.forEach(loc => {
        if (loc.position) bounds.extend(loc.position);
      });
      mapInstance.fitBounds(bounds);
      
      // Show toast
      showToastMessage(`Showing Day ${day} locations`);
    }
  };
  
  // Handle map type change
  const toggleMapType = () => {
    const types = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
    showToastMessage(`Map type: ${types[nextIndex]}`);
  };
  
  // Handle filter change
  const handleFilterChange = (type) => {
    setFilterType(type);
    showToastMessage(`Filtering: ${type === 'all' ? 'All locations' : type + 's'}`);
  };
  
  // Handle map capture
  const captureMap = () => {
    setIsCapturing(true);
    showToastMessage("Preparing map capture...");
    
    // Hide UI elements for the screenshot
    setShowItinerary(false);
    
    // Allow time for UI to update
    setTimeout(() => {
      // Use html2canvas or similar library to capture the map
      // This is just a placeholder for the concept
      console.log("Map would be captured here");
      setIsCapturing(false);
      setShowItinerary(true);
      showToastMessage("Map captured! (Demo only)");
    }, 1000);
  };
  
  // Show toast message
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Share map (demo functionality)
  const shareMap = () => {
    if (navigator.share) {
      navigator.share({
        title: `Trip Map: ${tripPlan?.tripDetails?.destination}`,
        text: `Check out my ${tripPlan?.tripDetails?.duration?.days}-day trip to ${tripPlan?.tripDetails?.destination}!`,
        url: window.location.href,
      })
      .then(() => showToastMessage("Shared successfully!"))
      .catch(() => showToastMessage("Sharing cancelled"));
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href)
        .then(() => showToastMessage("Map link copied to clipboard!"));
    }
  };
  
  // Add this function at component level
  const calculateTripStats = () => {
    let totalDistance = 0;
    let visitedLocations = 0;
  
    tripPlan?.dailyPlan?.forEach(day => {
      const dayLocations = locations.filter(
        loc => loc.day.includes(`Day ${day.day}`) && loc.position
      ).sort((a, b) => {
        const timeA = a.description?.match(/(\d{1,2}:\d{2})/)?.[1] || '';
        const timeB = b.description?.match(/(\d{1,2}:\d{2})/)?.[1] || '';
        return timeA.localeCompare(timeB);
      });
  
      visitedLocations += dayLocations.length;
  
      // Calculate distance between consecutive points
      for (let i = 1; i < dayLocations.length; i++) {
        const prevPos = dayLocations[i - 1].position;
        const currPos = dayLocations[i].position;
        totalDistance += google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(prevPos.lat, prevPos.lng),
          new google.maps.LatLng(currPos.lat, currPos.lng)
        );
      }
    });
  
    return {
      totalKm: (totalDistance / 1000).toFixed(1),
      locations: visitedLocations
    };
  };
  
  // Update your trip summary card
  const tripStats = calculateTripStats();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative w-full max-w-5xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {tripPlan?.tripDetails?.destination || "Trip Map"}
                </h3>
                {activeDay && (
                  <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-md">
                    Day {activeDay}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareMap}
                  className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={captureMap}
                  className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMapType}
                  className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowItinerary(!showItinerary)}
                  className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                >
                  {showItinerary ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
            
            {/* Day selector */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-1"
              >
                {tripPlan?.dailyPlan?.map((day) => (
                  <motion.button
                    key={day.day}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDaySelect(day.day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium mx-0.5
                      ${activeDay === day.day 
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm' 
                        : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    {day.day}
                  </motion.button>
                ))}
                {activeDay && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveDay(null)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 ml-1"
                  >
                    All
                  </motion.button>
                )}
              </motion.div>
            </div>
            
            {/* Map controls */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col space-y-3">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-1 flex flex-col"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 10) + 1)}
                  className="p-2 hover:bg-gray-100 rounded-md text-gray-700"
                >
                  <ZoomIn className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 10) - 1)}
                  className="p-2 hover:bg-gray-100 rounded-md text-gray-700"
                >
                  <ZoomOut className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                          };
                          mapInstance?.panTo(userLocation);
                          mapInstance?.setZoom(14);
                          showToastMessage("Located your current position");
                        },
                        () => {
                          showToastMessage("Unable to access your location");
                        }
                      );
                    } else {
                      showToastMessage("Geolocation is not supported by your browser");
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-md text-gray-700"
                >
                  <LocateFixed className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
            
            {/* Filter controls */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-20 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-3 bg-indigo-50 border-b border-indigo-100">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-indigo-700 mr-2" />
                  <span className="text-xs font-medium text-indigo-800">Filter Locations</span>
                </div>
              </div>
              <div className="flex flex-col p-2 space-y-1">
                {['all', 'attraction', 'hotel', 'restaurant', 'activity'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange(type)}
                    className={`text-xs py-1.5 px-3 rounded-md ${
                      filterType === type 
                        ? 'bg-indigo-100 text-indigo-800 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {type === 'all' ? 'All Locations' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Toast notification */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 px-4 py-2 bg-gray-900/80 text-white text-sm rounded-lg"
                >
                  {toastMessage}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Map Container */}
            <div className="w-full h-full">
              {!isLoaded || !mapCenter ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50">
                  <Loader className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                  <p className="text-indigo-700 font-medium">Loading map...</p>
                  {geocodingProgress > 0 && geocodingProgress < 100 && (
                    <div className="mt-4 w-64">
                      <div className="text-sm text-indigo-600 mb-2 text-center">
                        Geocoding locations: {Math.round(geocodingProgress)}%
                      </div>
                      <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${geocodingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <GoogleMap
                  ref={mapRef}
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={10}
                  mapTypeId={mapType}
                  options={{
                    mapTypeControl: false,
                    fullscreenControl: false,
                    streetViewControl: true,
                    zoomControl: false,
                    styles: [
                      {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [
                          { color: "#e9e9e9" },
                          { lightness: 17 }
                        ]
                      },
                      {
                        featureType: "landscape",
                        elementType: "geometry",
                        stylers: [
                          { color: "#f5f5f5" },
                          { lightness: 20 }
                        ]
                      },
                      {
                        featureType: "road.highway",
                        elementType: "geometry.fill",
                        stylers: [
                          { color: "#ffffff" },
                          { lightness: 17 }
                        ]
                      },
                      {
                        featureType: "poi",
                        elementType: "geometry",
                        stylers: [
                          { color: "#f5f5f5" },
                          { lightness: 21 }
                        ]
                      },
                    ],
                  }}
                  onLoad={onMapLoad}
                >
                  <MarkerClusterer
                    options={{
                      gridSize: 50,
                      minimumClusterSize: 3,
                      styles: [
                        {
                          textColor: 'white',
                          url: '/map-icons/cluster-1.png',
                          height: 35,
                          width: 35,
                        },
                        {
                          textColor: 'white',
                          url: '/map-icons/cluster-2.png',
                          height: 40,
                          width: 40,
                        },
                        {
                          textColor: 'white',
                          url: '/map-icons/cluster-3.png',
                          height: 45,
                          width: 45,
                        },
                      ],
                    }}
                  >
                    {(clusterer) => 
                      filteredLocations.map((location, index) => (
                        location.position && (
                          <Marker
                            key={`${location.name}-${index}`}
                            position={location.position}
                            title={location.name}
                            icon={getMarkerIcon(location.type)}
                            onClick={() => setSelectedLocation(location)}
                            animation={selectedLocation === location ? window.google.maps.Animation.BOUNCE : null}
                            label={{
                              text: location.name,
                              color: '#374151', // text-gray-700
                              fontSize: '12px',
                              fontWeight: '500',
                              className: `marker-label ${selectedLocation === location ? 'visible' : ''}`
                            }}
                            onMouseOver={() => {
                              setSelectedLocation(location);
                              if (mapInstance) {
                                mapInstance.panTo(location.position);
                              }
                            }}
                            clusterer={clusterer}
                          />
                        )
                      ))
                    }
                  </MarkerClusterer>
                  
                  {/* Path lines for each day */}
                  {tripPlan?.dailyPlan?.map((day, dayIndex) => {
                    // Skip if filtering by day and this isn't the active day
                    if (activeDay && day.day !== activeDay) return null;
                    
                    // Get all locations for this day that have positions
                    const dayLocations = locations.filter(
                      loc => loc.day === `Day ${day.day} - ${day.date || ""}` && loc.position
                    );
                    
                    // Create path coordinates
                    const path = dayLocations.map(loc => loc.position);
                    
                    // Only draw path if there are at least 2 points
                    if (path.length >= 2) {
                      return (
                        <Polyline
                          key={`path-day-${day.day}`}
                          path={path}
                          options={{
                            strokeColor: dayIndex === 0 ? '#4f46e5' : 
                                        dayIndex === 1 ? '#7c3aed' : 
                                        dayIndex === 2 ? '#a855f7' : '#c026d3',
                            strokeOpacity: 0.7,
                            strokeWeight: 4,
                          }}
                        />
                      );
                    }
                    return null;
                  })}
                  
                  {/* Info window for selected location */}
                  {selectedLocation && selectedLocation.position && (
                    <InfoWindow
                      position={selectedLocation.position}
                      onCloseClick={() => setSelectedLocation(null)}
                    >
                      <div className="p-2 max-w-xs">
                        <h4 className="font-semibold text-gray-900">{selectedLocation.name}</h4>
                        {selectedLocation.description && (
                          <p className="text-sm text-gray-600 mt-1">{selectedLocation.description}</p>
                        )}
                        {selectedLocation.day && (
                          <div className="mt-2 text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full inline-block">
                            {selectedLocation.day}
                          </div>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                  
                  {/* Add itinerary panel */}
                  {showItinerary && !isCapturing && (
                    <ItineraryPanel 
                      locations={filteredLocations} 
                      onSelectLocation={(location) => {
                        setSelectedLocation(location);
                        if (location.position && mapInstance) {
                          mapInstance.panTo(location.position);
                          mapInstance.setZoom(15);
                        }
                      }} 
                      tripPlan={tripPlan}
                    />
                  )}
                  {/* Daily Route Lines */}
                  {tripPlan?.dailyPlan?.map((day, dayIndex) => {
                    if (activeDay && day.day !== activeDay) return null;
                    
                    const dayLocations = locations.filter(
                      loc => loc.day.includes(`Day ${day.day}`) && loc.position
                    ).sort((a, b) => {
                      // Sort by time if available
                      const timeA = a.description?.match(/(\d{1,2}:\d{2})/)?.[1] || '';
                      const timeB = b.description?.match(/(\d{1,2}:\d{2})/)?.[1] || '';
                      return timeA.localeCompare(timeB);
                    });
              
                    const path = dayLocations.map(loc => loc.position);
              
                    if (path.length >= 2) {
                      return (
                        <React.Fragment key={`route-day-${day.day}`}>
                          <Polyline
                            path={path}
                            options={{
                              strokeColor: [
                                '#4f46e5', // indigo-600
                                '#7c3aed', // violet-600
                                '#a855f7', // purple-500
                                '#ec4899', // pink-500
                                '#f43f5e', // rose-500
                              ][dayIndex % 5],
                              strokeOpacity: 0.7,
                              strokeWeight: 4,
                              geodesic: true
                            }}
                          />
                          {/* Route markers for each segment */}
                          {path.map((point, idx) => {
                            if (idx === 0) return null; // Skip first point
                            const prevPoint = path[idx - 1];
                            const midPoint = {
                              lat: (prevPoint.lat + point.lat) / 2,
                              lng: (prevPoint.lng + point.lng) / 2
                            };
                            return (
                              <Marker
                                key={`route-marker-${day.day}-${idx}`}
                                position={midPoint}
                                icon={{
                                  path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                  scale: 3,
                                  strokeWeight: 2,
                                  strokeColor: '#ffffff',
                                  fillColor: '#4f46e5',
                                  fillOpacity: 0.9,
                                  rotation: google.maps.geometry.spherical.computeHeading(prevPoint, point)
                                }}
                              />
                            );
                          })}
                        </React.Fragment>
                      );
                    }
                    return null;
                  })}
                </GoogleMap>
              )}
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
              <div className="text-xs font-semibold mb-2 text-gray-700">Trip Locations</div>
              <div className="space-y-2">
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>Attractions</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>Hotels</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                  <span>Restaurants</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Activities</span>
                </div>
              </div>
            </div>
            
            {/* Trip summary card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100 p-3 flex items-center space-x-4"
            >
              <Route className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="text-xs text-gray-600">Total Trip Distance</div>
                <div className="text-sm font-semibold text-gray-900">~ {tripStats.totalKm} km</div>
              </div>
              <div className="h-8 w-px bg-gray-200 mx-2"></div>
              <div>
                <div className="text-xs text-gray-600">Locations</div>
                <div className="text-sm font-semibold text-gray-900">{tripStats.locations}</div>
              </div>
              <div className="h-8 w-px bg-gray-200 mx-2"></div>
              <div>
                <div className="text-xs text-gray-600">Trip Duration</div>
                <div className="text-sm font-semibold text-gray-900">{tripPlan?.tripDetails?.duration?.days || 0} Days</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Keep your existing helper functions...