import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import HeroSection from '../components/home/HeroSection.jsx'
import FeaturesSection from '../components/home/FeaturesSection.jsx'
import HowItWorksSection from '../components/home/HowItWorksSection.jsx'
import TrustSection from '../components/home/TrustSection.jsx'
import TestimonialsSection from '../components/home/TestimonialsSection.jsx'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TrustSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  )
}
