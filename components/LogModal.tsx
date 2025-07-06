'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { ArrowPathIcon } from './icons';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logType: 'meal' | 'workout' | 'weight';
}

const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, logType }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({
      date: new Date().toISOString().split('T')[0], // a YYYY-MM-DD string
      mealType: 'Breakfast', // Default value
  });
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: (logData: any) => {
        const payload: { date: string, meals?: any[], workouts?: any[], weight?: number } = {
            date: logData.date,
        };

        if (logType === 'meal') {
            payload.meals = [{
                mealType: logData.mealType,
                description: logData.description,
                calories: Number(logData.calories) || undefined,
                macros: {
                    protein: Number(logData.protein) || undefined,
                    carbs: Number(logData.carbs) || undefined,
                    fat: Number(logData.fat) || undefined,
                }
            }];
        }
        if (logType === 'workout') {
            payload.workouts = [{
                exerciseName: logData.exerciseName,
                sets: Number(logData.sets) || undefined,
                reps: logData.reps,
                weight: Number(logData.weight) || undefined,
            }];
        }
        if (logType === 'weight') {
            payload.weight = Number(logData.weight);
        }

        return api.post('/logs', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['currentPlan'] }); // In case plan gets updated
      onClose();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
  };
  
  const title = `Log Your ${logType.charAt(0).toUpperCase() + logType.slice(1)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                 {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                        <p>{(error as any).response?.data?.message || 'An error occurred.'}</p>
                    </div>
                 )}
                
                <InputField label="Date">
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </InputField>

                {logType === 'meal' && (
                    <>
                        <InputField label="Meal Type">
                            <select name="mealType" value={formData.mealType} onChange={handleChange} required>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snack">Snack</option>
                            </select>
                        </InputField>
                        <InputField label="Description">
                            <input type="text" name="description" onChange={handleChange} placeholder="e.g., Chicken salad" required />
                        </InputField>
                        <InputField label="Calories">
                            <input type="number" name="calories" onChange={handleChange} placeholder="e.g., 350" />
                        </InputField>
                        <p className="text-sm font-medium text-gray-600">Macros</p>
                        <div className="grid grid-cols-3 gap-4">
                            <InputField label="Protein (g)">
                                <input type="number" name="protein" onChange={handleChange} />
                            </InputField>
                            <InputField label="Carbs (g)">
                                <input type="number" name="carbs" onChange={handleChange} />
                            </InputField>
                            <InputField label="Fat (g)">
                                <input type="number" name="fat" onChange={handleChange} />
                            </InputField>
                        </div>
                    </>
                )}

                {logType === 'workout' && (
                    <>
                        <InputField label="Exercise Name">
                            <input type="text" name="exerciseName" onChange={handleChange} required />
                        </InputField>
                        <div className="grid grid-cols-3 gap-4">
                            <InputField label="Sets">
                                <input type="number" name="sets" onChange={handleChange} />
                            </InputField>
                            <InputField label="Reps">
                                <input type="text" name="reps" onChange={handleChange} placeholder="e.g., 8-12" />
                            </InputField>
                            <InputField label="Weight (kg)">
                                <input type="number" step="0.5" name="weight" onChange={handleChange} />
                            </InputField>
                        </div>
                    </>
                )}

                {logType === 'weight' && (
                    <InputField label="Weight (kg)">
                        <input type="number" step="0.1" name="weight" onChange={handleChange} required />
                    </InputField>
                )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 flex items-center">
                    {isPending && <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />}
                    Save Log
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      {React.Children.map(children, child => 
        React.isValidElement(child) ? React.cloneElement(child, { className: 'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500' } as React.HTMLAttributes<HTMLElement>) : child
      )}
    </div>
);

export default LogModal;
