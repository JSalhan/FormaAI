'use client';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import { CheckIcon, SparklesIcon, ArrowPathIcon, StarIcon } from '../../components/icons';

const Feature = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-center gap-3">
    <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
    <span className="text-gray-600">{children}</span>
  </li>
);

const UpgradePage = () => {
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);

    const mutation = useMutation({
        mutationFn: async (plan: 'monthly' | 'yearly') => {
            setSelectedPlan(plan);
            const success_url = `${window.location.origin}/upgrade/success`;
            const cancel_url = `${window.location.origin}/upgrade`;
            const { data } = await api.post('/payment/subscribe', { plan, success_url, cancel_url });
            return data;
        },
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            }
        },
        onError: (error) => {
            console.error("Subscription error", error);
            alert("Could not initiate subscription. Please try again.");
            setSelectedPlan(null);
        }
    });

    if (user?.role === 'pro') {
        return (
            <div className="text-center bg-white p-10 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800">You are already a Pro member!</h1>
                <p className="mt-4 text-gray-600">Thank you for your support. Enjoy all the premium features.</p>
                <Link href="/dashboard" className="mt-6 inline-block bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-green-700">
                    Back to Dashboard
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Unlock Your Full Potential</h1>
                <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">
                    Upgrade to FormaAI Pro to get access to exclusive features and priority support.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-stretch">
                <div className="bg-gray-50 rounded-2xl shadow-md p-8 border-2 border-gray-200 flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-800">Free</h3>
                    <p className="text-4xl font-extrabold my-4">
                        $0
                        <span className="text-base font-medium text-gray-500">/forever</span>
                    </p>
                    <p className="text-gray-500 mb-6 flex-grow">Your current plan. Get started with the basics.</p>
                    <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-default">Current Plan</button>
                    <ul className="mt-8 space-y-4">
                        <Feature>Standard AI Diet & Workout Plans</Feature>
                        <Feature>Daily Progress Logging</Feature>
                        <Feature>Basic Analytics Dashboard</Feature>
                        <Feature>Community Feed Access</Feature>
                    </ul>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-500 relative flex flex-col">
                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-green-500 text-white shadow">
                            <SparklesIcon className="h-4 w-4 mr-1.5" />
                            Most Popular
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Pro</h3>
                    <p className="text-4xl font-extrabold my-4">
                        $9.99
                        <span className="text-base font-medium text-gray-500">/month</span>
                    </p>
                    <p className="text-gray-500 mb-6 flex-grow">Go beyond the basics with advanced personalization and unlimited access.</p>
                     <button
                        onClick={() => mutation.mutate('monthly')}
                        disabled={mutation.isPending}
                        className="w-full flex justify-center items-center py-3 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400"
                    >
                         {mutation.isPending && selectedPlan === 'monthly' ? (
                            <>
                                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                                Redirecting...
                            </>
                         ) : 'Upgrade to Pro'}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-2">A yearly option with discount is also available.</p>
                    <ul className="mt-8 space-y-4">
                        <Feature>Everything in Free, plus:</Feature>
                        <Feature><strong>Advanced AI Personalization</strong> (Cuisine Preferences)</Feature>
                        <Feature><strong>Automatic Plan Adjustments</strong> based on weight changes</Feature>
                        <Feature><strong>Real-time Chat</strong> with other members</Feature>
                        <Feature>Priority Support</Feature>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;
