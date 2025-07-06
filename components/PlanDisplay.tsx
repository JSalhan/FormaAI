
import React, { useState } from 'react';
import { PlanData, DietDay, WorkoutDay } from '../types';
import { PlateIcon, DumbbellIcon, FlameIcon, InfoIcon, RobotIcon, UserCircleIcon } from './icons';

interface PlanDisplayProps {
  plan: PlanData | null;
  isLoading: boolean;
  error: string | null;
}

type ActiveTab = 'diet' | 'workout';

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, isLoading, error }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('diet');

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center bg-white rounded-2xl shadow-lg p-8 text-center">
        <RobotIcon className="h-20 w-20 text-green-500 animate-pulse mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">AI is crafting your plan...</h3>
        <p className="text-gray-500 mt-2">This might take a moment. Great things are coming!</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center bg-white rounded-2xl shadow-lg p-8 text-center">
        <InfoIcon className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-red-700">Oops! Something went wrong.</h3>
        <p className="text-gray-600 bg-red-50 p-4 rounded-lg mt-2">{error}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-dashed border-gray-300">
        <UserCircleIcon className="h-20 w-20 text-gray-400 mb-4"/>
        <h3 className="text-xl font-semibold text-gray-700">Your Plan Awaits</h3>
        <p className="text-gray-500 mt-2">Fill out your profile on the left to generate your personalized diet and fitness plan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <TabButton
            icon={<PlateIcon />}
            label="Diet Plan"
            isActive={activeTab === 'diet'}
            onClick={() => setActiveTab('diet')}
          />
          <TabButton
            icon={<DumbbellIcon />}
            label="Workout Plan"
            isActive={activeTab === 'workout'}
            onClick={() => setActiveTab('workout')}
          />
        </nav>
      </div>
      <div className="mt-6">
        {activeTab === 'diet' && <DietPlanView plan={plan.dietPlan} />}
        {activeTab === 'workout' && <WorkoutPlanView plan={plan.workoutPlan} />}
      </div>
    </div>
  );
};

const TabButton: React.FC<{icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void}> = ({icon, label, isActive, onClick}) => (
    <button
        onClick={onClick}
        className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
        ${isActive
            ? 'border-green-500 text-green-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        <span className={`mr-2 h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-400'}`}>{icon}</span>
        {label}
    </button>
)

const DietPlanView: React.FC<{ plan: DietDay[] }> = ({ plan }) => (
  <div className="space-y-4">
    {plan.map(day => (
      <div key={day.day} className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-bold text-gray-800">Day {day.day}</h4>
          <div className="flex items-center text-sm font-medium text-orange-600 bg-orange-100 rounded-full px-3 py-1">
            <FlameIcon className="h-4 w-4 mr-1"/>
            {day.dailyCalories} kcal
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <MealCard title="Breakfast" description={day.meals.breakfast} />
            <MealCard title="Lunch" description={day.meals.lunch} />
            <MealCard title="Dinner" description={day.meals.dinner} />
            <MealCard title="Snacks" description={day.meals.snacks} />
        </div>
      </div>
    ))}
  </div>
);

const MealCard: React.FC<{title: string, description: string}> = ({title, description}) => (
    <div className="bg-white p-3 rounded-lg border border-gray-200">
        <h5 className="font-semibold text-gray-700">{title}</h5>
        <p className="text-gray-600">{description}</p>
    </div>
)

const WorkoutPlanView: React.FC<{ plan: WorkoutDay[] }> = ({ plan }) => (
  <div className="space-y-4">
    {plan.map(day => (
      <div key={day.day} className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-bold text-gray-800">Day {day.day}</h4>
          <span className="text-sm font-medium text-blue-600 bg-blue-100 rounded-full px-3 py-1">{day.focus}</span>
        </div>
        {day.exercises.length > 0 ? (
          <div className="flow-root">
            <ul className="-my-2 divide-y divide-gray-200">
                {day.exercises.map((ex, index) => (
                    <li key={index} className="py-3 flex items-center space-x-4">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                            {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{ex.name}</p>
                        </div>
                         <div className="text-right text-sm text-gray-500">
                            <p><strong className="text-gray-700">{ex.sets}</strong> sets</p>
                            <p><strong className="text-gray-700">{ex.reps}</strong> reps</p>
                            <p><strong className="text-gray-700">{ex.rest}</strong> rest</p>
                        </div>
                    </li>
                ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">Rest Day - Time to recover!</p>
        )}
      </div>
    ))}
  </div>
);

export default PlanDisplay;