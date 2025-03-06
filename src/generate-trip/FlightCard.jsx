import { DollarSign, Plane } from 'lucide-react';

export default function FlightCard({ flight }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-3">
          <Plane className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="font-medium text-gray-900">{flight.airline}</h3>
            <p className="text-sm text-gray-500">Flight Details</p>
          </div>
        </div>
        <a
          href={flight.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Book Now
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Departure</p>
          <p className="font-medium">{flight.departure}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Arrival</p>
          <p className="font-medium">{flight.arrival}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <DollarSign className="w-4 h-4 mr-1" />
          <span>{flight.price}</span>
        </div>
        <button
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          onClick={() => window.open(flight.bookingUrl, '_blank')}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}