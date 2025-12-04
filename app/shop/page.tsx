'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
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
  { id: '01', title: 'BLANCHE', category: 'HAIR PERFUME', price: '65 €', image: '/assets/shop/shop_1.png' },
  { id: '02', title: 'BLANCHE', category: 'HAND CREAM', price: '39 €', image: '/assets/shop/shop_2.png' },
  { id: '03', title: 'BLANCHE', category: 'RINSE-FREE HAND WASH', price: '30 €', image: '/assets/shop/shop_3.png' },
  { id: '04', title: 'BLANCHE', category: 'BODY CREAM', price: '67 €', image: '/assets/shop/shop_4.png' },
  { id: '05', title: 'COIN LAUNDRY', category: 'CANDLES', price: '75 €', image: '/assets/shop/shop_5.png' },
  { id: '06', title: 'BLANCHE PYJAMA', category: 'APPAREL', price: '280 €', meta: 'XS – XL SIZE', image: '/assets/shop/shop_6.png' },
  { id: '07', title: 'LE NÉCESSAIRE DE VOYAGE BLANCHE', category: 'EAU DE PARFUM', price: '280 €', meta: 'LIMITED EDITION', image: '/assets/shop/shop_8.png' },
  { id: '08', title: 'BLANCHE', category: 'BODY MIST', price: '70 €', image: '/assets/shop/shop_7.png' },
  { id: '09', title: 'BLANCHE', category: 'HAIR PERFUME', price: '65 €', image: '/assets/shop/shop_1.png' },
  { id: '10', title: 'BLANCHE', category: 'HAND CREAM', price: '39 €', image: '/assets/shop/shop_2.png' },
  { id: '11', title: 'BLANCHE', category: 'RINSE-FREE HAND WASH', price: '30 €', image: '/assets/shop/shop_3.png' },
  { id: '12', title: 'BLANCHE', category: 'BODY CREAM', price: '67 €', image: '/assets/shop/shop_4.png' }
];

export default function ShopPage() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current!.querySelectorAll('article');
      
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 40
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            once: true
          }
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-[#111]">
        <section className="section-shell py-16">
          <h1 className="font-['sk-modernist'] text-[64px] uppercase leading-none tracking-[-3px] text-[#1b1b1b]">
            OUR PRODUCTS
          </h1>
          <div ref={gridRef} className="mt-10 grid gap-x-[10px] gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="flex flex-col gap-3">
                <div className="relative aspect-square bg-[#f7f6f3]">
                  <Image src={product.image} alt={product.title} fill className="object-cover" />
                  <button className="absolute right-4 top-4 h-8 w-8 bg-white/80 backdrop-blur">
                    <Image src="/assets/shop/cart.png" width={14} height={14} alt="Add to cart" className="mx-auto mt-[9px]" />
                  </button>
                </div>
                <div className="pt-3 text-[11px] uppercase tracking-[0.4em] text-black/60">
                  <div className="flex items-center justify-between">
                    <span>{product.category}</span>
                    <span>{product.id}</span>
                  </div>
                  {product.meta && (
                    <p className="mt-1 text-[10px] tracking-[0.3em] text-black/45">{product.meta}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[13px] uppercase tracking-[0.35em] text-black">{product.title}</span>
                    <span className="text-[12px] tracking-[0.35em] text-black/60">{product.price}</span>
                  </div>
                  <button className="p-3 transition hover:opacity-70">
                    <Image src="/assets/shop/mark.png" width={16} height={16} alt="Bookmark" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

