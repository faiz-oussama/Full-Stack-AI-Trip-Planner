import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { motion } from 'framer-motion';
import { CalendarDays, DollarSign, MapPin } from 'lucide-react';


import AttractionCard from './AttractionCard';
import DayPlan from './DayPlan';
import FlightCard from './FlightCard';
import HotelCard from './HotelCard';
import InfoCard from './InfoCard';
import TabButton from './TabButton';

export default function TripPlanDisplay({ tripPlan }) {
  if (!tripPlan) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      {/* Trip Overview Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Your Journey to {tripPlan.tripDetails.destination}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<CalendarDays className="w-6 h-6 text-indigo-600" />}
            title="Duration"
            value={`${tripPlan.tripDetails.duration.days} Days`}
          />
          <InfoCard
            icon={<MapPin className="w-6 h-6 text-indigo-600" />}
            title="Location"
            value={tripPlan.tripDetails.destination}
          />
          <InfoCard
            icon={<DollarSign className="w-6 h-6 text-indigo-600" />}
            title="Budget Level"
            value={tripPlan.tripDetails.budget.level}
          />
        </div>
      </div>

      {/* Tabbed Content */}
      <TabGroup>
        <TabList className="flex space-x-1 rounded-xl bg-indigo-100 p-1 mb-8">
          <TabButton>Itinerary</TabButton>
          <TabButton>Accommodations</TabButton>
          <TabButton>Transportation</TabButton>
          <TabButton>Attractions</TabButton>
        </TabList>

        <TabPanels>
          {/* Itinerary Panel */}
          <TabPanel>
            <div className="space-y-8">
              {tripPlan.dailyPlan.map((day, index) => (
                <DayPlan key={index} day={day} />
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
            <div className="space-y-6">
              {tripPlan.transportation.flights.map((flight, index) => (
                <FlightCard key={index} flight={flight} />
              ))}
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
    </motion.div>
  );
}