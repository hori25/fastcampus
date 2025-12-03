import BrandEssay from '@/components/BrandEssay';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Newsletter from '@/components/Newsletter';
import ProductGrid from '@/components/ProductGrid';

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      {/* Hero 높이만큼 spacer */}
      <div className="h-screen" />
      <main className="relative bg-white text-ink" style={{ zIndex: 10 }}>
        <ProductGrid />
        <BrandEssay />
        <Gallery />
        <Newsletter />
        <Footer />
      </main>
    </>
  );
}

