'use client';
import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../lib/api';
import { SparklesIcon, ArrowPathIcon } from './icons';
import { DBUser } from '../types';
import Link from 'next/link';

const FITNESS_GOALS = ['Lose Weight', 'Maintain Weight', 'Gain Muscle'];
const ACTIVITY_LEVELS = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'];
const DIETARY_PREFERENCES = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free'];

const InputField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const ProfileForm: React.FC = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState<Partial<DBUser>>({});
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        mobile: user.mobile || '',
        bio: user.bio || '',
        age: user.age || 30,
        height: user.height || 180,
        weight: user.weight || 75,
        goal: user.goal || 'Maintain Weight',
        activityLevel: user.activityLevel || 'Moderately Active',
        dietaryPreference: user.dietaryPreference || 'None',
        cuisinePref: user.cuisinePref || [],
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' || name === 'height' || name === 'weight' ? Number(value) : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      // Exclude read-only fields from submission
      const { email, username, ...submittableData } = formData;
      const profileUpdateResponse = await api.put('/profile', submittableData);
      let updatedUser = profileUpdateResponse.data.user;
      
      if (profilePicFile) {
        const picFormData = new FormData();
        picFormData.append('profilePic', profilePicFile);
        const picUpdateResponse = await api.put('/profile/picture', picFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updatedUser = picUpdateResponse.data.user;
      }
      
      setUser(updatedUser); // Update global state
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfilePicFile(null);

    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }
  
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <img
            className="h-24 w-24 rounded-full object-cover"
            src={profilePicFile ? URL.createObjectURL(profilePicFile) : (user.profilePicUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&size=96&background=0D8ABC&color=fff`)}
            alt="Profile"
          />
          <label htmlFor="profilePic" className="cursor-pointer mt-2 text-sm text-green-600 hover:text-green-700 font-medium text-center block">
            Change
          </label>
          <input id="profilePic" name="profilePic" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
        </div>
        <div className="flex-grow">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{formData.name}</h2>
          <p className="text-gray-500 mb-6">@{formData.username}</p>
        </div>
      </div>
          
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Email Address (Cannot be changed)">
                <input type="email" value={formData.email || ''} readOnly className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:ring-0 focus:border-gray-300" />
            </InputField>
            <InputField label="Username (Cannot be changed)">
                <input type="text" value={formData.username || ''} readOnly className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:ring-0 focus:border-gray-300" />
            </InputField>
        </div>
        <InputField label="Name">
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
        </InputField>
         <InputField label="Mobile Number (Optional)">
            <input type="tel" name="mobile" value={formData.mobile || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
        </InputField>
        <InputField label="Bio (max 160 characters)">
          <textarea name="bio" value={formData.bio || ''} onChange={handleChange} maxLength={160} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" rows={3} placeholder="Tell everyone a little about yourself" />
        </InputField>
        <div className="grid grid-cols-3 gap-4">
            <InputField label="Age">
            <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
            </InputField>
            <InputField label="Height (cm)">
            <input type="number" name="height" value={formData.height || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
            </InputField>
            <InputField label="Weight (kg)">
            <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
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
            {user.role === 'pro' ? (
                <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                {DIETARY_PREFERENCES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            ) : (
                <div className="relative group">
                    <select disabled className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed appearance-none">
                        <option>{formData.dietaryPreference}</option>
                    </select>
                    <div className="absolute inset-0 flex items-center justify-center bg-transparent rounded-lg group-hover:bg-gray-100/80 transition-all">
                        <Link href="/upgrade" className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-green-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            Upgrade to Pro
                        </Link>
                    </div>
                </div>
            )}
        </InputField>

        <InputField label="Cuisine Preference (Pro Feature)">
          {user.role === 'pro' ? (
            <input
              type="text"
              name="cuisinePref"
              value={Array.isArray(formData.cuisinePref) ? formData.cuisinePref.join(', ') : ''}
              onChange={(e) => {
                const { name, value } = e.target;
                setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()) }));
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Indian, Italian, Mexican"
            />
          ) : (
             <div className="relative group">
                <input
                    type="text"
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    placeholder="e.g., Indian, Italian, Mexican"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-transparent rounded-lg group-hover:bg-gray-100/80 transition-all">
                    <Link href="/upgrade" className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-green-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        Upgrade to Pro
                    </Link>
                </div>
            </div>
          )}
        </InputField>

        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center p-3 mt-4 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors duration-300">
          {isLoading ? (
            <>
              <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>

        {statusMessage && (
            <div className={`mt-4 text-center text-sm font-medium ${statusMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {statusMessage.text}
            </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;