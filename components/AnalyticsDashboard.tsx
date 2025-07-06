'use client';

import React from 'react';
import { Log } from '../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { ArrowPathIcon } from './icons';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface AnalyticsDashboardProps {
  logs: Log[] | undefined;
  isLoading: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ logs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center min-h-[200px]">
        <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
        <p className="ml-3 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center min-h-[200px] flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold text-gray-700">No Data Yet</h3>
        <p className="text-gray-500 mt-1">Start logging your meals and weight to see your progress here.</p>
      </div>
    );
  }

  // Process data for charts
  const weightLogs = logs.filter(log => log.weight != null).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const weightData = {
    labels: weightLogs.map(log => new Date(log.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: weightLogs.map(log => log.weight),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const macroData = logs
    .flatMap(log => log.meals)
    .reduce(
      (acc, meal) => {
        acc.protein += meal.macros?.protein || 0;
        acc.carbs += meal.macros?.carbs || 0;
        acc.fat += meal.macros?.fat || 0;
        return acc;
      },
      { protein: 0, carbs: 0, fat: 0 }
    );
    
  const totalMacros = macroData.protein + macroData.carbs + macroData.fat;

  const macroChartData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        label: 'Macro Distribution (g)',
        data: [macroData.protein, macroData.carbs, macroData.fat],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        font: {
            size: 16
        }
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64">
           {weightData.labels.length > 1 ? (
                <Line options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Weight Trend'}}}} data={weightData} />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">Log weight on multiple days to see a trend.</div>
            )}
        </div>
        <div className="h-64">
          {totalMacros > 0 ? (
            <Doughnut options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {position: 'right' as const}, title: {...chartOptions.plugins.title, text: 'Macro Distribution'}}}} data={macroChartData} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Log meals with macros to see your distribution.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
