'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import Image from 'next/image';

// 갤러리 이미지 데이터 (중복 포함하여 더 많이)
const galleryImages = [
  { src: '/assets/image1.png', title: 'Sundazed', subtitle: 'Eau de Parfum' },
  { src: '/assets/image2.png', title: 'Mojave Ghost', subtitle: 'Eau de Parfum' },
  { src: '/assets/new1.png', title: 'Rose Noir', subtitle: 'Limited Edition' },
  { src: '/assets/image3.png', title: 'Gypsy Water', subtitle: 'Eau de Parfum' },
  { src: '/assets/new2.png', title: 'Bal d\'Afrique', subtitle: 'Eau de Parfum' },
  { src: '/assets/image4.png', title: 'Blanche', subtitle: 'Eau de Parfum' },
  { src: '/assets/new3.png', title: 'Bibliothèque', subtitle: 'Candle' },
  { src: '/assets/carousel_1.png', title: 'Super Cedar', subtitle: 'Eau de Parfum' },
  { src: '/assets/new4.png', title: 'Velvet Haze', subtitle: 'Eau de Parfum' },
  { src: '/assets/carousel_2.png', title: 'Slow Dance', subtitle: 'Eau de Parfum' },
  { src: '/assets/carousel_3.png', title: 'Mixed Emotions', subtitle: 'Eau de Parfum' },
  { src: '/assets/carousel_4.png', title: 'Eyes Closed', subtitle: 'Eau de Parfum' },
  { src: '/assets/image1.png', title: 'Sundazed', subtitle: 'Body Lotion' },
  { src: '/assets/image2.png', title: 'Mojave Ghost', subtitle: 'Hair Perfume' },
  { src: '/assets/new1.png', title: 'Rose Noir', subtitle: 'Candle' },
  { src: '/assets/image3.png', title: 'Gypsy Water', subtitle: 'Body Wash' },
  { src: '/assets/carousel_5.png', title: 'Lil Fleur', subtitle: 'Eau de Parfum' },
  { src: '/assets/image4.png', title: 'Blanche', subtitle: 'Hand Cream' },
  { src: '/assets/new3.png', title: 'Bibliothèque', subtitle: 'Room Spray' },
  { src: '/assets/carousel_1.png', title: 'Super Cedar', subtitle: 'Body Cream' },
  { src: '/assets/new4.png', title: 'Velvet Haze', subtitle: 'Travel Size' },
  { src: '/assets/carousel_2.png', title: 'Slow Dance', subtitle: 'Candle' },
  { src: '/assets/new2.png', title: 'Bal d\'Afrique', subtitle: 'Body Lotion' },
  { src: '/assets/carousel_3.png', title: 'Mixed Emotions', subtitle: 'Hand Wash' },
];

export default function NewsletterPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const currentPos = useRef({ x: 0.5, y: 0.5 });
  const [hoveredItem, setHoveredItem] = useState<{ title: string; subtitle: string } | null>(null);

  useEffect(() => {
    if (!pageRef.current || !trackRef.current) return;

    // 페이지 진입 애니메이션 - 이미지들이 가운데서 동시에 균일하게 펼쳐짐
    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const galleryItems = track.querySelectorAll('.gallery-item');
      
      // 트랙 중앙 좌표
      const trackCenterX = track.offsetWidth / 2;
      const trackCenterY = track.offsetHeight / 2;

      // 각 이미지별 회전 각도 (쌓인 느낌)
      const rotations = [-6, 3, -4, 5, -3, 4, -5, 2, -4, 3, -2, 6, -5, 3, -4, 5, -3, 4, -5, 2, -4, 3, -2, 6];

      // 초기 상태: 모든 이미지가 가운데 모여있고 회전됨
      galleryItems.forEach((item, index) => {
        const el = item as HTMLElement;
        const rect = el.getBoundingClientRect();
        const itemCenterX = el.offsetLeft + rect.width / 2;
        const itemCenterY = el.offsetTop + rect.height / 2;
        
        gsap.set(el, {
          x: trackCenterX - itemCenterX,
          y: trackCenterY - itemCenterY,
          scale: 0.3,
          rotation: rotations[index % rotations.length],
          opacity: 1
        });
      });

      // 이미지들이 동시에 균일하게 펼쳐지는 애니메이션 (stagger 없이)
      gsap.to(galleryItems, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 1.0,
        ease: 'power2.out',
        delay: 0.15
      });

      // 페이드인 요소들
      const fadeElements = pageRef.current!.querySelectorAll('.fade-in');
      gsap.fromTo(
        fadeElements,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          delay: 0.6
        }
      );
    }, pageRef);

    // 마우스 이동 핸들러
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      };
    };

    // LERP 보간 애니메이션 루프
    const track = trackRef.current;
    const trackWidth = track.scrollWidth - window.innerWidth;
    const trackHeight = track.scrollHeight - window.innerHeight;
    
    let animationId: number;
    
    const animate = () => {
      // LERP 보간 (0.08 = 부드러움 정도)
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.06;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.06;

      // translate 값 계산
      const translateX = -currentPos.current.x * trackWidth;
      const translateY = -currentPos.current.y * trackHeight;

      track.style.transform = `translate(${translateX}px, ${translateY}px)`;

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div 
      ref={pageRef}
      className="relative h-screen w-screen overflow-hidden bg-[#f8f7f5]"
    >
      {/* 헤더 */}
      <header className="fade-in fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-6">
        <Link 
          href="/" 
          className="font-['sk-modernist'] text-[12px] font-light tracking-[0.15em] text-[#231f20]/60 transition-all hover:text-[#231f20]"
        >
          ← Back
        </Link>
        <span className="font-['sk-modernist'] text-[11px] font-light uppercase tracking-[0.3em] text-[#231f20]/40">
          Collection
        </span>
        <span className="font-['sk-modernist'] text-[12px] font-light tracking-[0.15em] text-[#231f20]/60">
          12 Items
        </span>
      </header>

      {/* 중앙 텍스트 - 이미지 호버 시 변경 */}
      <div 
        ref={centerTextRef}
        className="fade-in pointer-events-none fixed left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 text-center"
      >
        {hoveredItem ? (
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-['sk-modernist'] text-[86px] font-semibold uppercase leading-none tracking-[-2px] text-[#231f20]">
              {hoveredItem.title}
            </h1>
            <p className="font-['sk-modernist'] text-[14px] font-light uppercase tracking-[0.3em] text-[#231f20]/50">
              {hoveredItem.subtitle}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-['sk-modernist'] text-[86px] font-semibold uppercase leading-none tracking-[-2px] text-[#231f20]/10">
              Explore
            </h1>
            <p className="font-['sk-modernist'] text-[14px] font-light uppercase tracking-[0.3em] text-[#231f20]/20">
              Hover to discover
            </p>
          </div>
        )}
      </div>

      {/* 갤러리 트랙 - 마우스로 이동 */}
      <div
        ref={trackRef}
        className="gallery-track absolute will-change-transform"
        style={{
          width: '2800px',
          height: '2200px',
          padding: '80px'
        }}
      >
        {/* 갤러리 아이템들 - 불규칙 배치 (더 많이, 촘촘하게) */}
        {galleryImages.map((item, index) => {
          // 불규칙한 위치 계산 - 24개 위치
          const positions = [
            { top: '1%', left: '2%', width: 220, height: 280 },
            { top: '3%', left: '18%', width: 200, height: 260 },
            { top: '1%', left: '33%', width: 230, height: 300 },
            { top: '5%', left: '50%', width: 210, height: 270 },
            { top: '2%', left: '66%', width: 240, height: 310 },
            { top: '4%', left: '83%', width: 200, height: 260 },
            { top: '26%', left: '4%', width: 230, height: 300 },
            { top: '24%', left: '20%', width: 210, height: 275 },
            { top: '28%', left: '37%', width: 220, height: 285 },
            { top: '25%', left: '54%', width: 240, height: 310 },
            { top: '27%', left: '72%', width: 200, height: 260 },
            { top: '23%', left: '88%', width: 220, height: 290 },
            { top: '50%', left: '2%', width: 210, height: 270 },
            { top: '52%', left: '17%', width: 230, height: 300 },
            { top: '48%', left: '34%', width: 200, height: 260 },
            { top: '51%', left: '50%', width: 220, height: 285 },
            { top: '49%', left: '67%', width: 240, height: 310 },
            { top: '53%', left: '84%', width: 210, height: 275 },
            { top: '74%', left: '5%', width: 220, height: 290 },
            { top: '76%', left: '22%', width: 200, height: 260 },
            { top: '73%', left: '38%', width: 230, height: 300 },
            { top: '75%', left: '55%', width: 210, height: 270 },
            { top: '72%', left: '71%', width: 240, height: 310 },
            { top: '77%', left: '87%', width: 220, height: 285 },
          ];
          
          const pos = positions[index % positions.length];

          return (
            <div
              key={index}
              className="gallery-item group absolute cursor-pointer"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                height: pos.height
              }}
              onMouseEnter={() => setHoveredItem({ title: item.title, subtitle: item.subtitle })}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative h-full w-full overflow-hidden bg-[#e8e6e3]">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 안내 텍스트 */}
      <div className="fade-in fixed bottom-8 left-1/2 z-40 -translate-x-1/2">
        <p className="font-['sk-modernist'] text-[10px] font-light uppercase tracking-[0.3em] text-[#231f20]/30">
          Move mouse to explore
        </p>
      </div>

      {/* 코너 장식 */}
      <div className="fade-in fixed bottom-8 right-10 z-40">
        <p className="font-['sk-modernist'] text-[10px] font-light tracking-[0.1em] text-[#231f20]/30">
          © 2025 Byredo
        </p>
      </div>
    </div>
  );
}
