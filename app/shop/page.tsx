'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Product = {
  id: string;
  title: string;
  category: string;
  price: string;
  meta?: string;
  image: string;
};

const products: Product[] = [
  { id: '01', title: 'BAL D’AFRIQUE EAU DE PARFUM', category: 'HAIR PERFUME', price: '65 €', image: '/assets/shop/shop_1.png' },
  { id: '02', title: 'BAL D’AFRIQUE HAND CREAM', category: 'HAND CREAM', price: '39 €', image: '/assets/shop/shop_2.png' },
  { id: '03', title: 'BAL D’AFRIQUE RINSE-FREE WASH', category: 'RINSE-FREE HAND WASH', price: '30 €', image: '/assets/shop/shop_3.png' },
  { id: '04', title: 'BAL D’AFRIQUE BODY CREAM', category: 'BODY CREAM', price: '67 €', image: '/assets/shop/shop_4.png' },
  { id: '05', title: 'ROUGE CHAOTIQUE CANDLE', category: 'CANDLES', price: '75 €', image: '/assets/shop/shop_5.png' },
  { id: '06', title: 'ROUGE CHAOTIQUE PYJAMA SET', category: 'APPAREL', price: '280 €', meta: 'XS – XL SIZE', image: '/assets/shop/shop_6.png' },
  { id: '07', title: 'ROUGE CHAOTIQUE TRAVEL SET', category: 'EAU DE PARFUM', price: '280 €', meta: 'LIMITED EDITION', image: '/assets/shop/shop_8.png' },
  { id: '08', title: 'ROUGE CHAOTIQUE BODY MIST', category: 'BODY MIST', price: '70 €', image: '/assets/shop/shop_7.png' },
  { id: '09', title: 'BAL D’AFRIQUE HAIR PERFUME', category: 'HAIR PERFUME', price: '65 €', image: '/assets/shop/shop_1.png' },
  { id: '10', title: 'BAL D’AFRIQUE HAND CREAM', category: 'HAND CREAM', price: '39 €', image: '/assets/shop/shop_2.png' },
  { id: '11', title: 'BAL D’AFRIQUE HAND WASH', category: 'RINSE-FREE HAND WASH', price: '30 €', image: '/assets/shop/shop_3.png' },
  { id: '12', title: 'BAL D’AFRIQUE BODY CREAM', category: 'BODY CREAM', price: '67 €', image: '/assets/shop/shop_4.png' }
];

export default function ShopPage() {
  // 초기부터 2줄 노출로 체감 속도 개선
  const [visibleRows, setVisibleRows] = useState(2);
  const [isVisible, setIsVisible] = useState({ title: false });
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const animatedCountRef = useRef(0); // 이미 애니메이션 된 카드 수
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 심플한 페이드업(글자 사라짐 방지용)
  const maskStretchVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  // 4개씩 행으로 그룹화
  const productRows = useMemo(() => {
    const rows: Product[][] = [];
    for (let i = 0; i < products.length; i += 4) {
      rows.push(products.slice(i, i + 4));
    }
    return rows;
  }, []);

  // 새로 나타나는 카드에만 부드러운 등장 애니메이션 적용 (초기 위치 세팅)
  useEffect(() => {
    if (!gridRef.current) return;
    const ctx = gsap.context(() => {
      const allCards = gridRef.current!.querySelectorAll<HTMLElement>('.product-card');
      allCards.forEach((card) => {
        if (!card.dataset.animated) {
          gsap.set(card, { opacity: 0, y: 10 });
        }
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  // 새로 나타나는 카드에만 부드러운 등장 애니메이션 적용
  useEffect(() => {
    if (!gridRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current!.querySelectorAll<HTMLElement>('.product-card:not([data-animated])');
      cards.forEach((card, idx) => {
        const globalIdx = animatedCountRef.current + idx; // 전체 순서를 기준으로 딜레이
        gsap.fromTo(
          card,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            delay: globalIdx * 0.03, // 딜레이 축소로 더 빠른 노출
            onComplete: () => {
              card.setAttribute('data-animated', 'true');
              card.classList.remove('opacity-0', 'translate-y-3');
            },
            scrollTrigger: {
              trigger: card,
              start: 'top 95%',
              once: true
            }
          }
        );
      });
      animatedCountRef.current += cards.length;
    }, gridRef);

    return () => ctx.revert();
  }, [visibleRows]); // 새로 추가된 카드만 선택해 애니메이션

  // 타이틀 인터섹션 (오프라인 스토어와 동일한 마스킹/스트레치 느낌)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, title: true }));
          }
        });
      },
      { threshold: 0.1 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  // 스크롤에 따라 자연스럽게 다음 행을 로드 (Intersection Observer)
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleRows((prev) => Math.min(productRows.length, prev + 1));
            if (visibleRows + 1 >= productRows.length) {
              observer.disconnect(); // 마지막 행까지 로드하면 관찰 종료
            }
          }
        });
      },
      { rootMargin: '1600px 0px' } // 훨씬 일찍 미리 로드 (3번째 리스트 체감 개선)
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [productRows.length, visibleRows]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-[#111]">
        <section className="section-shell py-16 pb-24">
          <motion.h1
            ref={titleRef}
            className="font-['sk-modernist'] text-[96px] font-bold uppercase leading-none tracking-[-3px] text-[#1b1b1b]"
            variants={maskStretchVariants}
            initial="hidden"
            animate={isVisible.title ? 'visible' : 'hidden'}
          >
            OUR PRODUCTS
          </motion.h1>
          <div ref={gridRef} className="mt-10 flex flex-col gap-8">
            {productRows.map((row, rowIdx) =>
              rowIdx < visibleRows ? (
                <div
                  key={`row-${rowIdx}`}
                  className="grid grid-cols-12 gap-x-[10px] gap-y-8 sm:grid-cols-12"
                >
                  {row.map((product) => (
                    <Link key={product.id} href="/shop/2" className="col-span-12 sm:col-span-6 xl:col-span-3">
                      <article className="product-card group flex cursor-pointer flex-col gap-4 transition hover:opacity-85 will-change-transform opacity-0 translate-y-3">
                        <div className="relative aspect-square overflow-hidden bg-[#f7f6f3]">
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            priority={rowIdx === 0 && product.id === '01'} // 첫 번째 항목만 강제 eager
                            loading={rowIdx === 0 ? 'eager' : 'lazy'}
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px] uppercase tracking-[0.2em] text-black">{product.title}</span>
                          <span className="text-[12px] tracking-[0.18em] text-black/70">{product.price}</span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              ) : null
            )}
            {/* Sentinel: 다음 행 로드를 위한 관찰 지점 */}
            <div ref={sentinelRef} className="h-24 w-full" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

