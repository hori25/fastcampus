'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import mainLeft1 from '@/assets/main/main1_1_.png';
import mainLeft2 from '@/assets/main/main2_1_.png';
import mainLeft3 from '@/assets/main/main3_1_.png';
import mainRight1 from '@/assets/main/main1_2_.png';
import mainRight2 from '@/assets/main/main2_2_.png';
import mainRight3 from '@/assets/main/main3_2_.png';

// 좌측 이미지 (아래에서 위로)
const leftImages = [mainLeft1, mainLeft2, mainLeft3];

// 우측 이미지 (위에서 아래로)
const rightImages = [mainRight1, mainRight2, mainRight3];

export default function Hero() {
  const leftSlidesRef = useRef<HTMLDivElement[]>([]);
  const rightSlidesRef = useRef<HTMLDivElement[]>([]);
  
  const currentSlide = useRef(0);

  const getInitialStyle = (idx: number, isLeft: boolean) => ({
    transform: `translateY(${idx === 0 ? '0%' : isLeft ? '100%' : '-100%'})`,
  });

  useEffect(() => {
    const total = leftImages.length;

    // 초기 위치 설정 (opacity는 항상 1로 유지해 겹침 보장)
    leftSlidesRef.current.forEach((el, idx) => {
      gsap.set(el, { y: idx === 0 ? '0%' : '100%' });
    });
    rightSlidesRef.current.forEach((el, idx) => {
      gsap.set(el, { y: idx === 0 ? '0%' : '-100%' });
    });

    const animateSlide = () => {
      const next = (currentSlide.current + 1) % total;

      // 다음 슬라이드를 시작 위치로 배치
      gsap.set(leftSlidesRef.current[next], { y: '100%' });
      gsap.set(rightSlidesRef.current[next], { y: '-100%' });

      const tl = gsap.timeline();

      // 좌측: 현재 위로 퇴장, 다음이 아래에서 올라옴
      tl.to(leftSlidesRef.current[currentSlide.current], {
        y: '-100%',
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);
      tl.to(leftSlidesRef.current[next], {
        y: '0%',
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      // 우측: 현재 아래로 퇴장, 다음이 위에서 내려옴
      tl.to(rightSlidesRef.current[currentSlide.current], {
        y: '100%',
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);
      tl.to(rightSlidesRef.current[next], {
        y: '0%',
        duration: 1.2,
        ease: 'power3.inOut'
      }, 0);

      currentSlide.current = next;
    };

    const interval = setInterval(animateSlide, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="fixed top-0 left-0 h-screen w-full overflow-hidden" style={{ zIndex: 0 }}>
      <div className="grid h-full w-full grid-cols-2">
        {/* 좌측 이미지 영역 */}
        <div className="relative h-full w-full overflow-hidden">
          {leftImages.map((src, idx) => (
            <div
              key={idx}
              ref={(el) => {
                if (el) leftSlidesRef.current[idx] = el;
              }}
              className="absolute inset-0 will-change-transform"
              style={getInitialStyle(idx, true)}
            >
              <Image
                src={src}
                alt={`Hero Left ${idx + 1}`}
                fill
                className="object-cover"
                priority={idx === 0}
                sizes="50vw"
              />
            </div>
          ))}
        </div>

        {/* 우측 이미지 영역 */}
        <div className="relative h-full w-full overflow-hidden">
          {rightImages.map((src, idx) => (
            <div
              key={idx}
              ref={(el) => {
                if (el) rightSlidesRef.current[idx] = el;
              }}
              className="absolute inset-0 will-change-transform"
              style={getInitialStyle(idx, false)}
            >
              <Image
                src={src}
                alt={`Hero Right ${idx + 1}`}
                fill
                className="object-cover"
                priority={idx === 0}
                sizes="50vw"
              />
            </div>
          ))}
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
