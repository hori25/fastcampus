import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import SmoothScroll from '@/components/SmoothScroll';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Byredo Concept Landing',
  description:
    'A Byredo-inspired immersive landing experience built with Next.js and Tailwind CSS.'
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-white text-ink`}>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}

