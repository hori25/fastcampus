'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Newsletter() {
  const sectionRef = useRef<HTMLElement>(null);
  const image1Ref = useRef<HTMLDivElement>(null);
  const image2Ref = useRef<HTMLDivElement>(null);
  const image3Ref = useRef<HTMLDivElement>(null);
  const image4Ref = useRef<HTMLDivElement>(null);
  const centerContentRef = useRef<HTMLDivElement>(null);
  const parallaxTweensRef = useRef<gsap.core.Tween[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 이미지에만 패럴랙스 적용
      const scrollImages = sectionRef.current!.querySelectorAll('.scroll-image');
      parallaxTweensRef.current = [];
      scrollImages.forEach((image) => {
        const speed = parseFloat(image.getAttribute('data-speed') || '1');
        const yMove = -200 * speed;

        const tween = gsap.fromTo(
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

        parallaxTweensRef.current.push(tween);
      });

      // Soft Wipe Transition - 중앙 텍스트 등장
      const centerContent = sectionRef.current!.querySelector('.center-content');
      if (centerContent) {
        gsap.fromTo(
          centerContent,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: centerContent,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 버튼 클릭 시 4개 이미지가 동시에 가운데로 모이는 모션
  const handleSubscribeClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // 패럴랙스 트리거 제거하여 클릭 후 튐 현상 방지
    parallaxTweensRef.current.forEach((tween) => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
    parallaxTweensRef.current = [];

    const images = [image1Ref.current, image2Ref.current, image3Ref.current, image4Ref.current];
    const centerContent = centerContentRef.current;
    
    // 화면 중앙 좌표 계산
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // 같은 지점에 겹쳐지도록 회전만 다르게 부여
    const rotations = [-10, -3, 3, 10];
    const targetWidth = 240;
    const targetHeight = 300;

    // 이미지들을 fixed로 변경하고 초기 위치 설정
    images.forEach((img, index) => {
      if (!img) return;
      const rect = img.getBoundingClientRect();
      gsap.set(img, { clearProps: 'transform' });
      gsap.set(img, {
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: 9990 + index,
        transformOrigin: '50% 50%',
        x: 0,
        y: 0
      });
    });

    const tl = gsap.timeline({
      onComplete: () => {
        router.push('/newsletter');
      }
    });

    // 1) 중앙 텍스트 페이드아웃
    tl.to(centerContent, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    });

    // 2) 4개 이미지가 동시에 가운데로 모임 (동일 비율 유지, 위치 동일)
    images.forEach((img, index) => {
      if (!img) return;
      
      const rect = img.getBoundingClientRect();
      const targetX = centerX - targetWidth / 2 - rect.left;
      const targetY = centerY - targetHeight / 2 - rect.top;

      tl.to(img, {
        x: targetX,
        y: targetY,
        width: targetWidth,
        height: targetHeight,
        rotation: rotations[index],
        duration: 0.7,
        ease: 'power2.inOut'
      }, 0.3); // 모두 동시에 시작
    });

    // 3) 잠시 대기 후 페이지 이동
    tl.to({}, { duration: 0.3 });
  };

  return (
    <section ref={sectionRef} className="relative w-full bg-white pt-[300px]">

      <div className="section-shell relative h-[1080px]">
        {/* 이미지 1 - 좌측 상단 */}
        <div 
          ref={image1Ref}
          className="scroll-image absolute left-[238px] top-0 h-[372px] w-[467px] bg-cover bg-center"
          data-speed="0.6"
          style={{ backgroundImage: 'url(/assets/new1.png)' }}
        />

        {/* 이미지 2 - 우측 중단 */}
        <div 
          ref={image2Ref}
          className="scroll-image absolute left-[1072px] top-[262px] h-[138px] w-[109px] bg-cover bg-center"
          data-speed="1.2"
          style={{ backgroundImage: 'url(/assets/new2.png)' }}
        />

        {/* 이미지 3 - 좌측 하단 */}
        <div 
          ref={image3Ref}
          className="scroll-image absolute left-0 top-[581px] h-[288px] w-[228px] bg-cover bg-center"
          data-speed="0.9"
          style={{ backgroundImage: 'url(/assets/new3.png)' }}
        />

        {/* 이미지 4 - 우측 하단 */}
        <div 
          ref={image4Ref}
          className="scroll-image absolute left-[1072px] top-[705px] h-[277px] w-[348px] bg-cover bg-center"
          data-speed="1.4"
          style={{ backgroundImage: 'url(/assets/new4.png)' }}
        />

        {/* 중앙 컨텐츠 - section-shell 내부에서 정중앙 */}
        <div 
          ref={centerContentRef}
          className="center-content absolute left-1/2 top-[400px] z-20 flex -translate-x-1/2 flex-col items-center gap-[40px]"
        >
          {/* 제목 */}
          <h2 className="whitespace-nowrap text-center font-['sk-modernist'] text-[68.8px] font-extrabold leading-[60px] tracking-[-3.75px] text-[#231f20]">
            NEWSLETTER
          </h2>

          {/* 설명 텍스트 */}
          <p className="max-w-[280px] text-center font-['sk-modernist'] text-[11px] font-normal leading-[1.6] tracking-[0] text-[#231f20]">
            Sign up for our newsletter to find out all about us, our news,
            our offers... We&#39;re not too chatty and we&#39;ll protect your email
            like the apple of our eye.
          </p>

          {/* 구독 버튼 - 클릭 시 이미지 모이는 모션 */}
          <button 
            onClick={handleSubscribeClick}
            disabled={isTransitioning}
            className="mt-4 flex h-[56px] w-[228px] items-center justify-center bg-[#231f20] transition-all hover:bg-[#000] disabled:cursor-not-allowed"
          >
            <span className="font-['sk-modernist'] text-[11px] font-medium uppercase tracking-[0.1em] text-[#ebebeb]">
              View More
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
