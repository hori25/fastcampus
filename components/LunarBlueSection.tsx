'use client';

import { useState } from 'react';

export default function LunarBlueSection() {
  const [bgColor, setBgColor] = useState('#1a1a2e');

  const colors = ['#1a1a2e', '#0f3460', '#16213e', '#1e3a5f', '#2c3e50'];

  const handleClick = () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBgColor(randomColor);
  };

  return (
    <section
      className="relative cursor-pointer py-32 text-white transition-colors duration-700"
      style={{ backgroundColor: bgColor }}
      onClick={handleClick}
    >
      <div className="section-shell">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-8 text-5xl font-light uppercase tracking-[0.3em] md:text-6xl lg:text-7xl">
            Level up in Lunar Blue
          </h2>
          
          <div className="relative mx-auto aspect-[4/3] max-w-3xl overflow-hidden rounded-lg bg-gradient-to-br from-blue-900/20 to-purple-900/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm uppercase tracking-wide text-white/40">
                Silhouette model in blue light
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs uppercase tracking-wide text-white/50">
            (Click anywhere to change manually)
          </p>
        </div>
      </div>
    </section>
  );
}

