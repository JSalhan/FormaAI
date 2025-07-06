'use client';
import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SparklesIcon, DocumentTextIcon, ChartBarIcon, StarIcon } from '../../components/icons';

const NavCard = ({ href, icon, title, description, proOnly = false }: { href: string, icon: React.ReactNode, title: string, description: string, proOnly?: boolean }) => {
    const { user } = useAuth();
    const isProUser = user?.role === 'pro';

    const cardContent = (
        <motion.div
            whileHover="hover"
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-start h-full border-2 border-transparent transition-all duration-300"
            variants={{
                hover: {
                    scale: 1.03,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    borderColor: '#22c55e'
                }
            }}
        >
            <div className={`mb-4 p-3 rounded-full bg-green-100 text-green-600`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center">{title} {proOnly && <StarIcon className="h-5 w-5 text-yellow-400 ml-2" />}</h3>
            <p className="text-gray-500 mt-2 flex-grow">{description}</p>
        </motion.div>
    );

    if (proOnly && !isProUser) {
        return (
            <div className="relative">
                {cardContent}
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-center p-4">
                    <p className="font-bold text-gray-700">This is a Pro Feature</p>
                    <Link href="/upgrade" className="mt-2 bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-700 transition-transform hover:scale-105">
                        Upgrade Now
                    </Link>
                </div>
            </div>
        );
    }
    
    return <Link href={href}>{cardContent}</Link>;
};

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [isBannerVisible, setIsBannerVisible] = useState(true);

    return (
        <div className="space-y-8">
            {user?.role === 'free' && isBannerVisible && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-xl">Unlock Your Full Potential!</h2>
                        <p className="opacity-90">Upgrade to Pro for advanced features like custom cuisine preferences and real-time chat.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/upgrade" className="bg-white text-green-600 font-bold py-2 px-5 rounded-lg hover:bg-gray-100 transition">
                            Upgrade Now
                        </Link>
                        <button onClick={() => setIsBannerVisible(false)} className="p-1 rounded-full hover:bg-white/20" aria-label="Dismiss">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}

            <div>
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
                <p className="text-gray-500 mt-1">Ready to take control of your fitness journey? Here's where to start.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <NavCard 
                    href="/dashboard/current-plan"
                    icon={<DocumentTextIcon className="h-8 w-8"/>}
                    title="Current Plan"
                    description="View, manage, and generate your personalized diet and workout plans."
                    proOnly={true}
                 />
                 <NavCard
                    href="/dashboard/track-progress"
                    icon={<ChartBarIcon className="h-8 w-8" />}
                    title="Track Progress"
                    description="Log your daily meals, workouts, and weight. See your trends over time."
                    proOnly={true}
                 />
                 <NavCard
                    href="/feed"
                    icon={<SparklesIcon className="h-8 w-8" />}
                    title="Community Feed"
                    description="Connect with others, share your progress, and find motivation."
                 />
            </div>
        </div>
    );
};

export default DashboardPage;
