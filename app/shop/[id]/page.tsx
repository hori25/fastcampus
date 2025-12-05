'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const ProductModel3D = dynamic(() => import('@/components/ProductModel3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#f5f5f5] text-black/30">
      Loading 3D Model...
    </div>
  )
});

// 관련상품 데이터
const relatedProducts = [
  { id: 1, name: 'Bal d\'Afrique', price: '$210', image: '/assets/shop/shop_1.png' },
  { id: 2, name: 'Mojave Ghost', price: '$210', image: '/assets/shop/shop_2.png' },
  { id: 3, name: 'Gypsy Water', price: '$210', image: '/assets/shop/shop_3.png' },
  { id: 4, name: 'Blanche', price: '$210', image: '/assets/shop/shop_4.png' },
  { id: 5, name: 'Bibliothèque', price: '$210', image: '/assets/shop/shop_5.png' },
  { id: 6, name: 'Unnamed', price: '$210', image: '/assets/shop/shop_6.png' },
  { id: 7, name: 'Inflorescence', price: '$210', image: '/assets/shop/shop_7.png' },
  { id: 8, name: 'Rose of No Man\'s Land', price: '$210', image: '/assets/shop/shop_8.png' },
];

export default function ProductDetailPage() {
  const [isFixed, setIsFixed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const relatedSectionRef = useRef<HTMLElement>(null);

  const itemsPerView = 3; // 한 번에 보이는 상품 수
  const maxIndex = relatedProducts.length - itemsPerView;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !contentRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // 섹션 상단이 화면 상단에 닿으면 fixed 시작
      if (rect.top <= 0) {
        // 섹션 하단이 화면 하단보다 위로 올라가면 fixed 해제
        if (rect.bottom <= viewportHeight) {
          setIsFixed(false);
        } else {
          setIsFixed(true);
        }
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 관련상품 섹션 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (relatedSectionRef.current) {
      observer.observe(relatedSectionRef.current);
    }

    return () => {
      if (relatedSectionRef.current) {
        observer.unobserve(relatedSectionRef.current);
      }
    };
  }, []);

  return (
    <>
      <Header />
      <main className="bg-white">
        {/* 3D Product Section */}
        <section ref={sectionRef} id="product-3d-section" className="relative" style={{ minHeight: '600vh' }}>
          <div
            ref={contentRef}
            className={`left-0 h-screen w-full ${isFixed ? 'fixed top-0' : 'absolute bottom-0'}`}
            style={{ zIndex: 5 }}
          >
            <div className="grid h-full lg:grid-cols-2">
              {/* 좌측: 3D 모델 */}
              <div className="relative h-full bg-[#f5f5f5]">
                <ProductModel3D />
              </div>

              {/* 우측: 제품 정보 */}
              <div className="relative flex h-full flex-col items-center justify-center bg-white px-12 py-20">
                <div className="max-w-[400px]">
                  {/* 타이틀 */}
                  <h1 className="font-['sk-modernist'] text-[28px] font-bold uppercase leading-[1.2] tracking-[0.02em] text-[#1b1b1b]">
                    BAL D'AFRIQUE
                  </h1>

                  {/* 설명 */}
                  <p className="mt-4 font-['sk-modernist'] text-[18px] leading-[1.6] text-[#1b1b1b]">
                    The Bal d'Afrique Eau de Parfum in 50ml, a warm and sensual fragrance with notes of African marigold, vetiver and cedar.
                  </p>

                  {/* 가격 */}
                  <p className="mt-6 font-['sk-modernist'] text-[18px] font-bold tracking-[0.02em] text-[#1b1b1b]">
                    $210
                  </p>

                  {/* PURCHASE 버튼 */}
                  <button className="mt-8 w-full bg-black py-5 font-['sk-modernist'] text-[13px] uppercase tracking-[0.25em] text-white transition hover:bg-black/90">
                    PURCHASE
                  </button>

                  {/* 링크들 */}
                  <div className="mt-10 flex flex-col gap-4">
                    <a href="#" className="font-['sk-modernist'] text-[12px] font-bold uppercase tracking-[0.15em] text-[#1b1b1b] transition hover:opacity-60">
                      BOOK AN APPOINTMENT
                    </a>
                    <a href="#" className="font-['sk-modernist'] text-[12px] font-bold uppercase tracking-[0.15em] text-[#1b1b1b] transition hover:opacity-60">
                      CONTACT AN AMBASSADOR
                    </a>
                  </div>

                  {/* Ref 번호 */}
                  <p className="mt-8 font-['sk-modernist'] text-[14px] text-[#999]">
                    Ref. BYR50ML
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 관련상품 섹션 */}
        <section ref={relatedSectionRef} className="section-shell bg-white py-20">
          <h2 
            className={`font-['sk-modernist'] text-[32px] font-bold uppercase leading-[1.1] tracking-[-0.5px] text-[#1b1b1b] transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            YOUR BRACELET, YOUR BRILLIANCE: COMPARE PAVÉ STYLES
          </h2>

          {/* 캐러셀 */}
          <div className={`relative mt-12 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* 이전 버튼 */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-white p-3 shadow-lg transition hover:bg-gray-50 disabled:opacity-30"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* 상품 그리드 */}
            <div className="overflow-hidden px-12">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
              >
                {relatedProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`flex-shrink-0 px-2 transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ 
                      width: `${100 / itemsPerView}%`,
                      transitionDelay: `${600 + index * 100}ms`
                    }}
                  >
                    <div className="aspect-square overflow-hidden bg-[#f5f5f5]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={500}
                        height={500}
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="font-['sk-modernist'] text-[14px] font-bold uppercase tracking-[0.1em] text-[#1b1b1b]">
                        {product.name}
                      </h3>
                      <p className="mt-2 font-['sk-modernist'] text-[14px] text-[#666]">
                        {product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-white p-3 shadow-lg transition hover:bg-gray-50 disabled:opacity-30"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
