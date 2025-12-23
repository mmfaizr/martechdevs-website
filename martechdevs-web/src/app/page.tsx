import HeroSection from '@/components/HeroSection';
import ClientLogos from '@/components/ClientLogos';
import FeaturedCaseStudies from '@/components/FeaturedCaseStudies';
import AllServiceSections from '@/components/AllServiceSections';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <ClientLogos />
      <AllServiceSections />
      <Testimonials />
      <Footer />
    </main>
  );
}
