'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowPathIcon, SparklesIcon } from './icons';

interface AuthFormProps {
  formType: 'login' | 'signup';
  onSubmit: (data: any) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ formType, onSubmit }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = formType === 'signup';
  const title = isSignup ? 'Create Your Account' : 'Welcome Back';
  const subtitle = isSignup
    ? 'Start your fitness journey today.'
    : 'Log in to access your personalized plans.';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="name">Full Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="email">Email Address</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="password">Password</label>
          <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required minLength={6} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
        </div>
        
        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center p-3 mt-4 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors duration-300">
          {isLoading ? (
            <>
              <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              {isSignup ? 'Sign Up' : 'Log In'}
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <Link href={isSignup ? '/auth/login' : '/auth/signup'} className="font-medium text-green-600 hover:text-green-500">
            {isSignup ? 'Log In' : 'Sign Up'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
