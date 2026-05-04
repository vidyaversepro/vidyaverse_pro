import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const stages = [
    { text: 'One Platform. Eight Powerhouses.', sub: 'Scattered services that waste your time...' },
    { text: 'Single Student Record', sub: 'One record connects to every service instantly.' },
    { text: 'AI-Optimized. Self-Hosted.', sub: 'OpenCV + Gemini cascade saves 90% on AI costs.' },
    { text: 'Built for 10,000+ Institutions', sub: 'Multi-tenant architecture that scales effortlessly.' },
];

const serviceCards = [
    { emoji: '🆔', label: 'ID Cards', color: '#00D9FF' },
    { emoji: '📜', label: 'Certificates', color: '#8B5CF6' },
    { emoji: '👥', label: 'Group Photos', color: '#06b6d4' },
    { emoji: '🎓', label: 'Portfolios', color: '#a855f7' },
    { emoji: '🎫', label: 'Hall Tickets', color: '#22d3ee' },
    { emoji: '📊', label: 'Marksheets', color: '#7c3aed' },
    { emoji: '📚', label: 'Library Cards', color: '#67e8f9' },
    { emoji: '📄', label: 'Transfer Certs', color: '#c084fc' },
];

export default function SolutionShowcase() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        if (reducedMotion) return;

        let gsapInstance: typeof import('gsap') | null = null;
        let scrollTriggerInstance: any = null;

        const initGsap = async () => {
            const gsapModule = await import('gsap');
            const { ScrollTrigger } = await import('gsap/ScrollTrigger');
            gsapInstance = gsapModule;
            gsapInstance.gsap.registerPlugin(ScrollTrigger);
            scrollTriggerInstance = ScrollTrigger;

            const section = sectionRef.current;
            if (!section) return;

            const cards = section.querySelectorAll('.showcase-card');
            const texts = section.querySelectorAll('.showcase-text');
            const connector = section.querySelector('.showcase-connector');

            const tl = gsapInstance.gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: '+=300%',
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                },
            });

            // Stage 1 → 2: Cards scatter → come together
            tl.fromTo(
                cards,
                {
                    scale: 0.6,
                    opacity: 0,
                    x: (_i: number, el: Element) => {
                        const idx = Array.from(cards).indexOf(el);
                        return (idx % 2 === 0 ? -1 : 1) * (150 + Math.random() * 100);
                    },
                    y: (_i: number, el: Element) => {
                        const idx = Array.from(cards).indexOf(el);
                        return (idx < 4 ? -1 : 1) * (80 + Math.random() * 60);
                    },
                    rotation: () => (Math.random() - 0.5) * 30,
                },
                {
                    scale: 1,
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotation: 0,
                    stagger: 0.05,
                    duration: 1,
                    ease: 'power2.inOut',
                },
                0
            );

            // Connector lines appear
            if (connector) {
                tl.fromTo(
                    connector,
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
                    0.5
                );
            }

            // Text transitions
            texts.forEach((text, i) => {
                if (i === 0) {
                    tl.fromTo(text, { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0.8);
                } else if (i < texts.length - 1) {
                    tl.fromTo(text, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.3 + i * 0.6);
                    tl.fromTo(text, { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0.6 + i * 0.6);
                } else {
                    tl.fromTo(text, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.3 + i * 0.6);
                }
            });

            // Stage 3: Cards glow
            tl.to(
                cards,
                {
                    boxShadow: '0 0 40px rgba(0, 217, 255, 0.3), 0 0 80px rgba(139, 92, 246, 0.15)',
                    borderColor: 'rgba(0, 217, 255, 0.3)',
                    duration: 0.5,
                },
                1.5
            );
        };

        initGsap();

        return () => {
            scrollTriggerInstance?.getAll?.().forEach((st: any) => st.kill());
        };
    }, [reducedMotion]);

    return (
        <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" id="showcase">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-space via-space-50 to-space pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
                {/* Text overlays */}
                <div className="absolute top-8 left-0 right-0 text-center z-20">
                    {stages.map((stage, i) => (
                        <div
                            key={i}
                            className="showcase-text absolute inset-0 flex flex-col items-center justify-start"
                            style={{ opacity: i === 0 ? 1 : 0 }}
                        >
                            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
                                <span className="gradient-text">{stage.text}</span>
                            </h2>
                            <p className="text-white/50 text-lg">{stage.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Service cards grid */}
                <div className="relative mt-32 sm:mt-40">
                    {/* Connector visualization */}
                    <div className="showcase-connector absolute inset-0 flex items-center justify-center pointer-events-none opacity-0">
                        <svg className="w-full h-full absolute" viewBox="0 0 600 400" fill="none">
                            <defs>
                                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
                                </linearGradient>
                            </defs>
                            {/* Connection lines from center to cards */}
                            {[0, 1, 2, 3].map((i) => (
                                <line
                                    key={`h${i}`}
                                    x1="300" y1="200"
                                    x2={75 + i * 150} y2={100}
                                    stroke="url(#lineGrad)" strokeWidth="1"
                                />
                            ))}
                            {[0, 1, 2, 3].map((i) => (
                                <line
                                    key={`v${i}`}
                                    x1="300" y1="200"
                                    x2={75 + i * 150} y2={300}
                                    stroke="url(#lineGrad)" strokeWidth="1"
                                />
                            ))}
                            <circle cx="300" cy="200" r="6" fill="#00D9FF" opacity="0.6" />
                        </svg>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                        {serviceCards.map((card, i) => (
                            <div
                                key={i}
                                className="showcase-card glass-card p-6 text-center"
                                style={{ borderColor: `${card.color}10` }}
                            >
                                <div className="text-4xl mb-3">{card.emoji}</div>
                                <p className="font-semibold text-sm text-white/80">{card.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fallback for reduced motion */}
            {reducedMotion && (
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h2 className="text-3xl font-extrabold gradient-text mb-4">
                        One Platform. Eight Powerhouses.
                    </h2>
                </motion.div>
            )}
        </section>
    );
}
