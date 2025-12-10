'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const socials = [
  { name: 'SUNDAZED', fontSize: '12px', width: '92px' },
  { name: 'MOJAVE GHOST', fontSize: '11.6px', width: '120px' },
  { name: 'GYPSY WATER', fontSize: '11.6px', width: '110px' },
  { name: 'SUPER CEDAR', fontSize: '11.4px', width: '108px' },
  { name: "BAL D'AFRIQUE", fontSize: '11.1px', width: '122px' }
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      // Bottom-to-top Reveal - 로고 이미지가 아래에서 위로 드러나는 마스킹 애니메이션
      const logoImage = footerRef.current!.querySelector('.footer-logo-image');
      if (logoImage) {
        gsap.fromTo(
          logoImage,
          {
            opacity: 0,
            clipPath: 'inset(100% 0% 0% 0%)' // 아래에서부터 잘려 있다가
          },
          {
            opacity: 1,
            clipPath: 'inset(0% 0% 0% 0%)', // 전체가 위로부터 드러남
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: logoImage,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // Footer 콘텐츠 등장
      const footerContent = footerRef.current!.querySelector('.footer-content');
      if (footerContent) {
        gsap.fromTo(
          footerContent,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: footerContent,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative flex w-full flex-col items-center bg-white pt-[100px] pb-[60px]">
      <div className="w-full px-[10px]">
        {/* BYREDO Logo SVG - Bottom-to-top Reveal */}
        <div className="footer-logo relative w-full py-[40px] overflow-hidden">
          <Image
            src="/assets/logo.svg"
            alt="BYREDO"
            width={1283}
            height={284}
            className="footer-logo-image w-full"
            priority
          />
        </div>

        {/* Footer Content - Text blocks under the logo (center + right) */}
        <div className="footer-content mt-3 flex w-full items-start justify-between gap-[20px] text-black">
          {/* Center text block */}
          <div className="flex flex-col gap-[2px] text-[11px] leading-[1.4] tracking-[0.02em]">
            <p className="font-['sk-modernist']">Mouthwash Research Center</p>
            <p className="font-['sk-modernist']">Findings</p>
            <p className="font-['sk-modernist']">Café Tondo</p>
          </div>

          {/* Right text block */}
          <div className="flex flex-col items-end gap-[2px] text-[11px] leading-[1.4] tracking-[0.02em]">
            <p className="font-['sk-modernist']">970 N Broadway, U 103</p>
            <p className="font-['sk-modernist']">Los Angeles, 90012</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
