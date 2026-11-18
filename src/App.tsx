import { LivingSystemsCanvas } from './components/LivingSystemsCanvas';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutMethodologySection } from './components/AboutMethodologySection';
import { ProjectsShowcaseSection } from './components/ProjectsShowcaseSection';
import { CapabilitiesSection } from './components/CapabilitiesSection';
import { TeamCollaborationsSection } from './components/TeamCollaborationsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { ContactFooterSection } from './components/ContactFooterSection';
import { PerspectivesProvider } from './context/PerspectivesContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <PerspectivesProvider>
        <div className="relative min-h-screen bg-[#090D14] text-[#F1F5F9] overflow-x-clip">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#35D6E8] focus:text-[#090D14] focus:font-semibold"
          >
            Skip to main content
          </a>

          {/* Living Systems 3D Spatial Backdrop */}
          <LivingSystemsCanvas />

          {/* Top Navigation */}
          <Navbar />

          {/* Main Content Flow */}
          <main id="main-content" className="relative z-10">
            <HeroSection />
            <AboutMethodologySection />
            <ProjectsShowcaseSection />
            <CapabilitiesSection />
            <TeamCollaborationsSection />
            <TestimonialsSection />
            <FAQSection />
            <ContactFooterSection />
          </main>
        </div>
      </PerspectivesProvider>
    </ErrorBoundary>
  );
}
