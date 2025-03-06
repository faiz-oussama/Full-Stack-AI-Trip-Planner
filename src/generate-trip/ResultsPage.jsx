import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import TripPlanDisplay from './TripPlanDisplay';

export default function ResultsPage() {
  const location = useLocation();
  const tripPlan = location.state?.tripPlan;
  console.log(tripPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Planning
        </Link>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TripPlanDisplay tripPlan={tripPlan} />
        </motion.div>
      </div>
    </div>
  );
}