
import React, { useState, useCallback } from 'react';
import { UserData, PlanData } from './types';
import { generatePlan } from './services/geminiService';
import UserInputForm from './components/UserInputForm';
import PlanDisplay from './components/PlanDisplay';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = useCallback(async (data: UserData) => {
    setIsLoading(true);
    setError(null);
    setPlanData(null);
    setUserData(data);

    try {
      const generatedPlan = await generatePlan(data);
      setPlanData(generatedPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl mx-auto flex items-center justify-center sm:justify-start mb-6">
        <LogoIcon className="h-10 w-auto text-green-600" />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 ml-3">
          FormaAI
        </h1>
      </header>

      <main className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="p-6 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Your Profile</h2>
            <p className="text-gray-500 mb-6">Tell us about yourself to generate a personalized plan.</p>
            <UserInputForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
          </div>
        </div>
        <div className="lg:col-span-8">
           <PlanDisplay plan={planData} isLoading={isLoading} error={error} />
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto text-center mt-12 text-gray-400 text-sm">
        <p>Powered by AI. Always consult with a healthcare professional before starting any new diet or fitness regimen.</p>
        <p>&copy; 2024 FormaAI. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;
