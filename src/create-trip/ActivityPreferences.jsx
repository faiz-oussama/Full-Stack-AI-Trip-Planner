import { Compass, Calendar, Clock } from 'lucide-react';

const interests = [
  { id: 'cultural', label: 'Cultural & Historical' },
  { id: 'outdoor', label: 'Outdoor & Adventure' },
  { id: 'culinary', label: 'Food & Cuisine' },
  { id: 'relaxation', label: 'Wellness & Relaxation' }
];

const pacePreferences = [
  { id: 'relaxed', label: 'Relaxed (2-3 activities per day)' },
  { id: 'moderate', label: 'Moderate (3-4 activities per day)' },
  { id: 'intensive', label: 'Intensive (5+ activities per day)' }
];

export default function ActivityPreferences() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Activity Preferences
        </h2>
        <p className="text-gray-600 text-sm">
          Customize your Moroccan experience
        </p>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-4">Your Interests</h3>
        <div className="grid grid-cols-2 gap-4">
          {interests.map(({ id, label }) => (
            <label
              key={id}
              className="flex items-center p-4 border rounded-xl hover:border-indigo-500 cursor-pointer"
            >
              <input
                type="checkbox"
                name={id}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <Compass className="w-5 h-5 text-indigo-600 mx-3" />
              <span className="text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-4">Pace of Travel</h3>
        <div className="space-y-4">
          {pacePreferences.map(({ id, label }) => (
            <label
              key={id}
              className="flex items-center p-4 border rounded-xl hover:border-indigo-500 cursor-pointer"
            >
              <input
                type="radio"
                name="pacePreference"
                value={id}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <Clock className="w-5 h-5 text-indigo-600 mx-3" />
              <span className="text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-4">Schedule Elements</h3>
        <div className="border rounded-xl p-4">
          <label className="block mb-4">
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Rest Days
            </span>
            <select className="w-full p-2 border rounded-lg">
              <option value="">Select frequency</option>
              <option value="none">No rest days</option>
              <option value="light">Every 4-5 days</option>
              <option value="moderate">Every 3 days</option>
              <option value="frequent">Every 2 days</option>
            </select>
          </label>
          
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements
            </span>
            <textarea
              className="w-full p-2 border rounded-lg"
              placeholder="Any specific events or appointments to consider?"
              rows={3}
            />
          </label>
        </div>
      </div>
    </div>
  );
}