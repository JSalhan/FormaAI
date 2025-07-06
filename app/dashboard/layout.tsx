'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../../hooks/useAuth';
import Header from '../../components/Header';
import useSocket from '../../hooks/useSocket';
import { PlanData } from '../../types';
import ChatSidebar from '../../components/ChatSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  const handlePlanUpdate = (data: { message: string; newPlan: PlanData }) => {
    // A simple alert for now. Could be a more sophisticated toast notification.
    alert(data.message);
    // Optionally, trigger a re-fetch of the plan data here.
    window.location.reload(); // Simple way to refresh data
  };

  useSocket(handlePlanUpdate);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user && !user.isProfileComplete) {
        router.push('/auth/create-profile');
      }
    }
  }, [isAuthenticated, isClient, router, user]);

  if (!isClient || !isAuthenticated || (user && !user.isProfileComplete)) {
    // You can render a loading skeleton or spinner here
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-lg font-semibold text-gray-600">Loading...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </div>
      </main>
      <ChatSidebar />
    </div>
  );
}