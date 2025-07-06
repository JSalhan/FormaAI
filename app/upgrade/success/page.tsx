'use client';
import React, { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import api from '../../../lib/api';
import Link from 'next/link';
import { ArrowPathIcon, CheckIcon } from '../../../components/icons';

const UpgradeSuccessPage = () => {
    const { setUser } = useAuth();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        const verifySubscription = async () => {
            try {
                // Fetch the user's profile again to get the updated role
                const { data: updatedUser } = await api.get('/auth/me');
                if (updatedUser.role === 'pro') {
                    setUser(updatedUser);
                    setStatus('success');
                } else {
                    // This could happen due to webhook delay.
                    throw new Error("Subscription status not updated yet.");
                }
            } catch (err) {
                 console.error("Verification failed:", err);
                 setStatus('error');
            }
        };

        // Wait a couple of seconds to give the Stripe webhook time to process on the backend.
        const timeoutId = setTimeout(verifySubscription, 2500);

        return () => clearTimeout(timeoutId);
    }, [setUser]);

    return (
        <div className="max-w-2xl mx-auto text-center py-20 bg-white p-10 rounded-2xl shadow-lg">
            {status === 'verifying' && (
                <>
                    <ArrowPathIcon className="h-12 w-12 mx-auto animate-spin text-green-600"/>
                    <h1 className="text-3xl font-bold mt-4">Verifying Your Subscription...</h1>
                    <p className="text-gray-600 mt-2">Please wait a moment while we confirm your payment.</p>
                </>
            )}
            {status === 'success' && (
                <>
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <h1 className="text-3xl font-bold mt-4">Upgrade Successful!</h1>
                    <p className="text-gray-600 mt-2">Welcome to FormaAI Pro! You now have access to all premium features.</p>
                    <Link href="/dashboard" className="mt-6 inline-block bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-green-700">
                        Go to Dashboard
                    </Link>
                </>
            )}
             {status === 'error' && (
                <>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold mt-4 text-red-600">Verification Failed</h1>
                    <p className="text-gray-600 mt-2">We couldn't confirm your subscription automatically. Your Pro status should activate shortly. Please check your profile in a few minutes or contact support if the issue persists.</p>
                     <Link href="/dashboard" className="mt-6 inline-block bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-700">
                        Back to Dashboard
                    </Link>
                </>
            )}
        </div>
    );
};

export default UpgradeSuccessPage;
