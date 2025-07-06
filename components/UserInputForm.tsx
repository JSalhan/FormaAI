
import React, { useState } from 'react';
import { UserData } from '../types';
import { GENDERS, FITNESS_GOALS, ACTIVITY_LEVELS, DIETARY_PREFERENCES } from '../constants';
import { SparklesIcon, ArrowPathIcon } from './icons';

interface UserInputFormProps {
  onSubmit: (data: UserData) => void;
  isLoading: boolean;
}

const InputField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const UserInputForm: React.FC<UserInputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserData>({
    age: 30,
    gender: 'Male',
    height: 180,
    weight: 75,
    goal: 'Maintain Weight',
    activityLevel: 'Moderately Active',
    dietaryPreference: 'None',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' || name === 'height' || name === 'weight' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Age">
          <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
        </InputField>
        <InputField label="Gender">
          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </InputField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Height (cm)">
          <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
        </InputField>
        <InputField label="Weight (kg)">
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
        </InputField>
      </div>

      <InputField label="Fitness Goal">
        <select name="goal" value={formData.goal} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
          {FITNESS_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </InputField>

      <InputField label="Activity Level">
        <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
          {ACTIVITY_LEVELS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </InputField>
      
      <InputField label="Dietary Preference">
        <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
          {DIETARY_PREFERENCES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </InputField>

      <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center p-3 mt-4 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors duration-300">
        {isLoading ? (
          <>
            <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5 mr-2" />
            Generate My Plan
          </>
        )}
      </button>
    </form>
  );
};

export default UserInputForm;