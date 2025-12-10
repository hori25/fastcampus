'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BrandEssay() {
  const sectionRef = useRef<HTMLElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const lastSpawnTimeRef = useRef(0);
  const spawnIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const basePoolRef = useRef<string[]>([
    '/assets/third/06a26ecb2b36382d23d4ec52eb9e3547.jpg',
    '/assets/third/1ac9caeddaded3252f77b3fd0f1314b9.jpg',
    '/assets/third/26f5ffed3d3d6e932ab83d2e964c44ab.jpg',
    '/assets/third/411063cbf2810c9d225649a475245795.jpg',
    '/assets/third/457e2a712e64b3575b9e685dcdfc1488.jpg',
    '/assets/third/4f4b57256f2f727ac5d3906dda206b62.jpg',
    '/assets/third/5569f5b4d6cb2d52401e24ed1cbd2de7.jpg',
    '/assets/third/59aff09c965bb558b5403dfbbfcd4507.jpg',
    '/assets/third/7b62f660c2c653f6df3a0d4a7e5b8ad0.jpg',
    '/assets/third/80b0fcbb7ccdc11253a8d12ed689d66b.jpg',
    '/assets/third/938e616f08e040dda7ac16105fdffd11.jpg',
    '/assets/third/99d2de151233233e825c0b711e20596b.jpg',
    '/assets/third/bc0a74cf9d913ed5932a8b5ee6e26121.jpg',
    '/assets/third/c85a915388e9f08f71fddde83d4a0048.jpg',
    '/assets/third/fd157c1eb7713b21f92061720a63ad14.jpg',
  ]);
  const queueRef = useRef<string[]>([]);
  const getNextImage = () => {
    if (queueRef.current.length === 0) {
      // 새로 섞어서 큐에 채움 (중복 없이 한 바퀴씩)
      const shuffled = [...basePoolRef.current].sort(() => Math.random() - 0.5);
      queueRef.current = shuffled;
    }
    return queueRef.current.shift()!;
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 텍스트는 수직으로만 이동 (움직임 절반)
      const scrollTexts = sectionRef.current!.querySelectorAll('.scroll-text');
      scrollTexts.forEach((text) => {
        const speed = parseFloat(text.getAttribute('data-speed') || '1');
        const yMove = -100 * speed;

        gsap.fromTo(
          text,
          { y: 200 },
          {
            y: yMove,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        );
      });

      // Glass Blur Reveal - 이미지 블러가 걷히는 효과
      const blurImage = sectionRef.current!.querySelector('.blur-reveal');
      if (blurImage) {
        gsap.fromTo(
          blurImage,
          { filter: 'blur(8px) contrast(0.9)', opacity: 0.7 },
          {
            filter: 'blur(0px) contrast(1.05)',
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: blurImage,
              start: 'top 80%',
              end: 'top 20%',
              scrub: 1
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 데스크톱 여부 체크
  useEffect(() => {
    const touch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setIsDesktop(!touch);

    // 초기 위치를 뷰포트 중앙으로 설정
    if (typeof window !== 'undefined') {
      const updateCenter = () => {
        lastPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      };
      updateCenter();
      window.addEventListener('resize', updateCenter);
      return () => window.removeEventListener('resize', updateCenter);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDesktop) return;
    if (!isInside || !isActive) return;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    const now = performance.now();
    // 스폰 간격: 300ms (이전보다 약 3배 느리게)
    if (now - lastSpawnTimeRef.current > 300) {
      lastSpawnTimeRef.current = now;
      spawnPreview(e.clientX, e.clientY);
    }
  };

  const handleEnterSection = () => {
    if (!isDesktop) return;
    setIsInside(true);
    setIsActive(true);
    // 섹션 진입 시 포인터를 움직이지 않아도 한 번 스폰
    const now = performance.now();
    lastSpawnTimeRef.current = now;
    spawnPreview(lastPosRef.current.x, lastPosRef.current.y);
  };

  const handleLeaveSection = () => {
    if (!isDesktop) return;
    setIsInside(false);
    setIsActive(false);
    if (previewContainerRef.current) previewContainerRef.current.innerHTML = '';
  };

  const handleTargetEnter = (imgSrc?: string | null) => {
    if (!isDesktop) return;
    setIsActive(true);
  };

  const handleTargetLeave = () => {
    if (!isDesktop) return;
    setIsActive(true);
  };

  // 섹션 안에 머무르는 동안, 마우스가 안 움직여도 주기적으로 스폰
  useEffect(() => {
    if (!isDesktop) return;
    if (!isInside || !isActive) return;
    const interval = setInterval(() => {
      const now = performance.now();
      // 자동 스폰 간격도 약 3배 느리게 (100ms -> 300ms)
      if (now - lastSpawnTimeRef.current > 300) {
        lastSpawnTimeRef.current = now;
        spawnPreview(lastPosRef.current.x, lastPosRef.current.y);
      }
    }, 420); // 140ms -> 420ms (3배 느리게)
    return () => clearInterval(interval);
  }, [isDesktop, isInside, isActive]);

  const spawnPreview = (x: number, y: number) => {
    if (!previewContainerRef.current) return;
    const imgSrc = getNextImage();
    const size = 160; // 이미지 사이즈 조금 더 크게
    const imgEl = document.createElement('img');
    imgEl.src = imgSrc;
    imgEl.onerror = () => {
      const fallback = getNextImage();
      imgEl.src = fallback;
    };
    imgEl.alt = 'cursor-preview';
    imgEl.style.position = 'fixed';
    imgEl.style.left = `${x}px`;
    imgEl.style.top = `${y}px`;
    imgEl.style.width = `${size}px`;
    imgEl.style.height = `${size}px`;
    const rot = (Math.random() - 0.5) * 16; // -8 ~ 8deg
    // 처음에는 약간 작게 시작
    imgEl.style.transform = `translate(-50%, -50%) scale(0.7) rotate(${rot}deg)`;
    imgEl.style.opacity = '0';
    imgEl.style.pointerEvents = 'none';
    imgEl.style.zIndex = '300';
    imgEl.style.objectFit = 'contain';
    imgEl.style.willChange = 'transform, opacity';
    // 등장/퇴장 시 확대 → 축소되는 인터랙션
    imgEl.style.transition =
      'opacity 0.8s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)';

    previewContainerRef.current.appendChild(imgEl);

    // 등장 애니메이션 (scale 0.7 -> 1.15 줌인 + fade in)
    requestAnimationFrame(() => {
      imgEl.style.opacity = '1';
      imgEl.style.transform = `translate(-50%, -50%) scale(1.15) rotate(${rot}deg)`;
    });

    // 종료 애니메이션 (조금 더 오래 머물다가 작아지며 사라짐)
    setTimeout(() => {
      imgEl.style.opacity = '0';
      // 사라질 때 scale 1.15 -> 0.6 줌아웃
      imgEl.style.transform = `translate(-50%, -50%) scale(0.6) rotate(${rot}deg)`;
    }, 800); // 600ms -> 800ms (유지 시간 증가)

    setTimeout(() => {
      if (imgEl.parentNode) imgEl.parentNode.removeChild(imgEl);
    }, 1800); // 1100ms -> 1800ms (transition 끝날 때까지 대기)
  };

  return (
    <>
    <section
      ref={sectionRef}
      className={`section-third relative w-full bg-white ${isDesktop ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnterSection}
      onMouseLeave={handleLeaveSection}
    >
      <div className="section-shell">
        <div className="relative grid grid-cols-12 gap-[10px] py-[200px]">
          {/* Small heading text - Top Left (Column 1) */}
          <div className="col-span-1 col-start-1 row-start-1">
            <p className="text-[8px] font-normal leading-[100%] tracking-[0] text-[#231f20]">
              A never-before-seen design
              <br />
              anchored in our collective
              <br />
              memory.
            </p>
          </div>

          {/* Image - Left Side (Columns 1-4, Row 2) - Glass Blur Reveal */}
          <div className="relative col-span-4 col-start-1 row-start-2 z-0">
            <div
              className="blur-reveal cursor-target relative h-[652px] w-full overflow-hidden"
              data-cursor-image="/assets/offline/offline5.jpg"
              onMouseEnter={() => handleTargetEnter('/assets/offline/offline5.jpg')}
              onMouseLeave={handleTargetLeave}
            >
              <Image
                src="/assets/section2_image.gif"
                alt="Brand visual"
                fill
                className="object-cover grayscale"
              />
            </div>
          </div>

          {/* Large Text - Top (Center aligned) - slightly lower so it overlaps the image */}
          <div className="scroll-text absolute left-1/2 top-[80px] z-50 -translate-x-1/2 pointer-events-auto" data-speed="1.0">
            <HalftoneTitle lines={['BYREDO CREATES']} align="center" />
          </div>

          {/* Large Text - Bottom (Right aligned) */}
          <div className="scroll-text absolute right-0 top-[260px] z-50 pointer-events-auto" data-speed="1.0">
            <HalftoneTitle lines={['WITH A TASTE', 'OF PERFUME.']} align="right" />
          </div>

          {/* Right Text Content - Aligned with left image bottom */}
          <div
            className="cursor-target col-span-6 col-start-5 row-start-2 flex flex-col gap-[20px] self-end pb-[20px]"
            data-cursor-image="/assets/offline/offline8.jpg"
            onMouseEnter={() => handleTargetEnter('/assets/offline/offline8.jpg')}
            onMouseLeave={handleTargetLeave}
          >
            <h2 className="text-[16px] font-normal leading-[100%] tracking-[0] text-[#231f20]">
              Our creations are singular, never seen elsewhere
            </h2>
            
            <p className="text-[14px] font-normal leading-[100%] tracking-[0] text-[#231f20]">
              and do not follow fashion. Nevertheless, they are anchored in
              a history. Our references are linked to what inspires and drives
              us: an artistic movement, an architectural style, a way of life...
              Our French culture also influences us unconsciously. Let&apos;s
              cultivate that.
            </p>

            {/* Link */}
            <div className="relative mt-[10px] h-[9px] w-[75.47px] overflow-hidden">
              <a
                href="#"
                className="absolute left-0 top-[-1px] flex h-[10px] items-center justify-start text-[8.3px] font-semibold uppercase leading-[100%] tracking-[0] text-[#231f20]"
              >
                MORE ABOUT
              </a>
              
              {/* SVG Arrow */}
              <div className="absolute left-[65px] top-[-2px] h-[20px] w-[20px]">
                <svg
                  className="absolute left-[24.3%] top-[24.3%] h-[51.4%] w-[51.38%]"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 9L9 1M9 1H1M9 1V9"
                    stroke="#231f20"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Horizontal divider */}
              <div className="absolute bottom-0 left-0 h-[1px] w-[60px] bg-[#231f20]" />
            </div>
          </div>
        </div>
      </div>

    </section>

    {isDesktop && (
      <div
        ref={previewContainerRef}
        className="pointer-events-none fixed left-0 top-0 z-[300]"
      />
    )}
    </>
  );
}

type HalftoneTitleProps = {
  lines: string[];
  align?: 'center' | 'right';
};

function HalftoneTitle({ lines, align = 'center' }: HalftoneTitleProps) {
  const anchor = align === 'center' ? 'middle' : 'end';
  const xPos = align === 'center' ? 600 : 1200;

  return (
    <div className="inline-flex">
      <svg
        viewBox="0 0 1200 230"
        className="w-[1000px] max-w-[95vw]"
        role="img"
        aria-label={lines.join(' ')}
      >
        {lines.map((line, index) => (
          <text
            key={line}
            x={xPos}
            y={index * 100 + 105}
            textAnchor={anchor}
            fontFamily="sk-modernist, sans-serif"
            fontSize="104"
            fontWeight="700"
            letterSpacing="-6"
            fill="#000"
          >
            {line}
          </text>
        ))}
      </svg>
    </div>
  );
}
