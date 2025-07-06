'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LogoIcon, DumbbellIcon, PlateIcon, SparklesIcon } from '../components/icons';

const FeatureCard = ({ icon, title, description, index }: { icon: React.ReactNode; title: string; description: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20"
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-400/20 text-green-300 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

const LandingPage: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const position = useTransform(scrollYProgress, (pos) => (pos >= 1 ? 'relative' : 'fixed'));
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div ref={targetRef} className="bg-slate-900 text-white">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 p-4 sm:px-8 flex justify-between items-center bg-black/20 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <LogoIcon className="h-8 w-auto text-green-400" />
          <span className="text-2xl font-bold">FormaAI</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/auth/login" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            Log In
          </Link>
          <Link href="/auth/signup" className="px-4 py-2 text-sm font-medium text-black bg-green-400 rounded-lg hover:bg-green-300 transition-colors font-semibold">
            Get Started
          </Link>
        </nav>
      </motion.header>

      <motion.section
        style={{ opacity, scale, position, y }}
        className="h-screen w-full flex flex-col justify-center items-center text-center p-4 animated-gradient"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight"
        >
          Forge Your Ultimate Form
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto text-lg text-gray-200 mb-8"
        >
          Harness the power of AI to receive hyper-personalized fitness and diet plans. Stop guessing, start achieving.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex gap-4"
        >
          <Link href="/auth/signup" className="bg-green-400 text-black font-bold py-3 px-8 rounded-lg shadow-2xl hover:bg-green-300 transition-transform duration-300 hover:scale-105">
            Get Your Free Plan
          </Link>
          <a href="#features" className="bg-white/10 text-white font-semibold py-3 px-8 rounded-lg shadow-lg backdrop-blur-sm hover:bg-white/20 transition-transform duration-300 hover:scale-105">
            Learn More
          </a>
        </motion.div>
      </motion.section>
      
      <div className="relative z-10 bg-slate-900">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-transparent to-slate-900"></div>

        <section id="features" className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                className="text-4xl font-bold text-center text-white mb-12"
            >
                How It Works
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                index={0}
                icon={<SparklesIcon className="h-7 w-7" />}
                title="AI-Powered Personalization"
                description="Our advanced AI analyzes your profile—age, goals, and lifestyle—to create plans that are uniquely yours."
              />
              <FeatureCard
                index={1}
                icon={<PlateIcon className="h-7 w-7" />}
                title="Dynamic Diet Plans"
                description="Get delicious, easy-to-follow meal plans tailored to your calorie needs and dietary preferences."
              />
              <FeatureCard
                index={2}
                icon={<DumbbellIcon className="h-7 w-7" />}
                title="Effective Workout Routines"
                description="From strength training to rest days, receive a balanced weekly workout schedule to maximize your results."
              />
            </div>
          </div>
        </section>

         <footer className="text-center py-8 bg-slate-900 border-t border-white/10 text-gray-400 text-sm">
            <p>&copy; 2024 FormaAI. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;