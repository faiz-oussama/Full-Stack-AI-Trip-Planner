import { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { AuthContext } from '@/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { fetchPlacePhoto } from '@/utils/fetchPlacePhoto';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavedTrips() {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [cityImages, setCityImages] = useState({});
  const [filterActive, setFilterActive] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const filterRef = useRef(null);
  const [tripToDelete, setTripToDelete] = useState(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterActive(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Trigger animation after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateCards(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchTrips() {
      if (!user) return;
      
      try {
        const response = await axios.get(`http://localhost:5000/user-trips/${user.uid}`);
        
        if (response.data && Array.isArray(response.data.data)) {
          setTrips(response.data.data);
          
          // Add more detailed logging
          console.log('Trips fetched:', response.data.data);
          
          // Fetch images for each destination
          const images = {};
          for (const trip of response.data.data) {
            if (!trip.tripData?.tripDetails?.destination) {
              console.warn('Trip missing destination:', trip);
              continue;
            }
            
            const destinationFull = trip.tripData.tripDetails.destination;
            const destination = destinationFull.split(",")[0];
            
            console.log(`Fetching image for destination: ${destination}`);
            
            if (!images[destination]) {
              try {
                const photoUrl = await fetchPlacePhoto(destination, destinationFull);
                
                console.log(`Photo URL for ${destination}:`, photoUrl);
                
                images[destination] = photoUrl || '/default-city.jpg';
              } catch (err) {
                console.error(`Error fetching image for ${destination}:`, err);
                images[destination] = '/default-city.jpg';
              }
            }
          }
          
          console.log('Fetched city images:', images);
          setCityImages(images);
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Failed to load your saved trips: unexpected data format');
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load your saved trips');
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, [user]);

  const handleViewTrip = (trip) => {
    navigate('/trip-results', { 
      state: { tripPlan: trip.tripData, savedTrip: true }
    });
  };

  const handleTripCardClick = (trip) => {
    setSelectedTrip(trip);
  };

  const closeDetailModal = () => {
    setSelectedTrip(null);
  };

  // Helper function to safely get trip details
  const getSafeValue = (value, defaultValue = '') => {
    // If value is an object with count and type, try to use count
    if (value && typeof value === 'object' && value.count !== undefined) {
      return value.count;
    }
    // If value is undefined or null, return default
    return value || defaultValue;
  };

  const getFilteredTrips = () => {
    if (!trips) return [];
    
    let filteredResults = [...trips];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filteredResults = filteredResults.filter(trip => {
        const destination = getSafeValue(trip.tripData?.tripDetails?.destination, "").toLowerCase();
        const origin = getSafeValue(trip.tripData?.tripDetails?.origin, "").toLowerCase();
        return destination.includes(query) || origin.includes(query);
      });
    }
    
    // Apply category filter
    const currentDate = new Date();
    
    if (filter === 'upcoming') {
      filteredResults = filteredResults.filter(trip => {
        const startDate = trip.tripData?.tripDetails?.dates?.start;
        return startDate && new Date(startDate) > currentDate;
      });
    }
    
    if (filter === 'past') {
      filteredResults = filteredResults.filter(trip => {
        const endDate = trip.tripData?.tripDetails?.dates?.end;
        return endDate && new Date(endDate) < currentDate;
      });
    }
    
    return filteredResults;
  };

  const toggleFilterMenu = () => {
    setFilterActive(!filterActive);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const deleteTrip = (tripId) => {
    setTripToDelete(tripId);
  };

  const confirmDeleteTrip = async () => {
    if (!tripToDelete) return;
    
    try {
      await axios.delete(`http://localhost:5000/trips/${tripToDelete}`);
      setTrips(trips.filter(trip => trip.id !== tripToDelete));
      setTripToDelete(null);
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError('Failed to delete trip');
    }
  };

  const editTrip = (tripId) => {
    navigate(`/edit-trip/${tripId}`);
  };

  const getDurationDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(148,130,255,0.08)_0%,rgba(148,130,255,0.08)_5%,rgba(119,255,238,0.08)_45%,rgba(148,223,255,0.08)_60%,rgba(67,156,255,0.08)_90%)]"></div>
          <svg className="absolute left-0 top-20 w-full opacity-5" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 40 10 M 10 0 L 10 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-indigo-100 z-10"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Your Travel Hub</h2>
            <p className="text-gray-600 mb-6">Sign in to access your personalized travel dashboard and saved adventures.</p>
            <Link 
              to="/login" 
              className="w-full inline-block px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Sign In to Your Account
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Don't have an account? <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">Create one now</Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(148,130,255,0.08)_0%,rgba(148,130,255,0.08)_5%,rgba(119,255,238,0.08)_45%,rgba(148,223,255,0.08)_60%,rgba(67,156,255,0.08)_90%)]"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-center items-center mb-6">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-medium text-indigo-700">Loading your journeys...</span>
          </div>
          <div className="flex space-x-2 justify-center">
            <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredTrips = getFilteredTrips();
  return (
    <div className="min-h-screen bg-white relative overflow-hidden pb-16">
      {/* Creative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(148,130,255,0.08)_0%,rgba(148,130,255,0.08)_5%,rgba(119,255,238,0.08)_45%,rgba(148,223,255,0.08)_60%,rgba(67,156,255,0.08)_90%)]"></div>
        <svg className="absolute left-0 bottom-0 w-full opacity-5" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 40 10 M 10 0 L 10 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        
        {/* Decorative Elements */}
        <div className="absolute top-40 -left-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-60 -right-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 mb-3 leading-tight">Your Travel Collection</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Revisit your planned journeys and dream destinations — all in one beautiful space.</p>
        </motion.div>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {trips.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-gray-600 text-sm mr-2 hidden md:inline">View:</span>
                  <button 
                    onClick={toggleViewMode}
                    className="p-1.5 rounded-md hover:bg-gray-100"
                    title={viewMode === 'grid' ? "Switch to list view" : "Switch to grid view"}
                  >
                    {viewMode === 'grid' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="relative" ref={filterRef}>
                  <button 
                    onClick={toggleFilterMenu}
                    className="flex items-center space-x-1 bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-gray-700">
                      {filter === 'all' ? 'All Trips' : filter === 'upcoming' ? 'Upcoming' : 'Past Trips'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {filterActive && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden"
                      >
                        <ul className="py-1">
                          <li>
                            <button 
                              className={`w-full text-left px-4 py-2.5 hover:bg-indigo-50 ${filter === 'all' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}
                              onClick={() => { setFilter('all'); setFilterActive(false); }}
                            >
                              All Trips
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`w-full text-left px-4 py-2.5 hover:bg-indigo-50 ${filter === 'upcoming' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}
                              onClick={() => { setFilter('upcoming'); setFilterActive(false); }}
                            >
                              Upcoming Trips
                            </button>
                          </li>
                          <li>
                            <button 
                              className={`w-full text-left px-4 py-2.5 hover:bg-indigo-50 ${filter === 'past' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}
                              onClick={() => { setFilter('past'); setFilterActive(false); }}
                            >
                              Past Trips
                            </button>
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <Link 
                  to="/create-trip" 
                  className="flex items-center space-x-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Trip</span>
                </Link>
              </div>
            </div>
            
            {/* Trip count indicator */}
            {(searchQuery || filter !== 'all') && (
              <div className="mt-4 flex items-center">
                <span className="text-sm text-gray-500">
                  Showing {filteredTrips.length} of {trips.length} trips
                </span>
                {(searchQuery || filter !== 'all') && (
                  <button
                    onClick={() => { setSearchQuery(''); setFilter('all'); }}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                  >
                    <span>Clear filters</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
        
        {trips.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-2xl mx-auto border border-indigo-100"
          >
            <div className="mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Your Adventure Collection Awaits</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              This is where all your travel dreams come to life. Create your first trip and start building memories that will last a lifetime.
            </p>
            <Link 
              to="/create-trip" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Plan Your First Adventure
            </Link>
          </motion.div>
        ) : filteredTrips.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-2xl mx-auto border border-gray-100"
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">No matches found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any trips matching your current filters.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setFilter('all'); }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredTrips.map((trip, index) => {
                  // Extract trip details safely
                  const destination = trip.tripData?.tripDetails?.destination || "Unknown Destination";
                  const startDate = trip.tripData?.tripDetails?.dates?.start;
                  const endDate = trip.tripData?.tripDetails?.dates?.end;
                  const description = trip.tripData?.tripDetails?.description || "";
                  const tags = trip.tripData?.tripDetails?.tags || [];
                  
                  // Get destination for image
                  const destinationCity = destination.split(",")[0];
                  const imageUrl = cityImages[destinationCity] || '/default-city.jpg';
                  
                  return (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100 group"
                    >
                      {/* Trip Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={destination}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Status Badge */}
                        {startDate && new Date(startDate) > new Date() ? (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full shadow-sm">
                            Upcoming
                          </div>
                        ) : (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-full shadow-sm">
                            Past
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm p-1.5 flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                editTrip(trip.id);
                              }}
                              className="p-1.5 rounded-full hover:bg-gray-100"
                              title="Edit trip"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                deleteTrip(trip.id);
                              }}
                              className="p-1.5 rounded-full hover:bg-gray-100"
                              title="Delete trip"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Trip Content */}
                      <div className="block p-5" onClick={() => handleViewTrip(trip)}>
                        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{destination}</h3>
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {startDate && new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                            {endDate && ` - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`} 
                            {startDate && endDate && ` · ${getDurationDays(startDate, endDate)} days`}
                          </span>
                        </div>
                        
                        {/* Trip Description */}
                        {description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>
                        )}
                        
                        {/* Tags */}
                        {tags && tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tags.slice(0, 3).map((tag, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {tags.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-50 text-gray-500 rounded-full">
                                +{tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {filteredTrips.map((trip, index) => {
                  // Extract trip details safely
                  const destination = trip.tripData?.tripDetails?.destination || "Unknown Destination";
                  const startDate = trip.tripData?.tripDetails?.dates?.start;
                  const endDate = trip.tripData?.tripDetails?.dates?.end;
                  const description = trip.tripData?.tripDetails?.description || "";
                  const tags = trip.tripData?.tripDetails?.tags || [];
                  
                  // Get destination for image
                  const destinationCity = destination.split(",")[0];
                  const imageUrl = cityImages[destinationCity] || '/default-city.jpg';
                  
                  return (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Trip Image (fixed size for list view) */}
                        <div className="relative w-full md:w-48 h-40 md:h-auto overflow-hidden flex-shrink-0">
                          <div className="w-full h-full md:h-48 md:w-48">
                            <img 
                              src={imageUrl} 
                              alt={destination}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          
                          {/* Status Badge */}
                          {startDate && new Date(startDate) > new Date() ? (
                            <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full shadow-sm">
                              Upcoming
                            </div>
                          ) : (
                            <div className="absolute top-3 left-3 px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-full shadow-sm">
                              Past
                            </div>
                          )}
                        </div>
                        
                        {/* Trip Content */}
                        <div className="p-5 flex-grow flex flex-col" onClick={() => handleViewTrip(trip)}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-bold text-gray-800 mb-1">{destination}</h3>
                              <div className="flex items-center text-gray-500 text-sm mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>
                                  {startDate && new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                                  {endDate && ` - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`} 
                                  {startDate && endDate && ` · ${getDurationDays(startDate, endDate)} days`}
                                </span>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  editTrip(trip.id);
                                }}
                                className="p-2 rounded-full hover:bg-gray-100"
                                title="Edit trip"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  deleteTrip(trip.id);
                                }}
                                className="p-2 rounded-full hover:bg-gray-100"
                                title="Delete trip"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Trip Description */}
                          {description && (
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>
                          )}
                          
                          {/* Tags */}
                          {tags && tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-auto pt-2">
                              {tags.map((tag, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </>
        )}
      </div>
      
      {/* Confirmation Dialog for Trip Deletion */}
      <AnimatePresence>
        {tripToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setTripToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete trip</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{trips.find(t => t.id === tripToDelete)?.destination}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setTripToDelete(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTrip}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}