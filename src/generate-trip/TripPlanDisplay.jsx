import { AuthContext } from '@/auth/AuthProvider';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Banknote, Building2, Calendar, Car, Clock, MapPin, Plane, Train, Utensils } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchCityImage } from '../utils/fetchCityImage';
import AttractionCard from './AttractionCard';
import DayPlan from './DayPlan';
import FlightSearchResults from './FlightSearchResults';
import HotelCard from './HotelCard';
import JourneyMap from './JourneyMap';
import MealCard from './MealCard';
import TripMapModal from './TripMapModal';


export default function TripPlanDisplay(props) {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);;
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const location = useLocation();
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const { tripPlan, savedTrip } = location.state || {};

  console.log(savedTrip)
  const handleSaveTrip = async () => {
    if (!user) {
      // Handle not logged in case
      alert("Please log in to save this trip");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Log the data being sent
      console.log('Saving trip with data:', {
        tripData: tripPlan,
        userId: user.uid,
        email: user.email
      });
      
      const response = await axios.post('http://localhost:5000/save-trip', {
        tripData: tripPlan,
        userId: user.uid,
        email: user.email
      }, {
        headers: {
          'Content-Type': 'application/json',
          // Add any auth headers if needed
        },
        // Increase timeout for large payloads
        timeout: 10000
      });
      
      console.log('Trip saved successfully:', response.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving trip:', error);
      
      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setSaveError(`Server error: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setSaveError('No response from server. Please check if the server is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setSaveError(`Error: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };
  




  useEffect(() => {
    async function loadCityImage() {
      const imageUrl = await fetchCityImage(tripPlan.tripDetails.destination);
      if (imageUrl) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          setBackgroundImage(imageUrl);
          setIsLoading(false);
        };
      }
    }
    loadCityImage();
  }, [tripPlan.tripDetails.destination]);

  
  if (!tripPlan) return null;
  if (isLoading) return <LoadingScreen />;

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerAnimation}
      className="min-h-screen bg-gray-50"
    >
      {/* Creative Hero Section */}
      <div className="relative min-h-[80vh] overflow-hidden">
        {/* Smooth Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-50 via-indigo-50 to-slate-50" />
        
        {/* Floating Gradient Orbs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          {/* Primary gradient orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full 
                        bg-gradient-to-br from-violet-100/30 via-indigo-200/20 to-transparent 
                        blur-3xl transform -translate-y-1/4 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full 
                        bg-gradient-to-tr from-rose-100/30 via-orange-100/20 to-transparent 
                        blur-3xl transform translate-y-1/4 -translate-x-1/4" />
          
          {/* Secondary subtle orbs */}
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full 
                        bg-gradient-to-r from-sky-100/40 to-transparent blur-2xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full 
                        bg-gradient-to-l from-amber-100/40 to-transparent blur-2xl" />
        </motion.div>

        {/* Subtle Mesh Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_49%,rgba(71,85,105,0.02)_49%,rgba(71,85,105,0.02)_51%,transparent_51%,transparent_100%),linear-gradient(to_bottom,transparent_0,transparent_49%,rgba(71,85,105,0.02)_49%,rgba(71,85,105,0.02)_51%,transparent_51%,transparent_100%)] [background-size:60px_60px]" />

        {/* Animated Gradient Lines */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div className="absolute top-0 left-0 w-full h-full transform rotate-45">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 1 }}
                className="absolute h-px w-full bg-gradient-to-r from-transparent via-slate-200/30 to-transparent"
                style={{ top: `${i * 15}%` }}
              />
            ))}
          </div>
        </motion.div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Navigation Bar */}
          <nav className="z-10 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative z-60"
          >
            <Link 
              to="/create-trip" 
              className="group inline-flex items-center px-5 py-2.5 rounded-xl
                        bg-white/80 backdrop-blur-sm border border-slate-200
                        text-slate-700 shadow-sm hover:shadow-md
                        transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Planning</span>
            </Link>
          </motion.div>

            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center px-4 py-2.5 rounded-2xl
                          bg-white/80 backdrop-blur-sm border border-indigo-100
                          shadow-xl shadow-indigo-500/5
                          transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 
                                  rounded-full opacity-30 blur group-hover:opacity-40 transition-opacity" />
                    <Plane className="w-4 h-4 relative text-indigo-600 transform 
                                  -rotate-45 group-hover:text-indigo-700 transition-colors" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 
                                  bg-clip-text text-transparent">
                      {tripPlan.tripDetails.duration.days}
                      <span className="text-slate-400 mx-1">Days</span>
                      {tripPlan.tripDetails.duration.days - 1}
                      <span className="text-slate-400 ml-1">Nights</span>
                    </span>
                  </div>
                </div>
              </motion.div>
              {!savedTrip && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>    {/* Share Button with Animation */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    onClick={handleSaveTrip}
                    disabled={isSaving}
                    className={`px-6 py-2.5 rounded-2xl text-sm font-medium
                            ${!isSaving ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-gray-400' }
                            text-white
                            transition-all duration-300`}
                  >
                    Save Trip
                  </motion.button>
                </motion.div>)}
              </div>
              {saveSuccess && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                  Trip saved successfully!
                </div>
              )}
              
              {saveError && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
                  Error: {saveError}
                </div>
              )}
          </nav>

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-5 py-3 rounded-full
                        bg-white/80 backdrop-blur-sm border border-indigo-100 mb-12 mt-10
                        shadow-xl shadow-indigo-500/5 hover:shadow-indigo-500/10
                        transition-all duration-300"
            >
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 
                            text-white text-xs font-medium tracking-wider mr-3">
                NEW JOURNEY
              </span>
              <span className="text-sm text-slate-600 font-medium">Your adventure begins here</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-['Plus_Jakarta_Sans'] mb-8"
            >
              <span className="block text-5xl md:text-7xl font-extrabold tracking-tight
                            text-transparent bg-clip-text bg-gradient-to-r 
                            from-slate-800 via-slate-900 to-slate-800
                            leading-[1.15] mb-4">
                Discover the Magic of
              </span>
              <motion.span 
                className="block text-6xl md:text-8xl font-black tracking-tight
                          text-transparent bg-clip-text bg-gradient-to-r 
                          from-indigo-500 via-violet-500 to-indigo-500
                          leading-none mt-2"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ backgroundSize: '200% auto' }}
              >
                {tripPlan.tripDetails.destination}
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed
                        font-['Plus_Jakarta_Sans'] font-light"
            >
              Embark on a journey through time and culture in{' '}
              <span className="relative inline-block">
                <span className="text-xl md:text-xl relative z-10 font-bold bg-gradient-to-r 
                              from-indigo-600 to-violet-600 text-transparent bg-clip-text">
                  {tripPlan.tripDetails.destination.split(',')[0]}
                </span>
                <span className="absolute bottom-0 left-0 w-full h-[30%] 
                              bg-indigo-100/50 rounded-lg -z-0" />
              </span>
              , where every moment becomes an unforgettable memory.
            </motion.p>
          </motion.div>

            {/* Decorative Elements */}
            <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="text-sm text-slate-500 -mb-6">Scroll to explore</div>
                <div className="h-12 w-[1px] bg-gradient-to-b from-slate-300 to-transparent" />
              </motion.div>
            </div>
          </div>
        </div>
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10 pb-16">
        {/* Enhanced Tab Navigation */}
        <TabGroup>
          <TabList className="flex flex-wrap justify-center items-center space-x-1 p-2 mb-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg">
            <AnimatedTabButton icon={Calendar}>Daily Plan</AnimatedTabButton>
            <AnimatedTabButton icon={Building2}>Hotels</AnimatedTabButton>
            <AnimatedTabButton icon={Plane}>Flights</AnimatedTabButton>
            <AnimatedTabButton icon={MapPin}>Places</AnimatedTabButton>
          </TabList>

          <TabPanels>
            {/* Enhanced Itinerary Panel */}
            <TabPanel>  
              {/* Day Plans Content Area with Enhanced Visual Elements */}
              <div className="relative">
                {/* Enhanced decorative elements */}
                <div className="absolute left-0 top-10 w-40 h-40 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl"></div>
                <div className="absolute right-0 top-1/3 w-52 h-52 bg-gradient-to-br from-indigo-200/10 to-violet-200/5 rounded-full blur-3xl"></div>
                <div className="absolute left-1/4 bottom-20 w-44 h-44 bg-gradient-to-br from-emerald-200/10 to-green-200/5 rounded-full blur-3xl"></div>

                {/* Enhanced timeline with gradient line and smooth animations */}
                <div className="relative space-y-16 before:absolute before:left-[15px] before:top-0 before:bottom-0 before:w-0.5 
                              before:bg-gradient-to-b before:from-indigo-400 before:via-violet-400 before:to-purple-300">
                  {tripPlan.dailyPlan.map((day, dayIndex) => (
                    <motion.div
                      id={`day-${day.day}`}
                      key={dayIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: dayIndex * 0.1 }}
                      className="relative pl-10"
                    >
                      {/* Enhanced day number badge */}
                      <div className="absolute left-0 flex items-center justify-center w-10 h-10 
                                    bg-gradient-to-br from-indigo-500 to-violet-600 
                                    rounded-full -translate-x-[15px] shadow-lg shadow-indigo-500/30
                                    ring-4 ring-white z-10">
                        <span className="text-sm font-bold text-white">{day.day}</span>
                      </div>
                      
                      {/* Enhanced day header with more context */}
                      <div className="mb-6">
                        <div className="inline-flex items-center px-4 py-2.5 rounded-xl 
                                      bg-white/90 backdrop-blur-sm border border-indigo-100 shadow-md">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                            <span className="text-base font-medium text-gray-800">
                              {day.date || `Day ${day.day}`}{' '}
                              {day.location && (
                                <span className="text-indigo-700 font-semibold">• {day.location}</span>
                              )}
                            </span>
                          </div>
                          
                          {/* Add day theme/mood indicator */}
                          {day.theme && (
                            <span className="ml-3 px-3 py-1 bg-indigo-50 text-xs font-medium text-indigo-700 rounded-full">
                              {day.theme}
                            </span>
                          )}
                        </div>
                        
                        {/* Day summary */}
                        <div className="mt-3 ml-2">
                          <p className="text-sm text-gray-600 max-w-3xl">
                            {day.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Enhanced day plan with our improved DayPlan component */}
                      <DayPlan day={day} />
                      
                      {/* Enhanced meals section with more visual appeal */}
                      <div className="mt-10 pt-6">
                        <div className="mb-6">
                          <div className="inline-flex items-center px-6 py-3 rounded-xl 
                                        bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 shadow-sm">
                            <Utensils className="w-5 h-5 text-amber-600 mr-3" />
                            <h4 className="font-medium text-amber-800 text-lg">Culinary Experiences</h4>
                          </div>
                        </div>
                        
                        {/* Enhanced meal cards grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {day.meals.map((meal, mealIndex) => (
                            <motion.div
                              key={`${dayIndex}-${mealIndex}`}
                              whileHover={{ 
                                y: -6, 
                                scale: 1.02,
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                              }}
                              transition={{ duration: 0.2 }}
                              className="transform-gpu"
                            >
                              <MealCard meal={meal} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Enhanced day separator with animation */}
                      {dayIndex < tripPlan.dailyPlan.length - 1 && (
                        <motion.div 
                          className="absolute left-[15px] bottom-[-24px] transform -translate-x-1/2 z-0"
                          animate={{ 
                            opacity: [0.5, 1, 0.5],
                            y: [0, 5, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeInOut"
                          }}
                        >
                          <div className="w-0.5 h-16 bg-gradient-to-b from-indigo-300 via-indigo-200 to-transparent"></div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Enhanced interactive summary footer */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-16 p-8 bg-gradient-to-br from-indigo-50 via-violet-50/50 to-indigo-50/30 rounded-2xl border border-indigo-100 shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent mb-2">
                      Your {tripPlan.tripDetails.duration.days}-Day {tripPlan.tripDetails.destination.split(',')[0]} Journey
                    </h3>
                    <p className="text-indigo-700/70 text-sm">
                      <span className="font-medium text-indigo-800">
                        {tripPlan.dailyPlan.reduce((acc, day) => acc + (day.activities?.length || 0), 0)} Activities
                      </span> across {tripPlan.tripDetails.destination} including
                      <span className="font-medium text-indigo-800"> {
                        [...new Set(tripPlan.dailyPlan.flatMap(day => 
                          day.activities?.map(a => a.location) || []
                        ))].length
                      } unique locations</span>
                    </p>
                    
                    {/* Add trip statistics */}
                    <div className="mt-4 flex flex-wrap gap-4">
                      <div className="px-3 py-2 bg-white/70 backdrop-blur-sm rounded-lg border border-indigo-50 shadow-sm flex items-center">
                        <div className="p-1.5 bg-violet-100 rounded-md mr-2">
                          <Utensils className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-sm text-gray-700">
                          <span className="font-semibold text-violet-700">{
                            tripPlan.dailyPlan.reduce((acc, day) => acc + (day.meals?.length || 0), 0)
                          }</span> Meals
                        </span>
                      </div>
                      
                      <div className="px-3 py-2 bg-white/70 backdrop-blur-sm rounded-lg border border-indigo-50 shadow-sm flex items-center">
                        <div className="p-1.5 bg-indigo-100 rounded-md mr-2">
                          <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm text-gray-700">
                          <span className="font-semibold text-indigo-700">{tripPlan.accommodation?.hotels?.length || 0}</span> Hotels
                        </span>
                      </div>
                      
                      <div className="px-3 py-2 bg-white/70 backdrop-blur-sm rounded-lg border border-indigo-50 shadow-sm flex items-center">
                        <div className="p-1.5 bg-sky-100 rounded-md mr-2">
                          <MapPin className="w-4 h-4 text-sky-600" />
                        </div>
                        <span className="text-sm text-gray-700">
                          <span className="font-semibold text-sky-700">{tripPlan.attractions?.length || 0}</span> Attractions
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced action buttons */}
                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 bg-white rounded-xl border border-indigo-200 text-indigo-600 
                              text-sm font-medium shadow-sm hover:shadow-md hover:border-indigo-300
                              transition-all duration-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Itinerary
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMapModalOpen(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl 
                              text-white text-sm font-medium shadow-md hover:shadow-lg hover:shadow-indigo-500/20
                              transition-all duration-300 flex items-center"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      View on Map
                    </motion.button>
                  </div>
                </div>
                <TripMapModal 
                  isOpen={mapModalOpen} 
                  onClose={() => setMapModalOpen(false)} 
                  tripPlan={tripPlan}
                />
              </motion.div>
            </TabPanel>

            {/* Accommodations Panel */}
            <TabPanel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tripPlan.accommodation.hotels.map((hotel, index) => (
                  <HotelCard key={index} hotel={hotel} />
                ))}
              </div>
            </TabPanel>

            {/* Transportation Panel */}
            <TabPanel>
              <div className="space-y-12">
                {/* Journey Map */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <JourneyMap 
                    origin={tripPlan.tripDetails.origin}
                    destination={tripPlan.tripDetails.destination}
                    date={tripPlan.tripDetails.dates}
                    duration={tripPlan.tripDetails.duration}
                  />
                </div>

                {/* Real Flight Search Results */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Flight Options</h3>
                  <FlightSearchResults 
                    origin={tripPlan.tripDetails.origin}
                    destination={tripPlan.tripDetails.destination}
                  />
                </div>

                {/* Transportation Options */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Alternative Transportation</h3>
                  <div className="grid gap-6">
                    {[
                      {
                        icon: <Train className="w-6 h-6" />,
                        mode: "Train",
                        duration: "4h 30m",
                        price: "€70-120",
                        advantages: ["Scenic route", "City center to center"],
                        disadvantages: ["Limited schedules", "Multiple stops"],
                        bgColor: "bg-gradient-to-br from-violet-50/60 to-indigo-50",
                        iconBgColor: "bg-gradient-to-br from-violet-500/20 to-indigo-500/20",
                        iconColor: "text-violet-600",
                        borderColor: "border-violet-100"
                      },
                      {
                        icon: <Car className="w-6 h-6" />,
                        mode: "Car",
                        duration: "5h 45m",
                        price: "€90-130",
                        advantages: ["Flexible schedule", "Door to door"],
                        disadvantages: ["Toll roads", "Parking needed"],
                        bgColor: "bg-gradient-to-br from-sky-50/60 to-indigo-50",
                        iconBgColor: "bg-gradient-to-br from-sky-500/20 to-indigo-500/20",
                        iconColor: "text-sky-600",
                        borderColor: "border-sky-100"
                      }
                    ].map((option, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative group rounded-2xl border shadow-sm backdrop-blur-sm ${option.borderColor} ${option.bgColor} p-6
                                  overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.02]`}
                      >
                        {/* Rest of your existing code for these cards */}
                        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-500/5 to-violet-500/10 blur-2xl"></div>
                        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-br from-sky-500/5 to-indigo-500/10 blur-2xl"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`p-3.5 rounded-xl ${option.iconBgColor} ${option.iconColor} shadow-sm`}>
                                {option.icon}
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {option.mode}
                                </h3>
                                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1.5 text-indigo-500" />
                                    <span>{option.duration}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Banknote className="w-4 h-4 mr-1.5 text-indigo-500" />
                                    <span>{option.price}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <motion.button 
                              whileHover={{ scale: 1.05 }} 
                              whileTap={{ scale: 0.95 }}
                              className="px-5 py-2.5 text-sm font-medium text-white rounded-xl
                                        bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20
                                        hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none 
                                        focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
                            >
                              Book Now
                            </motion.button>
                          </div>

                          <div className="mt-8 grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium flex items-center text-indigo-900">
                                <span className="w-1 h-4 bg-gradient-to-b from-indigo-400 to-violet-500 rounded-full mr-2"></span>
                                Advantages
                              </h4>
                              <ul className="space-y-2.5 pl-3">
                                {option.advantages.map((advantage, i) => (
                                  <li key={i} className="flex items-center text-sm text-gray-700">
                                    <span className="w-2 h-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full mr-2.5 shadow-sm" />
                                    {advantage}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium flex items-center text-indigo-900">
                                <span className="w-1 h-4 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-full mr-2"></span>
                                Considerations
                              </h4>
                              <ul className="space-y-2.5 pl-3">
                                {option.disadvantages.map((disadvantage, i) => (
                                  <li key={i} className="flex items-center text-sm text-gray-700">
                                    <span className="w-2 h-2 bg-gradient-to-br from-amber-400 to-rose-500 rounded-full mr-2.5 shadow-sm" />
                                    {disadvantage}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* Attractions Panel */}
            <TabPanel>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tripPlan.attractions.map((attraction, index) => (
                  <AttractionCard key={index} attraction={attraction} />
                ))}
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </motion.div>
  );
}

function AnimatedTabButton({ icon: Icon, children }) {
  return (
    <Tab className={({ selected }) => `
      ${selected 
        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25' 
        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}
      relative rounded-xl px-6 py-3.5 flex items-center space-x-2
      transition-all duration-300 ease-out transform hover:-translate-y-0.5
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400
    `}>
      <motion.div
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-2"
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span className="font-medium">{children}</span>
      </motion.div>
    </Tab>
  );
}