'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    title: 'SUNDAZED',
    detail: 'STORAGES',
    price: '€210',
    image: '/assets/image1.png'
  },
  {
    title: 'MOJAVE GHOST',
    detail: 'EAU DE PARFUM',
    price: '€210',
    image: '/assets/image2.png'
  },
  {
    title: 'MOJAVE GHOST',
    detail: 'EXTRAIT DE PARFUM',
    price: '€210',
    image: '/assets/image3.png'
  },
  {
    title: 'MOJAVE GHOST',
    detail: 'EAU DE PARFUM',
    price: '€210',
    image: '/assets/image4.png'
  }
];

export default function ProductGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 이미지 프레임만 위아래로 이동 (이미지는 잘리지 않음)
      const scrollImages = sectionRef.current!.querySelectorAll('.scroll-image');
      scrollImages.forEach((image) => {
        const speed = parseFloat(image.getAttribute('data-speed') || '1');
        const yMove = -100 * speed;

        gsap.fromTo(
          image,
          { y: 0 },
          {
            y: yMove,
            ease: 'none',
            scrollTrigger: {
              trigger: image,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        );
      });

      // SHOP / NOW 글자 하나씩 도미노 등장 (templier.com 스타일)
      const chars = sectionRef.current!.querySelectorAll('.char-animate');
      gsap.fromTo(
        chars,
        { opacity: 0, y: 40, rotateX: -90 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.2,
          ease: 'power3.out',
          stagger: 0.08, // 글자 하나씩 순차적으로
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%', // 섹션이 뷰포트 80% 지점에 도달하면 시작
            toggleActions: 'play none none none'
          }
        }
      );

      // 중앙 링크 등장
      const linkAnimate = sectionRef.current!.querySelector('.link-animate');
      if (linkAnimate) {
        gsap.fromTo(
          linkAnimate,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            delay: 0.6, // 글자 애니메이션 후
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // 제품 카드 순차 등장
      const productCards = sectionRef.current!.querySelectorAll('.product-card');
      productCards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current!.querySelector('.product-grid'),
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="next-section relative bg-white pt-16 pb-40" style={{ zIndex: 10 }}>
      <div className="section-shell flex flex-col gap-12">
        <div className="title-section grid grid-cols-12 items-center gap-[10px]">
          <div className="col-span-5 flex items-baseline justify-start">
            <h2 className="text-[86px] font-medium uppercase leading-none tracking-tight text-black">
              {'SHOP'.split('').map((char, i) => (
                <span key={i} className="char-animate inline-block opacity-0">
                  {char}
                </span>
              ))}
            </h2>
          </div>

          <div className="col-span-2 flex justify-center">
            <a
              href="#"
              className="link-animate group flex items-center gap-2 border-b border-black pb-1 text-[10px] uppercase tracking-[0.2em] transition-all hover:gap-3 opacity-0"
            >
              visit shop
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>

          <div className="col-span-5 flex items-baseline justify-end">
            <h3 className="text-[86px] font-medium uppercase leading-none tracking-tight text-black">
              {'NOW'.split('').map((char, i) => (
                <span key={i} className="char-animate inline-block opacity-0">
                  {char}
                </span>
              ))}
            </h3>
          </div>
        </div>

        <div className="product-grid grid grid-cols-12 gap-[10px]">
          {products.map((product, index) => (
            <article
              key={product.title + index}
              className="product-card group relative col-span-12 cursor-pointer bg-white sm:col-span-6 xl:col-span-3"
            >
              <div
                className="scroll-image relative w-full overflow-hidden bg-gray-100"
                style={{ aspectRatio: '3/4' }}
                data-speed={0.7 + index * 0.1}
              >
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 flex items-end opacity-0 transition-all duration-400 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4">
                  <div className="w-full px-4 pb-4 text-black">
                    <p className="text-[13px] uppercase tracking-[0.35em]">{product.title}</p>
                    <p className="text-[12px] tracking-[0.3em] text-black/70">{product.price}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

