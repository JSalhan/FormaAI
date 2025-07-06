'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { PlanData } from '../../../types';
import PlanDisplay from '../../../components/PlanDisplay';
import { SparklesIcon, ArrowPathIcon } from '../../../components/icons';

const fetchCurrentPlan = async (): Promise<PlanData> => {
  const { data } = await api.get('/diet/current');
  return data;
};

const generateNewPlan = async (): Promise<PlanData> => {
    const { data } = await api.post('/diet/generate');
    return data;
}

const CurrentPlanPage: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (user && user.role === 'free') {
            router.push('/upgrade');
        }
    }, [user, router]);
    
    const { data: planData, isLoading: isPlanLoading, error: planError } = useQuery<PlanData, Error>({
        queryKey: ['currentPlan'],
        queryFn: fetchCurrentPlan,
        retry: (failureCount, error: any) => {
            if (error.response?.status === 404) return false;
            return failureCount < 3;
        },
        enabled: user?.role === 'pro',
    });

    const { mutate: generatePlan, isPending: isGenerating } = useMutation({
        mutationFn: generateNewPlan,
        onSuccess: (newPlan) => {
            queryClient.setQueryData(['currentPlan'], newPlan);
        },
        onError: (error) => {
            console.error("Failed to generate new plan", error);
        }
    });

    const planExists = !!planData && !planError;
    const planErrorMessage = (planError && (planError as any).response?.status !== 404) ? planError.message : null;

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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Your Current Plan</h1>
                    <p className="text-gray-500 mt-1">This is your active diet and workout schedule. Regenerate it anytime.</p>
                </div>
                <button 
                    onClick={() => generatePlan()}
                    disabled={isGenerating}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                >
                    {isGenerating ? (
                        <>
                            <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                            Regenerating...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="h-5 w-5 mr-2" />
                            {planExists ? 'Regenerate Plan' : 'Generate My Plan'}
                        </>
                    )}
                </button>
            </div>
            <PlanDisplay plan={planData ?? null} isLoading={isPlanLoading || isGenerating} error={planErrorMessage} />
        </div>
    );
};

export default CurrentPlanPage;
