'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const ProductModel3D = dynamic(() => import('@/components/ProductModel3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#f5f5f5] text-black/30">
      Loading 3D Model...
    </div>
  )
});

const ProductModel3D_Rouge = dynamic(() => import('@/components/ProductModel3D_Rouge'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#eaeaea] text-black/30">
      Loading Rouge Model...
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
  const params = useParams();
  const id = params?.id as string | undefined;

  const [isFixed, setIsFixed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 스크롤 진행률 (0~1)
  
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const relatedSectionRef = useRef<HTMLElement>(null);

  // 구간별 텍스트 데이터 (0번은 기존 구매 폼 유지)
  const viewContents = [
    null, // 0: 기본 구매 폼
    {
      title: "CHAOTIC PASSION",
      desc: "A symphony of saffron and plum opens the composition, creating an intense and chaotic harmony. The vibrant top notes clash beautifully with the deeper undertones, setting the stage for a fragrance that refuses to be defined by convention.",
    },
    {
      title: "DEEP RED INTENSITY",
      desc: "The heart reveals a richness of praline and patchouli, unveiling a dark, sophisticated allure. This deep red intensity speaks of passion and mystery, wrapping the wearer in a luxurious veil that is both bold and intimately personal.",
    },
    {
      title: "UNVEILED ESSENCE",
      desc: "At its core lies a hidden strength of papyrus and oakmoss, grounding the initial chaos in an earthy warmth. This unveiled essence provides a sturdy foundation, balancing the wilder notes with a sense of timeless elegance.",
    },
    {
      title: "PURE CONCENTRATION",
      desc: "Crafted as an Extrait de Parfum, Rouge Chaotique offers a pure concentration of scent that lingers like a second soul. Its potency ensures that even a single drop leaves a lasting trail, evolving uniquely with your body's chemistry.",
    },
    {
      title: "THE FINAL NOTE",
      desc: "The journey concludes with a lasting impression of elegance and rebellion, captured within a single bottle. It is a fragrance for those who embrace their contradictions, leaving a final note that is as unforgettable as it is unpredictable.",
    },
  ];

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
      const sectionHeight = section.offsetHeight;

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

      // 스크롤 진행률 계산 (0 ~ 1)
      // 시작점: rect.top <= 0 부터
      // 끝점: rect.bottom <= viewportHeight 까지
      const scrollRange = sectionHeight - viewportHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollRange));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 현재 구간 인덱스 계산 (0 ~ 5)
  // 총 6구간이므로 progress를 6등분
  // 0.00 ~ 0.16 : 0
  // 0.16 ~ 0.33 : 1 ...
  const currentViewIndex = Math.min(
    5,
    Math.floor(scrollProgress * 6)
  );

  // 현재 보여줄 텍스트 콘텐츠
  const activeContent = viewContents[currentViewIndex];

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
      <Header isPurchaseMode={currentViewIndex > 0} />
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
              <div 
                className="relative h-full"
                style={{
                  backgroundColor: id === '2' ? '#eeeeee' : '#f5f5f5'
                }}
              >
                {/* ID 2번일 때만 Rouge 전용 컴포넌트, 나머지는 기존 모델 */}
                {id === '2' ? <ProductModel3D_Rouge /> : <ProductModel3D />}
              </div>

              {/* 우측: 제품 정보 */}
              <div className="relative flex h-full flex-col items-center justify-center bg-white px-12 py-20">
                <div className="relative w-full max-w-[400px]">
                  {/* 0번 구간: 기존 구매 폼 (Fade In/Out) */}
                  <div
                    className={`w-full transition-all duration-700 ease-out ${
                      currentViewIndex === 0
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'absolute top-1/2 left-0 -translate-y-1/2 opacity-0 pointer-events-none'
                    }`}
                  >
                    {/* 타이틀 */}
                    <h1 className="font-['sk-modernist'] text-[28px] font-bold uppercase leading-[1.2] tracking-[0.02em] text-[#1b1b1b]">
                      {id === '2' ? 'Rouge Chaotique' : "BAL D'AFRIQUE"}
                    </h1>

                    {/* 설명 */}
                    <p className="mt-4 font-['sk-modernist'] text-[18px] leading-[1.6] text-[#1b1b1b]">
                      {id === '2'
                        ? 'A chaotic and passionate fragrance, deep red and intense. Saffron, Plum, Praline and Patchouli weave together in a dark, sophisticated symphony.'
                        : "The Bal d'Afrique Eau de Parfum in 50ml, a warm and sensual fragrance with notes of African marigold, vetiver and cedar."}
                    </p>

                    {/* 가격 */}
                    <p className="mt-6 font-['sk-modernist'] text-[18px] font-bold tracking-[0.02em] text-[#1b1b1b]">
                      {id === '2' ? '$280' : '$210'}
                    </p>

                    {/* PURCHASE 버튼 */}
                    <button className="mt-8 w-full bg-black py-5 font-['sk-modernist'] text-[13px] uppercase tracking-[0.25em] text-white transition hover:bg-black/90">
                      PURCHASE
                    </button>

                    {/* Ref 번호 */}
                    <p className="mt-8 font-['sk-modernist'] text-[14px] text-[#999]">
                      Ref. BYR50ML
                    </p>
                  </div>

                  {/* 1~5번 구간: 더미 텍스트 (Fade In/Out, 좌측 정렬) */}
                  <div className="absolute inset-0 flex items-center justify-start text-left pointer-events-none">
                    {viewContents.map((content, idx) => (
                      idx > 0 && (
                        <div
                          key={idx}
                          className={`absolute w-full transition-all duration-700 ease-out flex flex-col items-start justify-center ${
                            currentViewIndex === idx 
                              ? 'opacity-100 translate-y-0' 
                              : 'opacity-0 translate-y-8'
                          }`}
                        >
                          <h2 className="font-['sk-modernist'] text-[28px] font-bold uppercase leading-[1.2] tracking-[0.02em] text-[#1b1b1b]">
                            {content?.title}
                          </h2>
                          <p className="mt-4 font-['sk-modernist'] text-[18px] leading-[1.6] text-[#1b1b1b]">
                            {content?.desc}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* 인디케이터 닷 (우측 고정) */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                  {viewContents.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        currentViewIndex === idx ? 'bg-black scale-125' : 'bg-gray-300 scale-100'
                      }`}
                    />
                  ))}
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
