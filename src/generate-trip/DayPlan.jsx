import { motion } from 'framer-motion';
import { Bus, Clock, DollarSign, MapPin, Utensils } from 'lucide-react';
import MealCard from './MealCard';

export default function DayPlan({ day }) {
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
      whileHover={{ y: -2 }}
    >
      <h3 className="text-xl font-semibold mb-4">Day {day.day}</h3>
      
      <div className="space-y-6">
        {day.activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-indigo-600">{activity.time}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{activity.activity}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bus className="w-4 h-4" />
                  <span>{activity.transport}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{activity.cost}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}