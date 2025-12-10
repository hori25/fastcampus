'use client';

import Header from '@/components/Header';
import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import offline4 from '@/assets/offline/offline4.png';
import offline5 from '@/assets/offline/offline5.jpg';
import offline6 from '@/assets/offline/offline6.jpg';
import offline7 from '@/assets/offline/offline7.jpg';
import offline8 from '@/assets/offline/offline8.jpg';
import offline9 from '@/assets/offline/offline9.jpg';

gsap.registerPlugin(ScrollTrigger);

type StoreThumb = {
  image: StaticImageData;
  title: string;
  tags: string[];
};

const thumbnails: StoreThumb[] = [
  {
    image: offline4,
    title: 'Thom Browne',
    tags: ['Strategy', 'Narrative', 'Visual Identity']
  },
  {
    image: offline5,
    title: 'Le Marais Flagship',
    tags: ['Retail', 'Experience', 'Lighting']
  },
  {
    image: offline6,
    title: 'Concrete Collection',
    tags: ['Installation', 'Spatial Design']
  },
  {
    image: offline7,
    title: 'Pop-up Atelier',
    tags: ['Temporary', 'Visual Identity']
  },
  {
    image: offline8,
    title: 'Gallery Lounge',
    tags: ['Art Direction', 'Furniture']
  },
  {
    image: offline9,
    title: 'Coastal Studio',
    tags: ['Shoot', 'Set Design']
  }
];

export default function OfflineStoreThumbnailPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const track = trackRef.current;

    const ctx = gsap.context(() => {
      const maxX = track.scrollWidth - sectionRef.current!.clientWidth;

      // 세로 스크롤 동안 섹션을 고정(pin)하고,
      // 트랙이 좌->우로 끝까지 슬라이드되는 수평 스크롤
      gsap.fromTo(
        track,
        { x: 0 },
        {
          x: -maxX,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${maxX}`,
            scrub: 1.5,
            pin: true,
            anticipatePin: 1
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Header />
      <main className="bg-white">
        <section ref={sectionRef} className="relative flex h-screen w-full flex-col overflow-hidden bg-white">
          {/* 썸네일 가로 트랙 (1:1 이미지 + 텍스트) */}
          <div className="flex-1 px-[20px] pb-[60px] pt-[100px]">
            <div ref={trackRef} className="flex h-full items-start gap-[20px]">
              {thumbnails.map((item, index) => (
                <Link
                  key={index}
                  href="/offline-store/detail"
                  className="flex flex-shrink-0 flex-col"
                >
                  <div className="relative aspect-square w-[60vh] overflow-hidden bg-[#f5f5f5]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                    />
                  </div>
                  <div className="mt-[10px] space-y-[10px]">
                    <p className="text-[18px] font-medium tracking-[0.02em] text-black">
                      {item.title}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#f5f5f5] px-3 py-1 text-[12px] text-black/40"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 하단 고정 정보 바: (Scroll) / 매장 수 */}
          <div className="pointer-events-none absolute bottom-6 left-0 right-0 flex items-center justify-between px-[20px] text-[24px] font-semibold text-black">
            <span>(Scroll)</span>
            <span>{`Stores — ${thumbnails.length.toString().padStart(2, '0')}`}</span>
          </div>
        </section>
      </main>
    </>
  );
}
