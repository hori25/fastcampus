'use client';

import { useState } from 'react';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle waitlist submission
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <section className="relative bg-black py-32 text-white">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-8 text-4xl font-light uppercase tracking-[0.3em] md:text-5xl lg:text-6xl">
            Ready to Elevate Your Audio Experience?
          </h2>
          
          <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 border border-white/20 bg-white/5 px-6 py-4 text-white placeholder-white/40 backdrop-blur transition-all focus:border-white/50 focus:outline-none sm:max-w-md"
              required
            />
            <button
              type="submit"
              className="border border-white bg-white px-8 py-4 font-medium uppercase tracking-wide text-black transition-all hover:bg-white/90"
            >
              Join the waitlist
            </button>
          </form>

          <p className="mt-6 text-xs text-white/40">
            Be the first to experience the future of audio
          </p>
        </div>
      </div>
    </section>
  );
}

