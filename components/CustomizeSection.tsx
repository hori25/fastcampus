export default function CustomizeSection() {
  const features = [
    {
      number: '1',
      title: 'Big on sound',
      description: 'Ultra-lightweight headphones that move with you.'
    },
    {
      number: '2',
      title: 'Ergonomic ear cushions',
      description: 'that mold to you. Stay comfortable, no matter how long you listen.'
    },
    {
      number: '3',
      title: 'Premium materials',
      description: 'Crafted with attention to every detail for lasting quality.'
    }
  ];

  return (
    <section className="relative bg-black py-32 text-white">
      <div className="section-shell">
        <div className="mx-auto max-w-6xl">
          <div className="mb-20 text-center">
            <h2 className="text-5xl font-light uppercase tracking-[0.3em] md:text-6xl">
              Customize
            </h2>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-white/50">
              According to your style
            </p>
          </div>

          <div className="grid gap-16 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.number} className="group text-center">
                <div className="mb-6 flex justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 text-2xl font-light transition-all group-hover:border-white/50 group-hover:bg-white/5">
                    {feature.number}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-medium tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

