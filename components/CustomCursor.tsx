'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const hoverRef = useRef(false);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    const updateDotPosition = (x: number, y: number) => {
      const isHover = hoverRef.current;
      const scale = isHover ? 2 : 1; // 24px -> 48px
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      dot.style.backgroundColor = isHover ? '#7b0022' : '#000000';
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // 현재 포인터가 인터랙티브 요소 위에 있는지 검사 (a, button 등)
      const target = document.elementFromPoint(x, y) as HTMLElement | null;
      const interactive = target?.closest(
        'a, button, [role="button"], input[type="button"], input[type="submit"], [data-cursor-hover]'
      );
      const isHover = !!interactive;
      if (hoverRef.current !== isHover) {
        hoverRef.current = isHover;
      }

      updateDotPosition(x, y);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* 기본 커서 (12px 블랙 점) */}
      <div
        ref={dotRef}
        className="custom-cursor-dot pointer-events-none fixed left-0 top-0 z-[9998]"
      />
    </>
  );
}


