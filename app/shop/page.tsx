'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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
  // 초기부터 3줄 노출로 체감 속도 개선 (2, 3번째 줄 로딩 지연 개선)
  const [visibleRows, setVisibleRows] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isVisible, setIsVisible] = useState({ title: false });
  const sentinelRef = useRef<HTMLDivElement>(null);
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

  const categoryTabs = useMemo(
    () => ['ALL', ...Array.from(new Set(products.map((p) => p.category)))],
    []
  );

  const filteredProducts = useMemo(
    () =>
      selectedCategory === 'ALL'
        ? products
        : products.filter((p) => p.category === selectedCategory),
    [selectedCategory]
  );

  // 4개씩 행으로 그룹화 (필터 결과 기준)
  const productRows = useMemo(() => {
    const rows: Product[][] = [];
    for (let i = 0; i < filteredProducts.length; i += 4) {
      rows.push(filteredProducts.slice(i, i + 4));
    }
    return rows;
  }, [filteredProducts]);

  // 카테고리 변경 시 리스트/애니메이션 상태 리셋
  useEffect(() => {
    setVisibleRows(3);
  }, [selectedCategory]);

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
            // OUR PRODUCTS 텍스트는 화면에서 제거 (시각적으로 숨김)
            className="sr-only"
            variants={maskStretchVariants}
            initial="hidden"
            animate={isVisible.title ? 'visible' : 'hidden'}
          >
            OUR PRODUCTS
          </motion.h1>
          {/* 상단 카테고리 메뉴 + 필터 */}
          <div className="mt-4 flex items-center justify-between border-b border-black/5 pb-4 text-[11px] uppercase tracking-[0.22em]">
            <div className="flex flex-wrap gap-6 sm:gap-8">
              {categoryTabs.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`transition-colors ${
                    selectedCategory === category
                      ? 'text-black'
                      : 'text-black/40 hover:text-black'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex items-center gap-2 text-[11px] tracking-[0.22em] text-black/60 hover:text-black"
            >
              FILTER
              <span className="text-[9px]">▼</span>
            </button>
          </div>
          <div className="mt-10 flex flex-col gap-8">
            {productRows.map((row, rowIdx) =>
              rowIdx < visibleRows ? (
                <div
                  key={`row-${rowIdx}`}
                  className="product-row grid grid-cols-12 gap-x-[10px] gap-y-8 sm:grid-cols-12"
                >
                  {row.map((product, colIdx) => (
                    <Link key={product.id} href="/shop/2" className="col-span-12 sm:col-span-6 xl:col-span-3">
                      {/* CSS 기반 슬라이드 업 애니메이션 - 각 행마다 짧은 딜레이만 적용 */}
                      <article
                        className="product-card product-card-animate group flex cursor-pointer flex-col gap-4 transition hover:opacity-85 will-change-transform"
                        style={{ animationDelay: `${colIdx * 0.15}s` }}
                      >
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

