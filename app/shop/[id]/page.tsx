'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const ProductModel3D = dynamic(() => import('@/components/ProductModel3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#e8e8e8] text-black/30">
      Loading 3D Model...
    </div>
  )
});

export default function ProductDetailPage() {
  const [selectedSize, setSelectedSize] = useState('50 ML');
  const [isFixed, setIsFixed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <Header />
      <main className="bg-white">
        {/* 3D Product Section */}
        <section ref={sectionRef} id="product-3d-section" className="relative" style={{ minHeight: '400vh' }}>
          <div
            ref={contentRef}
            className={`left-0 h-screen w-full ${isFixed ? 'fixed top-0' : 'absolute bottom-0'}`}
            style={{ zIndex: 5 }}
          >
            <div className="grid h-full lg:grid-cols-2">
              {/* 좌측: 3D 모델 */}
              <div className="relative h-full bg-[#e8e8e8]">
                <ProductModel3D />
              </div>

              {/* 우측: 제품 정보 */}
              <div className="relative flex h-full flex-col justify-center bg-white px-12 py-20">
                <button className="absolute right-12 top-12 p-2 transition hover:opacity-70">
                  <Image src="/assets/shop/mark.png" width={20} height={20} alt="Bookmark" />
                </button>

                <div className="max-w-[500px]">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-black/50">
                    ABSOLU DE PARFUM
                  </p>

                  <h1 className="mt-4 font-['sk-modernist'] text-[32px] uppercase leading-[1.1] tracking-[-0.5px] text-[#1b1b1b]">
                    BAL D'AFRIQUE ABSOLU DE PARFUM
                  </h1>

                  <p className="mt-6 text-[16px] tracking-[0.05em] text-black">
                    210 €
                  </p>

                  <div className="mt-10">
                    <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-black/70">
                      SIZE
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedSize('50 ML')}
                        className={`border px-6 py-3 text-[12px] uppercase tracking-[0.3em] transition ${
                          selectedSize === '50 ML'
                            ? 'border-black bg-white text-black'
                            : 'border-black/20 bg-white text-black/50 hover:border-black/40'
                        }`}
                      >
                        50 ML
                      </button>
                      <button
                        onClick={() => setSelectedSize('100 ML')}
                        className={`border px-6 py-3 text-[12px] uppercase tracking-[0.3em] transition ${
                          selectedSize === '100 ML'
                            ? 'border-black bg-white text-black'
                            : 'border-black/20 bg-white text-black/50 hover:border-black/40'
                        }`}
                      >
                        100 ML
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <button className="w-full bg-black py-4 text-[11px] uppercase tracking-[0.4em] text-white transition hover:bg-black/90">
                      ADD TO CART
                    </button>
                    <button className="w-full border border-black bg-white py-4 text-[11px] uppercase tracking-[0.4em] text-black transition hover:bg-black hover:text-white">
                      BUY NOW
                    </button>
                  </div>

                  <p className="mt-6 text-[11px] leading-[1.6] tracking-[0.02em] text-black/50">
                    Try it First. 2 ml sample automatically added to your basket, according to availability
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
