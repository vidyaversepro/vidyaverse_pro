import '../../styles/landing.css';

import { ThemeProvider } from './hooks/useTheme';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ModuleUniverse from './components/ModuleUniverse';
import LiveCommandCentre from './components/LiveCommandCentre';
import DocumentStudio from './components/DocumentStudio';
import WhatsAppComms from './components/WhatsAppComms';
import UseCases from './components/UseCases';
import EcosystemSection from './components/EcosystemSection';
import HowItWorks from './components/HowItWorks';
import ComparisonSection from './components/ComparisonSection';
import StatsSection from './components/StatsSection';
import ROICalculator from './components/ROICalculator';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

// Section order matches design_handoff_app_upgrade/reference/Vidyaverse
// Landing.dc.html: Hero, Modules, Live, Documents, Communication, [UseCases —
// proof-of-value, no reference equivalent, kept in its established slot],
// Ecosystem, How, Compare, Stats, ROI, CTA.
export default function LandingPage() {
    return (
        <ThemeProvider>
            <div className="landing-root" style={{ scrollBehavior: 'smooth' }}>
                <Navbar />
                <main>
                    {/* Hook + pain */}
                    <HeroSection />

                    {/* The repositioning: 47-module OS */}
                    <ModuleUniverse />

                    {/* Live command centre — the platform is real, not a mockup */}
                    <LiveCommandCentre />

                    {/* Document Studio (one pillar of the OS) */}
                    <DocumentStudio />

                    {/* The differentiator: WhatsApp parent communication */}
                    <WhatsAppComms />

                    {/* Proof of value */}
                    <UseCases />

                    {/* The trio / federation story (hub-only) */}
                    <EcosystemSection />

                    <HowItWorks />

                    {/* Why one platform beats vendors / manual */}
                    <ComparisonSection />

                    {/* Capability stats + founding-cohort voices */}
                    <StatsSection />

                    {/* Interactive ROI: drag campus size, see savings update live */}
                    <ROICalculator />

                    {/* Close */}
                    <CTASection />
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
}
