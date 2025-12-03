import Image from 'next/image';

export default function LifestyleSection() {
  return (
    <section className="relative bg-black py-32 text-white">
      <div className="section-shell">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-5xl font-light uppercase tracking-[0.3em] md:text-6xl">
            Built for Your Lifestyle.
          </h2>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm uppercase tracking-wide text-white/40">
                Model Showcase
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

