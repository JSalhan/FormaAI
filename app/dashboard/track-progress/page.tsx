'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { Log } from '../../../types';
import AnalyticsDashboard from '../../../components/AnalyticsDashboard';
import LogModal from '../../../components/LogModal';

const fetchLogs = async (): Promise<Log[]> => {
    const { data } = await api.get('/logs');
    return data;
};

const TrackProgressPage: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [logModalState, setLogModalState] = useState<{ isOpen: boolean, type: 'meal' | 'workout' | 'weight' | null }>({ isOpen: false, type: null });

    useEffect(() => {
        if (user && user.role === 'free') {
            router.push('/upgrade');
        }
    }, [user, router]);
    
    const { data: logsData, isLoading: areLogsLoading } = useQuery<Log[], Error>({
        queryKey: ['logs'],
        queryFn: fetchLogs,
        enabled: user?.role === 'pro'
    });
    
    const openLogModal = (type: 'meal' | 'workout' | 'weight') => {
        setLogModalState({ isOpen: true, type });
    };

    const closeLogModal = () => {
        setLogModalState({ isOpen: false, type: null });
    };

    if (user?.role === 'free') {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Redirecting to upgrade...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Track Your Progress</h1>
                <p className="text-gray-500 mt-1">Log your daily activities and stats to see your trends and stay motivated.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add a New Log</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button onClick={() => openLogModal('meal')} className="w-full flex items-center justify-center py-3 px-4 bg-blue-50 border border-blue-200 text-blue-800 font-semibold rounded-lg shadow-sm hover:bg-blue-100 transition-colors transform hover:scale-105">Log Meal</button>
                    <button onClick={() => openLogModal('workout')} className="w-full flex items-center justify-center py-3 px-4 bg-purple-50 border border-purple-200 text-purple-800 font-semibold rounded-lg shadow-sm hover:bg-purple-100 transition-colors transform hover:scale-105">Log Workout</button>
                    <button onClick={() => openLogModal('weight')} className="w-full flex items-center justify-center py-3 px-4 bg-gray-100 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-200 transition-colors transform hover:scale-105">Log Weight</button>
                </div>
            </div>

            <AnalyticsDashboard logs={logsData} isLoading={areLogsLoading} />

            {logModalState.isOpen && (
                <LogModal
                    isOpen={logModalState.isOpen}
                    onClose={closeLogModal}
                    logType={logModalState.type!}
                />
            )}
        </div>
    );
};

export default TrackProgressPage;
