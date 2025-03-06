import { Clock } from 'react-feather';
export default function DayPlan({ day }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-4">Day {day.day}</h3>
      <div className="space-y-6">
        {day.activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium">{activity.time}</p>
              <p className="text-gray-600">{activity.activity}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>{activity.location}</span>
                <span>•</span>
                <span>{activity.transport}</span>
                <span>•</span>
                <span>{activity.cost}</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="font-medium mb-2">Meals</h4>
          <div className="space-y-2">
            {day.meals.map((meal, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{meal.type}</span>
                <span>{meal.venue}</span>
                <span className="text-indigo-600">{meal.estimatedCost}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}