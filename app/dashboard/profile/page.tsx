'use client';
import React from 'react';
import ProfileForm from '../../../components/ProfileForm';
import { useMutation } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { CreditCardIcon, ArrowPathIcon } from '../../../components/icons';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  const portalMutation = useMutation({
    mutationFn: () => api.post('/payment/create-portal-session'),
    onSuccess: (data: { data: { url: string } }) => {
      if (data.data.url) {
        window.location.href = data.data.url;
      }
    },
    onError: (error) => {
      console.error("Could not create customer portal session", error);
      alert("Error accessing subscription management. Please try again later.");
    }
  });

  return (
    <div>
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
            <p className="text-gray-500 mt-1">Keep your information up to date for the most accurate plans.</p>
        </div>
        <div className="max-w-4xl mx-auto space-y-8">
            <ProfileForm />

            {user?.role === 'pro' && (
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Subscription Management</h3>
                    <p className="text-gray-500 mb-4">Manage your billing details, view invoices, or cancel your subscription.</p>
                    <button 
                        onClick={() => portalMutation.mutate()}
                        disabled={portalMutation.isPending}
                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
                    >
                         {portalMutation.isPending ? (
                            <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                         ) : (
                            <CreditCardIcon className="h-5 w-5 mr-2" />
                         )}
                        Manage Subscription
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default ProfilePage;
