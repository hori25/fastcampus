'use client';

import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const galleryImages = [
  '/assets/carousel_1.png',
  '/assets/carousel_2.png',
  '/assets/carousel_3.png',
  '/assets/carousel_4.png',
  '/assets/carousel_5.png',
  '/assets/carousel_1.png',
  '/assets/carousel_2.png',
  '/assets/carousel_3.png'
];

export default function Gallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !scrollRef.current) return;

    const carousel = scrollRef.current;
    
    const ctx = gsap.context(() => {
      // 캐러셀 스크롤 애니메이션 (스크롤 내리면 좌측으로 이동)
      gsap.to(carousel, {
        scrollLeft: carousel.scrollWidth - carousel.clientWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });

      // Soft Wipe Transition - 섹션 등장 애니메이션
      const headerContent = sectionRef.current!.querySelector('.gallery-header');
      if (headerContent) {
        gsap.fromTo(
          headerContent,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: headerContent,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // 캐러셀 이미지 순차 등장
      const carouselImages = sectionRef.current!.querySelectorAll('.carousel-image');
      carouselImages.forEach((img, index) => {
        gsap.fromTo(
          img,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: carousel,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-white overflow-hidden">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[100px] py-[200px]">
        {/* Header Section */}
        <div className="gallery-header flex w-full flex-[0_0_auto] flex-col gap-[20px] self-stretch px-[10px]">
          {/* Divider Line */}
          <div className="relative h-[1px] w-full bg-gray-300" />

          {/* Title and Link Row */}
          <div className="flex w-full flex-[0_0_auto] items-end justify-between self-stretch">
            {/* OUR COLLECTIONS */}
            <div className="flex h-[10px] w-[78.67px] items-center justify-center">
              <h2 className="text-center font-['sk-modernist'] text-[8.3px] font-medium leading-[8.2px] tracking-[0] text-[#231f20]">
                OUR COLLECTIONS
              </h2>
            </div>

            {/* VIEW ALL Link */}
            <div className="relative h-[9px] w-[58.73px] overflow-hidden">
              <a
                href="#"
                className="absolute left-0 top-[-1px] flex h-[10px] w-[39px] items-center justify-center font-['sk-modernist'] text-[8.3px] font-medium leading-[8.2px] tracking-[0] text-[#231f20]"
              >
                VIEW ALL
              </a>

              {/* SVG Arrow */}
              <div className="absolute left-[39px] top-[-2px] h-[20px] w-[20px]">
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
              <div className="absolute bottom-0 left-0 h-[1px] w-[39px] bg-[#231f20]" />
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Container - Full Width, No Side Margins */}
      <div
        ref={scrollRef}
        className="flex w-full gap-[10px] overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {galleryImages.map((src, index) => (
          <div
            key={index}
            className="carousel-image relative h-[280px] min-w-[373px] flex-shrink-0"
          >
            <Image
              src={src}
              alt={`Gallery image ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
