'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '../../../components/AuthForm';
import { LogoIcon } from '../../../components/icons';
import useAuth from '../../../hooks/useAuth';
import api from '../../../lib/api';
import Link from 'next/link';

const SignupPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();

  const handleSignup = async (data: any) => {
    const response = await api.post('/auth/signup', {
      name: data.name,
      email: data.email,
      password: data.password,
    });
    
    if (response.data.token && response.data.user) {
      login(response.data.user, response.data.token);
      router.push('/auth/create-profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <LogoIcon className="h-8 w-auto text-green-600" />
                <span className="text-xl font-bold">FormaAI</span>
            </Link>
        </div>
        <AuthForm formType="signup" onSubmit={handleSignup} />
    </div>
  );
};

export default SignupPage;