'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useId } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BrandEssay() {
  const sectionRef = useRef<HTMLElement>(null);

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


  return (
    <section ref={sectionRef} className="relative w-full bg-white">
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
            <div className="blur-reveal relative h-[652px] w-full overflow-hidden">
              <Image
                src="/assets/section2_image.png"
                alt="Brand visual"
                fill
                className="object-cover grayscale"
              />
            </div>
          </div>

          {/* Large Text - Top (Center aligned) */}
          <div className="scroll-text absolute left-1/2 top-[20px] z-50 -translate-x-1/2 pointer-events-auto" data-speed="1.0">
            <HalftoneTitle lines={['WE CREATE', 'UNSEEN DESIGN']} align="center" />
          </div>

          {/* Large Text - Bottom (Right aligned) */}
          <div className="scroll-text absolute right-0 top-[200px] z-50 pointer-events-auto" data-speed="1.0">
            <HalftoneTitle lines={['WITH A TASTE', 'OF DEJA-VU.']} align="right" />
          </div>

          {/* Right Text Content - Aligned with left image bottom */}
          <div className="col-span-6 col-start-5 row-start-2 flex flex-col gap-[20px] self-end pb-[20px]">
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
