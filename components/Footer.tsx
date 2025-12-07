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
      // Soft Wipe Transition - 로고 등장
      const logo = footerRef.current!.querySelector('.footer-logo');
      if (logo) {
        gsap.fromTo(
          logo,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: logo,
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
    <footer ref={footerRef} className="relative flex w-full flex-col items-center gap-[222px] bg-white pt-[100px] pb-[50px]">
      <div className="mx-auto w-full max-w-[1440px] px-[10px]">
        {/* BYREDO Logo SVG - Soft Wipe */}
        <div className="footer-logo relative flex w-full items-center justify-center py-[50px]">
          <Image
            src="/assets/logo.svg"
            alt="BYREDO"
            width={1283}
            height={284}
            className="w-full max-w-[1283px]"
            priority
          />
        </div>

        {/* Footer Content - Soft Wipe */}
        <div className="footer-content mx-auto flex w-full max-w-[1384px] flex-[0_0_auto] items-center justify-between gap-[20px] self-stretch py-[10px]">
          
          {/* Left Group: Copyright + Location */}
          <div className="flex items-center gap-[20px]">
            {/* Copyright */}
            <div className="flex h-[14px] items-center justify-center whitespace-nowrap">
              <p className="font-['sk-modernist'] text-[12px] font-normal leading-[20px] tracking-[0.3px] text-[#767676]">
                © 2025 BYREDO
              </p>
            </div>

            {/* Location Selector (Moved here to be inline) */}
            <div className="relative flex items-center gap-2">
              {/* EU Flag Circle */}
              <div className="h-[20px] w-[20px] rounded-full bg-[#003399] flex items-center justify-center">
                 <div className="h-[12px] w-[12px] rounded-full border-2 border-yellow-400" />
              </div>

              {/* Location Text */}
              <a
                href="#"
                className="whitespace-nowrap font-['sk-modernist'] text-[9.8px] font-normal leading-[16px] tracking-[0.3px] text-black underline"
              >
                Europe (€) | English
              </a>
            </div>
          </div>

          {/* Center Group: Social Links */}
          <div className="flex items-center gap-[24px]">
            {socials.map((social) => (
              <a
                key={social.name}
                href="#"
                className="whitespace-nowrap font-['sk-modernist'] font-normal leading-[16px] tracking-[0.3px] text-black transition-opacity hover:opacity-60"
                style={{ fontSize: social.fontSize }}
              >
                {social.name}
              </a>
            ))}
          </div>

          {/* Right Group: Accessibility Icon */}
          <div className="flex items-center justify-end">
            <div className="relative h-[21px] w-[54px]">
              <div className="flex h-full w-full items-center justify-center">
                <svg
                  width="54"
                  height="21"
                  viewBox="0 0 54 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="10.5" cy="10.5" r="10" stroke="#000" strokeWidth="1" />
                  <circle cx="10.5" cy="7" r="1.5" fill="#000" />
                  <path
                    d="M10.5 10V14M8 12H13"
                    stroke="#000"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
