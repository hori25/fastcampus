'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Store = {
  name: string;
  category: string;
  date: string;
  image: string;
};

const stores: Store[] = [
  { name: 'DICE AT HELEN OF TROY', category: 'PROJETS', date: 'JAN 6TH, 2023', image: '/assets/offline/offline9.jpg' },
  { name: 'CURB AT STUDIO EVOL', category: 'SHOOTING SESSIONS', date: 'JAN 6TH, 2023', image: '/assets/offline/offline8.jpg' },
  { name: 'LB FEAT. CINQPOINTS', category: 'COLLAR', date: 'NOV 25TH, 2022', image: '/assets/offline/offline7.jpg' },
  { name: 'DICE HIFI', category: 'TIPS & TRICKS', date: 'JUL 7TH, 2022', image: '/assets/offline/offline6.jpg' },
  { name: 'DEMATHIEU BARD', category: 'PROJETS', date: 'JUL 5TH, 2022', image: '/assets/offline/offline5.jpg' },
  { name: 'CLOUD', category: 'COLLECTION', date: 'JUN 29TH, 2022', image: '/assets/offline/offline4.png' },
  { name: 'THE IDEAL COMPANION FOR YOUR CHANNEL', category: 'TIPS & TRICKS', date: 'JUN 5TH, 2022', image: '/assets/offline/offline9.jpg' },
  { name: 'DOC, VINYL RECORDS STORAGE', category: 'TIPS & TRICKS', date: 'FEB 5TH, 2022', image: '/assets/offline/offline8.jpg' },
  { name: 'DONUT AT THE COMMERCE', category: 'SHOOTING SESSIONS', date: 'NOV 2ND, 2020', image: '/assets/offline/offline7.jpg' }
];

// 텍스트 마스킹 + 스트레치 릴리즈 효과
const maskStretchVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    clipPath: 'inset(0 0 100% 0)',
    scaleX: 1.15,
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0% 0)',
    scaleX: 1,
    transition: {
      duration: 0.9,
      ease: [0.22, 0.61, 0.36, 1] as any,
      clipPath: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as any },
      scaleX: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as any },
    },
  },
};

export default function OfflineStorePage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState({
    title: false,
    featured: false,
    list: false,
  });

  const titleRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLElement>(null);

  // Intersection Observer (레이지 로딩)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === titleRef.current) {
              setIsVisible((prev) => ({ ...prev, title: true }));
            } else if (entry.target === featuredRef.current) {
              setIsVisible((prev) => ({ ...prev, featured: true }));
            } else if (entry.target === listRef.current) {
              setIsVisible((prev) => ({ ...prev, list: true }));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    if (featuredRef.current) observer.observe(featuredRef.current);
    if (listRef.current) observer.observe(listRef.current);

    return () => observer.disconnect();
  }, []);

  const galleryImages = [
    '/assets/offline/offline5.jpg',
    '/assets/offline/offline6.jpg',
    '/assets/offline/offline7.jpg',
    '/assets/offline/offline8.jpg',
    '/assets/offline/offline9.jpg',
  ];

  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-white">
        {/* Title Section */}
        <section ref={titleRef} className="px-[10px] py-20">
          <motion.h1
            className="font-['sk-modernist'] text-[128px] font-bold uppercase leading-none tracking-[-3px] text-[#1b1b1b] text-right"
            variants={maskStretchVariants}
            initial="hidden"
            animate={isVisible.title ? 'visible' : 'hidden'}
          >
            OFFLINE STORE
          </motion.h1>
        </section>

        {/* Featured Store Section */}
        <section ref={featuredRef} className="px-[10px] py-20">
          <div className="space-y-12">
            {/* Title */}
            <motion.div
              variants={maskStretchVariants}
              initial="hidden"
              animate={isVisible.featured ? 'visible' : 'hidden'}
            >
              <h2 className="font-['sk-modernist'] text-[64px] font-bold uppercase leading-[1.05] tracking-[-2px] text-[#1b1b1b]">
                THE DIGGERS FACTORY<br />
                SELECTION FOR LYON BÉTON
              </h2>
            </motion.div>

            {/* Description */}
            <motion.div
              className="max-w-[600px] ml-auto"
              variants={maskStretchVariants}
              initial="hidden"
              animate={isVisible.featured ? 'visible' : 'hidden'}
              transition={{ delay: 0.1 }}
            >
              <p className="text-[15px] font-bold uppercase leading-[1.5] tracking-[0.02em] text-black">
                DISCOVER THE VINYL SELECTION FROM DIGGERS FACTORY FOR LYON BÉTON!
              </p>
              <p className="mt-6 text-[14px] leading-[1.7] text-black/70">
                At Lyon Béton, we love music. It accompanies us every day and influences our work. The modular furniture system Dice is a perfect example. One of the main challenges was to find a solution capable of housing a vinyl record collection. That's why we are thrilled to [...]
              </p>
            </motion.div>

            {/* Map & Image Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Google Map */}
              <div
                className="relative aspect-square overflow-hidden transition-all duration-1000 ease-out"
                style={{
                  opacity: isVisible.featured ? 1 : 0,
                  transform: `translateY(${isVisible.featured ? 0 : 50}px)`,
                  transitionDelay: '300ms',
                }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.2091339927547!2d2.3310113!3d48.8738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e3d4f8f9d3b%3A0x8d8e1f5a5f5c5c5c!2sGaleries%20Lafayette%20Paris%20Haussmann!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale"
                />
              </div>

              {/* Store Image */}
              <div
                className="relative aspect-square overflow-hidden bg-gray-100 transition-all duration-1000 ease-out"
                style={{
                  opacity: isVisible.featured ? 1 : 0,
                  transform: `translateY(${isVisible.featured ? 0 : 50}px)`,
                  transitionDelay: '400ms',
                }}
              >
                <Image
                  src={galleryImages[selectedImageIndex]}
                  alt="Store"
                  fill
                  className="object-cover transition-opacity duration-300"
                  key={selectedImageIndex}
                />
              </div>
            </div>

            {/* Gallery */}
            <div className="mt-6 grid grid-cols-5 gap-4">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square overflow-hidden bg-gray-100 cursor-pointer ${
                    selectedImageIndex === index ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{
                    opacity: isVisible.featured ? (selectedImageIndex === index ? 1 : 0.6) : 0,
                    transform: `translateY(${isVisible.featured ? 0 : 30}px) ${selectedImageIndex === index ? 'scale(1.05)' : 'scale(1)'}`,
                    transitionDelay: `${500 + index * 80}ms`,
                    transitionProperty: 'opacity, transform',
                    transitionDuration: '800ms',
                    transitionTimingFunction: 'ease-out',
                  }}
                >
                  <Image
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Store List with Hover Image Preview */}
        <section ref={listRef} className="relative w-full px-[10px] mt-16">
          <div className="relative">
            {/* Hover Image Preview - Centered to list */}
            <AnimatePresence mode="wait">
              {hoveredIndex !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                >
                  <motion.div
                    key={hoveredIndex}
                    layout
                    initial={{ scale: 0.92 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.92 }}
                    transition={{
                      layout: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] },
                      duration: 0.4,
                      ease: [0.22, 0.61, 0.36, 1],
                    }}
                    className="relative max-w-[520px] overflow-hidden"
                  >
                    <Image
                      src={stores[hoveredIndex].image}
                      alt={stores[hoveredIndex].name}
                      width={520}
                      height={0}
                      style={{ width: '100%', height: 'auto' }}
                      className="object-contain"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Store List */}
            <div className="divide-y divide-black/10">
            {stores.map((store, index) => (
              <button
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group flex w-full items-center justify-between px-4 py-4 text-left transition-all duration-500 hover:bg-[#000]"
                style={{
                  opacity: isVisible.list ? 1 : 0,
                  transform: `translateY(${isVisible.list ? 0 : 30}px)`,
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <span className="text-[13px] uppercase tracking-[0.05em] text-black transition-colors group-hover:text-[#fff]">
                  {store.name}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] uppercase tracking-[0.4em] text-black/50 transition-colors group-hover:text-[#fff]">
                    {store.category}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-black transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#fff]"
                  >
                    <path
                      d="M7 4L13 10L7 16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
