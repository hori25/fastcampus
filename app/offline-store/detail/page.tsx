'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import logoLeBonMarche from '@/assets/offline/Le Bon Marché.svg';
import detailImage1 from '@/assets/offline/detail_1.jpg';
import detailImage2 from '@/assets/offline/detail_2.png';
import offline5 from '@/assets/offline/offline5.jpg';
import offline6 from '@/assets/offline/offline6.jpg';
import offline7 from '@/assets/offline/offline7.jpg';

// 오프라인 스토어 더미 주소 (복사용)
const STORE_ADDRESS = '123 Rue de Demo, 75000 Paris, France';

gsap.registerPlugin(ScrollTrigger);

export default function OfflineStoreDetailPage() {
  const [copied, setCopied] = useState(false);
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const mapSectionRef = useRef<HTMLElement>(null);
  const gallerySectionRef = useRef<HTMLElement>(null);
  const servicesSectionRef = useRef<HTMLElement>(null);

  // 섹션별 bottom-to-top reveal / wipe 인터렉션
  useEffect(() => {
    const ctx = gsap.context(() => {
      const makeReveal = (target?: HTMLElement | null) => {
        if (!target) return;
        const blocks = target.querySelectorAll<HTMLElement>('.reveal-block');
        if (!blocks.length) return;

        gsap.fromTo(
          blocks,
          {
            opacity: 0,
            y: 40,
            clipPath: 'inset(100% 0% 0% 0%)'
          },
          {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: {
              trigger: target,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
    );
      };

      makeReveal(mapSectionRef.current);
      makeReveal(gallerySectionRef.current);
      makeReveal(servicesSectionRef.current);
    });

    return () => ctx.revert();
  }, []);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(STORE_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* 상단 타이틀 */}
        <section className="px-[10px] pt-16 pb-12">
          <div className="relative w-full">
            <Image
              src={logoLeBonMarche}
              alt="Le Bon Marché"
              width={1600}
              height={320}
              className="h-auto w-full"
              priority
            />
          </div>

          {/* 설명 텍스트 - SVG와 타이트하게 붙고 볼드 처리 */}
          <p className="mt-2 max-w-[520px] font-['sk-modernist'] text-[13px] font-bold leading-relaxed tracking-[0.02em] text-black">
            At Lyon Béton, we love music. It accompanies us every day and influences our work. The modular furniture
            system Dice is a perfect example. One of the main challenges was to find a solution capable of housing a
            vinyl record collection. That&apos;s why we are thrilled to [...]
          </p>
        </section>

        {/* 지도 + 주소 섹션 (236px 간격 후) */}
        <section ref={mapSectionRef} className="mt-[236px] px-[10px] pb-24">
          <div className="grid grid-cols-12 gap-[10px]">
            {/* 좌측: 주소 + 복사 버튼 (40%) - 하단 일렬 정렬 */}
            <div className="reveal-block col-span-12 flex md:col-span-5">
              <div className="flex h-full w-full items-end justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-black/40">Store Address</p>
                  <p className="mt-3 text-[14px] text-black">
                    123 Rue de Demo, 75000 Paris, France
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="ml-6 inline-flex items-center justify-center border border-black px-6 py-2 text-[11px] uppercase tracking-[0.25em] text-black transition-colors hover:bg-black hover:text-white"
                >
                  {copied ? 'COPIED' : 'COPY ADDRESS'}
                </button>
              </div>
            </div>

            {/* 우측: 지도 (60%) */}
            <div className="reveal-block col-span-12 md:col-span-7">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f4f4f4]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.2091339927547!2d2.3310113!3d48.8738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e3d4f8f9d3b%3A0x8d8e1f5a5f5c5c5c!2sGaleries%20Lafayette%20Paris%20Haussmann!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full grayscale"
                />
                </div>
                </div>
              </div>
        </section>

        {/* 하단 오프라인 매장 이미지 2개 (60% / 40%) + 디스크립션 */}
        <section ref={gallerySectionRef} className="px-[10px] pb-24">
          <div className="grid grid-cols-12 gap-[10px]">
            {/* 왼쪽 이미지 - 60% */}
            <div className="reveal-block col-span-12 md:col-span-7">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f5f5f5]">
                <Image
                  src={detailImage1}
                  alt="Offline store interior"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-4 space-y-1 text-left">
                <p className="text-[14px] font-medium text-black">Le Bon Marché — Interior</p>
                <p className="text-[12px] text-black/60">Concrete washbasin and modular display furniture.</p>
              </div>
            </div>

            {/* 오른쪽 이미지 - 40%, 더 낮은 비율 */}
            <div className="reveal-block col-span-12 flex flex-col md:col-span-5">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f5f5f5]">
                  <Image
                  src={detailImage2}
                  alt="Offline store facade"
                    fill
                    className="object-cover"
                  />
                </div>
              <div className="mt-4 space-y-1 text-left">
                <p className="text-[14px] font-medium text-black">Le Bon Marché — Facade</p>
                <p className="text-[12px] text-black/60">Street-level view of the entrance and surrounding pavement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 서비스 리스트 섹션 */}
        <section ref={servicesSectionRef} className="px-[10px] pb-24">
          <div className="relative">
            <div className="border-t border-black/10">
              {[
                {
                  label: 'Flexible office solutions',
                  title: 'SUBSCRIPTION',
                  image: detailImage1
                },
                {
                  label: 'Large-scale recycling',
                  title: 'YLLW FACTORY',
                  image: detailImage2
                },
                {
                  label: 'For an easy moving process',
                  title: 'RELOCATION PROJECT MANAGEMENT',
                  image: offline5
                },
                {
                  label: 'The widest range on the market',
                  title: 'FURNITURE PURCHASES',
                  image: offline6
                },
                {
                  label: 'Tailor-made interior',
                  title: 'INTERIOR DESIGN',
                  image: offline7
                }
              ].map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onMouseEnter={() => setHoveredService(index)}
                  onMouseLeave={() => setHoveredService(null)}
                  className="reveal-block flex w-full items-center justify-between border-b border-black/10 py-3 md:py-4 text-left"
                >
                  <div className="flex flex-col">
                    <span className="text-[12px] text-black/60">{item.label}</span>
                    <span className="mt-1 font-['sk-modernist'] text-[20px] md:text-[22px] font-semibold uppercase tracking-[0.08em] text-black">
                      {item.title}
                    </span>
                  </div>
                  <span className="pr-1 text-[20px] text-black">+</span>
                </button>
              ))}
            </div>

            {/* 호버 이미지 프리뷰 (데스크톱에서만 표시) */}
            {hoveredService !== null && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
                <motion.div
                  key={hoveredService}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                    transition={{
                    duration: 0.9,
                    ease: [0.22, 0.61, 0.36, 1]
                    }}
                  className="inline-block overflow-hidden bg-[#f5f5f5] shadow-md"
                  >
                    <Image
                    src={[detailImage1, detailImage2, offline5, offline6, offline7][hoveredService]}
                    alt="Service preview"
                    width={480}
                    height={320}
                    className="h-auto w-auto max-h-[260px] max-w-[420px] object-contain"
                    />
                </motion.div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
