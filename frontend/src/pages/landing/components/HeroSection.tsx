import { motion } from 'framer-motion';
import { ArrowRight, Play, Zap, Target, TrendingUp, Brain, ChevronDown } from 'lucide-react';
import { useRef, useCallback } from 'react';
import { MandalaSVG } from '@/design/indic/motifs/mandala-svgs';

const heroStats = [
    { label: 'Integrated Modules', value: '47', icon: Target },
    { label: 'Parent Channel', value: 'WhatsApp', icon: TrendingUp },
    { label: 'One Secure Login', value: 'SSO', icon: Brain },
    { label: 'Setup Time', value: '10 min', icon: Zap },
];

export default function HeroSection() {
    const visualRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const el = visualRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
        el.style.transform = `perspective(1200px) rotateY(${x}deg) rotateX(${y}deg)`;
    }, []);

    const handleMouseLeave = useCallback(() => {
        const el = visualRef.current;
        if (el) el.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
    }, []);

    return (
        <section className="indic-hero-canvas relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            <div className="rangoli-texture" />

            {/* Slowly breathing lotus mandala, the trio's shared hero motif */}
            <div className="mandala-wrapper mandala-breathe">
                <MandalaSVG />
            </div>

            <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto py-16">
                {/* Hero badge */}
                <div className="mb-6 mt-8">
                    <span className="indic-eyebrow indic-rise">
                        <Zap className="h-4 w-4" /> Launching 2026 · Founding cohort now open
                    </span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.08] mb-6 indic-rise indic-delay-1">
                    <span className="gradient-text-indic-soft">Vidyaverse</span>
                    <br />
                    <span className="text-3xl sm:text-4xl lg:text-5xl">The Operating System for Modern Institutions</span>
                </h1>

                <p
                    className="font-deva text-lg md:text-xl mb-2 font-semibold tracking-wide indic-rise indic-delay-2"
                    style={{ color: 'var(--accent-strong)' }}
                >
                    विद्या · एक मंच, समग्र संस्थान
                </p>

                {/* Subtitle */}
                <p className="indic-muted text-lg sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed indic-rise indic-delay-2">
                    Run your entire campus from one system — <strong>academics</strong>, <strong>fees</strong>,
                    <em> attendance</em>, <em>transport</em>, documents, and AI-powered <strong>WhatsApp updates</strong> to
                    every parent. 47 modules, one login.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 indic-rise indic-delay-3">
                    <a href="/register" className="indic-cta indic-cta--primary w-full sm:w-auto text-lg">
                        Join the Founding Cohort
                        <ArrowRight size={20} />
                    </a>
                    <a href="#modules" className="indic-cta indic-cta--ghost w-full sm:w-auto text-lg">
                        <Play size={18} />
                        Explore the Platform
                    </a>
                </div>

                {/* Hero stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
                    {heroStats.map((stat) => (
                        <div key={stat.label} className="indic-tile text-center p-4">
                            <span className="indic-icon-plinth w-11 h-11 mx-auto mb-2">
                                <stat.icon className="h-5 w-5" />
                            </span>
                            <div className="indic-stat__value text-2xl">{stat.value}</div>
                            <div className="indic-muted text-xs font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* 3D Floating Dashboard Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div
                        ref={visualRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="indic-tile mx-auto max-w-4xl rounded-2xl overflow-hidden p-0"
                        style={{ transition: 'transform 0.4s ease-out', willChange: 'transform' }}
                    >
                        {/* Window chrome */}
                        <div
                            className="flex items-center gap-2 px-4 py-3"
                            style={{ borderBottom: '1px solid rgb(var(--temple-stone-rgb) / 0.18)' }}
                        >
                            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--accent-strong)' }} />
                            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--gold)' }} />
                            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--peacock-teal)' }} />
                            <div
                                className="ml-4 flex-1 h-7 rounded-lg max-w-xs"
                                style={{ background: 'rgb(var(--accent-primary-rgb) / 0.08)' }}
                            />
                        </div>
                        {/* Dashboard content */}
                        <div className="p-6 grid grid-cols-4 gap-4">
                            {[
                                { label: 'Attendance', emoji: '✅', rgbVar: '--accent-strong-rgb' },
                                { label: 'Fees', emoji: '💳', rgbVar: '--lotus-pink-rgb' },
                                { label: 'Timetable', emoji: '📅', rgbVar: '--indigo-deep-rgb' },
                                { label: 'WhatsApp', emoji: '💬', rgbVar: '--peacock-teal-rgb' },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:scale-105"
                                    style={{
                                        background: 'rgb(var(--accent-primary-rgb) / 0.04)',
                                        border: '1px solid rgb(var(--temple-stone-rgb) / 0.16)',
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                        style={{ background: `rgb(var(${item.rgbVar}) / 0.15)` }}
                                    >
                                        {item.emoji}
                                    </div>
                                    <span className="indic-muted text-xs font-medium">{item.label}</span>
                                </motion.div>
                            ))}
                            {/* Progress bars */}
                            <div className="col-span-4 grid grid-cols-3 gap-3 mt-2">
                                {[75, 50, 90].map((w, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 1.5 + i * 0.15, duration: 0.7 }}
                                        className="h-6 rounded-lg origin-left"
                                        style={{
                                            background: `linear-gradient(90deg, ${['var(--accent-strong)', 'var(--lotus-pink)', 'var(--peacock-teal)'][i]
                                                }, transparent)`,
                                            opacity: 0.16,
                                            width: `${w}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 indic-float">
                <ChevronDown className="w-7 h-7" style={{ color: 'rgb(var(--accent-strong-rgb) / 0.6)' }} />
            </div>
        </section>
    );
}
