import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './../styles/globals.css';
import QueryProvider from '../components/QueryProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FormaAI: AI Diet & Fitness',
  description: 'An AI-powered application that generates personalized diet and fitness plans based on your profile and goals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}