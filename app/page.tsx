 'use client';

import { useEffect, useState } from 'react';
import BrandEssay from '@/components/BrandEssay';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Newsletter from '@/components/Newsletter';
import ProductGrid from '@/components/ProductGrid';
import SplashScreen from '@/components/SplashScreen';

export default function HomePage() {
  const [splashPhase, setSplashPhase] = useState<'visible' | 'hiding' | 'hidden'>('visible');

  useEffect(() => {
    // 3초 동안 로고 드로잉 애니메이션만 보여주기
    const startHideTimer = setTimeout(() => {
      setSplashPhase('hiding');
    }, 3000);

    // 와이퍼 애니메이션(0.8초) 이후 컴포넌트 제거
    const removeTimer = setTimeout(() => {
      setSplashPhase('hidden');
    }, 3800);

    return () => {
      clearTimeout(startHideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <div className="relative">
      {splashPhase !== 'hidden' && (
        <SplashScreen phase={splashPhase === 'hiding' ? 'hiding' : 'visible'} />
      )}

      <div className={splashPhase === 'visible' ? 'pointer-events-none select-none' : ''}>
        <Header transparent />
        <Hero />
        {/* Hero 높이만큼 spacer */}
        <div className="h-screen" />
        <main className="relative bg-white text-ink" style={{ zIndex: 10 }}>
          <ProductGrid />
          <BrandEssay />
          <Gallery />
          <Newsletter />
          <Footer />
        </main>
      </div>
    </div>
  );
}

