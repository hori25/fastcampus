export default function FeatureGrid() {
  const features = [
    'Crystal-Clear Sound',
    'All-Day Comfort',
    'Long Battery Life',
    'Noise-cancellation',
    'Water-resistant',
    'Travel-ready',
    'Perfect companion',
    'Deep bass',
    'Secure-fit design'
  ];

  return (
    <section className="relative bg-black py-32 text-white">
      <div className="section-shell">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group flex items-center justify-center border border-white/10 bg-white/5 px-8 py-12 text-center transition-all duration-300 hover:border-white/30 hover:bg-white/10"
              >
                <h3 className="text-xl font-light uppercase tracking-wide transition-colors group-hover:text-white/90">
                  {feature}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

