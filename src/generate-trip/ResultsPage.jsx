import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import TripPlanDisplay from './TripPlanDisplay';

export default function ResultsPage() {
  const location = useLocation();
  const tripPlan = location.state?.tripPlan;
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40">
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        >
        <TripPlanDisplay tripPlan={tripPlan} />
        </motion.div>
    </div>
  );
}