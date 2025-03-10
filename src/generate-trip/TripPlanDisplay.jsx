import LoadingScreen from '@/components/ui/LoadingScreen';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Banknote, Building2, Calendar, Car, Clock, MapPin, Plane, Train, Utensils } from 'lucide-react';
import { useEffect, useState , useContext} from 'react';
import { Link } from 'react-router-dom';
import { fetchCityImage } from '../utils/fetchCityImage';
import AttractionCard from './AttractionCard';
import DayPlan from './DayPlan';
import HotelCard from './HotelCard';
import JourneyMap from './JourneyMap';
import MealCard from './MealCard';
import { AuthContext } from '@/auth/AuthProvider';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

export default function TripPlanDisplay(props) {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);;
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const location = useLocation();

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
      
      // Make sure the backend URL is correct and accessible
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
          <nav className="flex justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
                        bg-white/80 backdrop-blur-sm border border-indigo-100 mb-12
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
              <div className="relative space-y-8 before:absolute before:left-[15px] before:top-0 before:bottom-0 before:w-0.5 before:bg-indigo-100">
              {tripPlan.dailyPlan.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: dayIndex * 0.1 }}
                  className="relative pl-10"
                >
                  <div className="absolute left-0 flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full -translate-x-[13px]">
                    <span className="text-sm font-medium text-white">{day.day}</span>
                  </div>
                  <DayPlan day={day} />
                  <div className="border-t border-gray-100 pt-4 mt-6">
                    <div className="flex items-center mb-3">
                      <Utensils className="w-5 h-5 text-indigo-600 mr-2" />
                      <h4 className="font-medium">Meals</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {day.meals.map((meal, mealIndex) => (
                        <MealCard 
                          key={`${dayIndex}-${mealIndex}`} 
                          meal={meal} 
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
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

                {/* Transportation Options */}
                <div className="grid gap-6">
                  {[
                    {
                      icon: <Plane className="w-6 h-6" />,
                      mode: "Flight",
                      duration: "2h 15m",
                      price: "€150-250",
                      advantages: ["Fastest option", "Direct routes available"],
                      disadvantages: ["Higher cost", "Airport transfers needed"],
                      bgColor: "bg-gradient-to-br from-sky-50 to-indigo-50",
                      iconColor: "text-sky-600",
                      borderColor: "border-sky-200"
                    },
                    {
                      icon: <Train className="w-6 h-6" />,
                      mode: "Train",
                      duration: "4h 30m",
                      price: "€70-120",
                      advantages: ["Scenic route", "City center to center"],
                      disadvantages: ["Limited schedules", "Multiple stops"],
                      bgColor: "bg-emerald-50",
                      iconColor: "text-emerald-600",
                      borderColor: "border-emerald-200"
                    },
                    {
                      icon: <Car className="w-6 h-6" />,
                      mode: "Car",
                      duration: "5h 45m",
                      price: "€90-130",
                      advantages: ["Flexible schedule", "Door to door"],
                      disadvantages: ["Toll roads", "Parking needed"],
                      bgColor: "bg-amber-50",
                      iconColor: "text-amber-600",
                      borderColor: "border-amber-200"
                    }
                  ].map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative group rounded-2xl border backdrop-blur-sm ${option.borderColor} ${option.bgColor} p-6 
                                transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${option.iconColor}`}>
                            {option.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {option.mode}
                            </h3>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {option.duration}
                              </div>
                              <div className="flex items-center">
                                <Banknote className="w-4 h-4 mr-1" />
                                {option.price}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Book Now
                        </button>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Advantages</h4>
                          <ul className="space-y-2">
                            {option.advantages.map((advantage, i) => (
                              <li key={i} className="flex items-center text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
                                {advantage}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Considerations</h4>
                          <ul className="space-y-2">
                            {option.disadvantages.map((disadvantage, i) => (
                              <li key={i} className="flex items-center text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2" />
                                {disadvantage}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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