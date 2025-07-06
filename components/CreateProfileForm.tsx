'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth';
import api from '../lib/api';
import { ArrowPathIcon, SparklesIcon } from './icons';

const FITNESS_GOALS = ['Lose Weight', 'Maintain Weight', 'Gain Muscle'];
const ACTIVITY_LEVELS = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'];

const InputField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const Tooltip: React.FC<{ text: string, children: React.ReactNode }> = ({ text, children }) => (
    <div className="relative group flex">
        {children}
        <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {text}
        </div>
    </div>
);

const CreateProfileForm: React.FC = () => {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    mobile: '',
    age: 30,
    height: 180,
    weight: 75,
    goal: 'Maintain Weight',
    activityLevel: 'Moderately Active',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' || name === 'height' || name === 'weight' ? Number(value) : value }));
  };

  const handleSubmit = async (targetUrl: '/dashboard' | '/upgrade') => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.put('/profile', formData);
      setUser(data.user);
      router.push(targetUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center p-4">Loading user data...</div>
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
       {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Full Name">
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
            </InputField>
            <InputField label="Username">
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="e.g., fitnessfan" required />
            </InputField>
        </div>
         <InputField label="Mobile Number (Optional)">
            <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="e.g., 555-123-4567" />
        </InputField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Age">
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
            </InputField>
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

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Dietary Preference">
                 <Tooltip text="Upgrade to Pro to unlock this feature!">
                    <select disabled className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed">
                        <option>None</option>
                    </select>
                </Tooltip>
            </InputField>
            <InputField label="Cuisine Preference">
                <Tooltip text="Upgrade to Pro to unlock this feature!">
                    <input type="text" disabled className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" placeholder="e.g., Italian, Mexican" />
                </Tooltip>
            </InputField>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={() => handleSubmit('/dashboard')} disabled={isLoading} className="w-full flex justify-center items-center p-3 text-green-700 bg-green-100 rounded-lg font-semibold hover:bg-green-200 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors duration-300 transform hover:scale-105">
              {isLoading ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> : 'Continue as Free'}
            </button>
            <button onClick={() => handleSubmit('/upgrade')} disabled={isLoading} className="w-full flex justify-center items-center p-3 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors duration-300 transform hover:scale-105">
               {isLoading ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> : <SparklesIcon className="h-5 w-5 mr-2" />}
              Upgrade to Pro
            </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProfileForm;
