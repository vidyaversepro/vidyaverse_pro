import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '../../styles/landing.css';

import { ThemeProvider } from './hooks/useTheme';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import UseCases from './components/UseCases';
import ServicesSection from './components/ServicesSection';
import HowItWorks from './components/HowItWorks';
import StatsSection from './components/StatsSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function LandingPage() {
    return (
        <ThemeProvider>
            <div className="landing-root" style={{ scrollBehavior: 'smooth' }}>
                <Navbar />
                <main>
                    <HeroSection />
                    <ProblemSection />
                    <UseCases />
                    <ServicesSection />
                    <HowItWorks />
                    <StatsSection />
                    <CTASection />
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
}
