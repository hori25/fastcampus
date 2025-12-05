'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
        isScrolled 
          ? 'bg-transparent border-transparent backdrop-blur-none' 
          : 'bg-white/95 backdrop-blur-sm border-black/5'
      }`}
    >
      <div className="section-shell">
        <div className="grid grid-cols-12 items-center gap-[10px] py-2">
          <nav className="col-span-4 flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] text-ink">
            <a href="/shop" className="transition-opacity hover:opacity-60">
              Shop
            </a>
            <a href="/offline-store" className="transition-opacity hover:opacity-60">
              Offline Store
            </a>
          </nav>

          <div className="col-span-4 flex justify-center">
            <a href="/" className="transition-opacity hover:opacity-80">
              <Image
                src="/assets/logo.svg"
                alt="BYREDO"
                width={80}
                height={18}
                className="h-auto w-[80px]"
                priority
              />
            </a>
          </div>

          <div className="col-span-4 flex items-center justify-end gap-6 text-[11px] uppercase tracking-[0.2em] text-ink">
            <a href="/mypage" className="transition-opacity hover:opacity-60">
              My Page
            </a>
            <a href="/login" className="transition-opacity hover:opacity-60">
              Login / Join
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

