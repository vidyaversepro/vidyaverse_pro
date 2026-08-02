import '../../styles/landing.css';

import { ThemeProvider } from './hooks/useTheme';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import ModuleUniverse from './components/ModuleUniverse';
import ServicesSection from './components/ServicesSection';
import WhatsAppComms from './components/WhatsAppComms';
import UseCases from './components/UseCases';
import HowItWorks from './components/HowItWorks';
import EcosystemSection from './components/EcosystemSection';
import ComparisonSection from './components/ComparisonSection';
import StatsSection from './components/StatsSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function LandingPage() {
    return (
        <ThemeProvider>
            <div className="landing-root" style={{ scrollBehavior: 'smooth' }}>
                <Navbar />
                <main>
                    {/* Hook + pain */}
                    <HeroSection />
                    <ProblemSection />

                    {/* The repositioning: 47-module OS */}
                    <ModuleUniverse />

                    {/* Document Studio (one pillar of the OS) */}
                    <ServicesSection />

                    {/* The differentiator: WhatsApp parent communication */}
                    <WhatsAppComms />

                    {/* Proof of value */}
                    <UseCases />
                    <HowItWorks />

                    {/* The trio / federation story (hub-only) */}
                    <EcosystemSection />

                    {/* Why one platform beats vendors / manual */}
                    <ComparisonSection />

                    {/* Capability stats + founding-cohort voices */}
                    <StatsSection />

                    {/* Close */}
                    <CTASection />
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
}
