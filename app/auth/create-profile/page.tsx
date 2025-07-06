'use client';
import React from 'react';
import Link from 'next/link';
import { LogoIcon } from '../../../components/icons';
import CreateProfileForm from '../../../components/CreateProfileForm';

const CreateProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <LogoIcon className="h-8 w-auto text-green-600" />
            <span className="text-xl font-bold">FormaAI</span>
        </Link>
      </div>
      <div className="w-full max-w-2xl">
         <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Complete Your Profile</h2>
            <p className="text-gray-500 mt-2">This information helps us create the perfect plan for you.</p>
         </div>
         <CreateProfileForm />
      </div>
    </div>
  );
};

export default CreateProfilePage;
