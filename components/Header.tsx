'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../stores/chatStore';
import { LogoIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, StarIcon, SparklesIcon, CreditCardIcon, ChartBarIcon, DocumentTextIcon, ChatBubbleLeftRightIcon } from './icons';

const Tooltip: React.FC<{ text: string, children: React.ReactNode }> = ({ text, children }) => (
    <div className="relative group flex items-center">
        {children}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {text}
        </div>
    </div>
);


const NavItem = ({ href, children, proOnly = false }: { href: string; children: React.ReactNode; proOnly?: boolean }) => {
    const { user } = useAuth();
    const pathname = usePathname();
    const isActive = pathname === href;
    const isProUser = user?.role === 'pro';

    if (proOnly && !isProUser) {
        return (
            <Tooltip text="Upgrade to Pro to access this feature">
                <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-400 cursor-not-allowed">
                    {children} <StarIcon className="h-4 w-4 text-yellow-500 opacity-50"/>
                </span>
            </Tooltip>
        );
    }
    
    return (
        <Link href={href} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}>
            {children}
        </Link>
    );
};


const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const openSidebar = useChatStore((state) => state.openSidebar);

    const handleMouseEnter = () => {
        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
        setDropdownOpen(true);
    };
    const handleMouseLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setDropdownOpen(false);
        }, 500);
    };

    const portalMutation = useMutation({
        mutationFn: () => api.post('/payment/create-portal-session'),
        onSuccess: (response: { data: { url: string } }) => {
            const { url } = response.data;
            if (url) {
                window.location.href = url;
            }
        },
        onError: (error) => {
            console.error("Could not create customer portal session", error);
            alert("Error accessing subscription management. Please try again later.");
        }
    });

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    useEffect(() => {
        return () => {
            if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
        };
    }, []);

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Desktop Nav */}
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
                            <LogoIcon className="h-8 w-auto text-green-600" />
                            <span className="text-xl font-bold text-gray-800 hidden sm:inline">FormaAI</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-2">
                            <NavItem href="/dashboard">Home</NavItem>
                            <NavItem href="/feed">Community</NavItem>
                            <NavItem href="/dashboard/current-plan" proOnly>Current Plan</NavItem>
                            <NavItem href="/dashboard/track-progress" proOnly>Track Progress</NavItem>
                            {user?.role === 'free' && <NavItem href="/upgrade">Upgrade</NavItem>}
                        </nav>
                    </div>

                    {/* Right side: Profile Dropdown */}
                    <div className="flex items-center gap-4">
                        {user ? (
                           <>
                             {user.role === 'pro' && (
                                <button
                                    onClick={() => openSidebar()}
                                    className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                                    aria-label="Open chat"
                                >
                                    <ChatBubbleLeftRightIcon className="h-6 w-6" />
                                    {/* Notification dot example */}
                                    {/* <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" /> */}
                                </button>
                             )}
                            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                                <button onFocus={handleMouseEnter} onBlur={handleMouseLeave} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full">
                                    <span className="sr-only">Open user menu</span>
                                    <img
                                        className="h-9 w-9 rounded-full object-cover"
                                        src={user.profilePicUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=0D8ABC&color=fff`}
                                        alt="User"
                                    />
                                    <span className="hidden sm:inline">{user.name}</span>
                                    {user.role === 'pro' && (
                                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                            <StarIcon className="h-3 w-3 mr-1 text-yellow-500" /> PRO
                                        </span>
                                    )}
                                </button>
                                <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        onFocus={handleMouseEnter} 
                                        onBlur={handleMouseLeave}
                                        className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    >
                                        {user.role === 'free' && (
                                            <Link href="/upgrade" className="flex items-center w-full text-left px-4 py-2 text-sm text-green-600 font-semibold hover:bg-gray-100">
                                                <SparklesIcon className="h-5 w-5 mr-2" />
                                                Upgrade to Pro
                                            </Link>
                                        )}
                                        <Link href="/dashboard/profile" className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100">
                                            <UserCircleIcon className="h-5 w-5 mr-2" />
                                            Edit Profile
                                        </Link>
                                        {user.role === 'pro' && (
                                            <button onClick={() => portalMutation.mutate()} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <CreditCardIcon className="h-5 w-5 mr-2" />
                                                Manage Subscription
                                            </button>
                                        )}
                                        <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100">
                                            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                                            Log Out
                                        </button>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                           </>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Log In</Link>
                                <Link href="/auth/signup" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">Sign Up</Link>
                            </div>
                        )}
                         {/* Hamburger Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500">
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? (
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

             {/* Mobile Menu */}
             <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <NavItem href="/dashboard">Home</NavItem>
                            <NavItem href="/feed">Community</NavItem>
                            <NavItem href="/dashboard/current-plan" proOnly>Current Plan</NavItem>
                            <NavItem href="/dashboard/track-progress" proOnly>Track Progress</NavItem>
                            {user?.role === 'free' && <NavItem href="/upgrade">Upgrade</NavItem>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;