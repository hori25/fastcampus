'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// 좌측 이미지 (아래에서 위로)
const leftImages = [
  '/assets/main1_1.png',
  '/assets/main2_1.png',
];

// 우측 이미지 (위에서 아래로)
const rightImages = [
  '/assets/main_1_2.png',
  '/assets/main_2_2.png',
];

export default function Hero() {
  const leftSlide1Ref = useRef<HTMLDivElement>(null);
  const leftSlide2Ref = useRef<HTMLDivElement>(null);
  const rightSlide1Ref = useRef<HTMLDivElement>(null);
  const rightSlide2Ref = useRef<HTMLDivElement>(null);
  
  const currentSlide = useRef(0);

  useEffect(() => {
    // 초기 상태: 두 이미지 모두 같은 위치에 있고, 위에 있는 이미지만 보임
    gsap.set(leftSlide1Ref.current, { y: '0%' });
    gsap.set(leftSlide2Ref.current, { y: '0%' });
    gsap.set(rightSlide1Ref.current, { y: '0%' });
    gsap.set(rightSlide2Ref.current, { y: '0%' });

    const animateSlide = () => {
      if (currentSlide.current === 0) {
        // 슬라이드1이 나가면서 슬라이드2가 드러남
        const tl = gsap.timeline();

        // 좌측: 슬라이드1이 위로 나감 (슬라이드2는 그 자리에 있음)
        tl.to(leftSlide1Ref.current, {
          y: '-100%',
          duration: 1.2,
          ease: 'power3.inOut'
        }, 0);

        // 우측: 슬라이드1이 아래로 나감 (슬라이드2는 그 자리에 있음)
        tl.to(rightSlide1Ref.current, {
          y: '100%',
          duration: 1.2,
          ease: 'power3.inOut'
        }, 0);

        currentSlide.current = 1;
      } else {
        // 슬라이드1이 다시 들어오면서 슬라이드2를 덮음
        const tl = gsap.timeline();

        // 좌측: 슬라이드1이 아래에서 올라옴
        tl.fromTo(leftSlide1Ref.current, 
          { y: '100%' },
          {
            y: '0%',
            duration: 1.2,
            ease: 'power3.inOut'
          }
        , 0);

        // 우측: 슬라이드1이 위에서 내려옴
        tl.fromTo(rightSlide1Ref.current, 
          { y: '-100%' },
          {
            y: '0%',
            duration: 1.2,
            ease: 'power3.inOut'
          }
        , 0);

        currentSlide.current = 0;
      }
    };

    const interval = setInterval(animateSlide, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="fixed top-0 left-0 h-screen w-full overflow-hidden" style={{ zIndex: 0 }}>
      <div className="grid h-full w-full grid-cols-2">
        {/* 좌측 이미지 영역 */}
        <div className="relative h-full w-full overflow-hidden">
          {/* 슬라이드 2 (아래 레이어 - 항상 제자리) */}
          <div 
            ref={leftSlide2Ref}
            className="absolute inset-0"
          >
            <Image
              src={leftImages[1]}
              alt="Hero Left 2"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
          {/* 슬라이드 1 (위 레이어 - 움직임) */}
          <div 
            ref={leftSlide1Ref}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={leftImages[0]}
              alt="Hero Left 1"
              fill
              className="object-cover"
              priority
              sizes="50vw"
            />
          </div>
        </div>

        {/* 우측 이미지 영역 */}
        <div className="relative h-full w-full overflow-hidden">
          {/* 슬라이드 2 (아래 레이어 - 항상 제자리) */}
          <div 
            ref={rightSlide2Ref}
            className="absolute inset-0"
          >
            <Image
              src={rightImages[1]}
              alt="Hero Right 2"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
          {/* 슬라이드 1 (위 레이어 - 움직임) */}
          <div 
            ref={rightSlide1Ref}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={rightImages[0]}
              alt="Hero Right 1"
              fill
              className="object-cover"
              priority
              sizes="50vw"
            />
          </div>
        </div>
      </div>

      {/* 텍스트 오버레이 - Horizontal 일직선 배치 */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
        {/* 좌측 텍스트 - 좌측 10px */}
        <p className="absolute left-[10px] font-['sk-modernist'] text-[11px] font-light uppercase tracking-[0.3em] text-white/70">
          La Collection
        </p>

        {/* 중앙 텍스트 - 가운데 정렬 */}
        <div className="flex w-full items-baseline justify-center gap-4">
          <h1 className="font-['sk-modernist'] text-[32px] font-light uppercase tracking-[0.4em] text-white">
            BYREDO
          </h1>
          <span className="font-['sk-modernist'] text-[14px] font-light tracking-[0.2em] text-white/80">
            PARFUMS
          </span>
        </div>

        {/* 우측 텍스트 - 우측 10px */}
        <div className="absolute right-[10px] flex items-center gap-3">
          <p className="font-['sk-modernist'] text-[11px] font-light uppercase tracking-[0.3em] text-white/70">
            La Maison
          </p>
          <div className="flex h-[20px] w-[20px] items-center justify-center border border-white/50">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 9L9 1M9 1H3M9 1V7" stroke="white" strokeWidth="1" strokeOpacity="0.7"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
