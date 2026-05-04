import { motion } from 'framer-motion';
import { ArrowRight, Play, Zap, Brain, Target, TrendingUp } from 'lucide-react';
import { useRef, useCallback, useEffect } from 'react';

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
});

const heroStats = [
    { label: 'Institutions', value: '1,000+', icon: Target, color: 'from-red-500 to-orange-500' },
    { label: 'Documents/Month', value: '5M+', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
    { label: 'AI Powered', value: 'Yes', icon: Brain, color: 'from-purple-500 to-indigo-500' },
    { label: 'Setup Time', value: '10 min', icon: Zap, color: 'from-green-500 to-emerald-500' },
];

export default function HeroSection() {
    const heroRef = useRef<HTMLDivElement>(null);

    /* Parallax on scroll (DigiClassroom pattern) */
    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                const scrolled = window.pageYOffset;
                heroRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            {/* Parallax gradient background (DigiClassroom pattern) */}
            <div
                ref={heroRef}
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(230,57,70,0.06) 0%, rgba(139,92,246,0.06) 50%, rgba(37,99,235,0.06) 100%)',
                    willChange: 'transform',
                }}
            />
            <div
                className="absolute inset-0"
                style={{ background: 'var(--bg)', opacity: 0.4, backdropFilter: 'blur(2px)' }}
            />

            {/* Soft gradient blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.07] animate-float"
                    style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }}
                />
                <div
                    className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.05]"
                    style={{ background: 'radial-gradient(circle, var(--accent-purple), transparent)', animationDelay: '2s' }}
                />
            </div>

            <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto">
                {/* Hero badge (DigiClassroom pattern) */}
                <motion.div {...fadeUp(0.1)} className="mb-8">
                    <div className="hero-badge">
                        <Zap size={14} style={{ color: 'var(--primary)' }} className="animate-pulse-vg" />
                        <span>Trusted by 1,000+ Institutions Across India</span>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    {...fadeUp(0.2)}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
                    style={{ color: 'var(--text-primary)' }}
                >
                    <span className="gradient-text-red">Vidyaverse Pro</span>
                    <br />
                    <span className="text-4xl sm:text-5xl font-semibold">One Platform. Everything Your Institution Needs.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    {...fadeUp(0.35)}
                    className="text-lg sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    From <strong>ID cards</strong> to <strong>certificates</strong>, <em>marksheets</em> to <em>portfolios</em> —
                    generate, manage, and distribute all institutional documents effortlessly with AI.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    {...fadeUp(0.5)}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                >
                    <a href="/register" className="btn-primary-landing text-lg px-8 py-4">
                        Start Free Trial
                        <ArrowRight size={20} className="ml-1" />
                    </a>
                    <a href="#how-it-works" className="btn-secondary-landing text-lg px-8 py-4">
                        <Play size={18} className="mr-1" />
                        Explore Features
                    </a>
                </motion.div>

                {/* Hero stats (DigiClassroom glass grid pattern) */}
                <motion.div
                    {...fadeUp(0.65)}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16"
                >
                    {heroStats.map((stat, i) => (
                        <div
                            key={i}
                            className="glass-card text-center p-4 transition-all duration-300 hover:scale-105 cursor-default"
                        >
                            <stat.icon
                                size={28}
                                className={`mx-auto mb-2 animate-pulse-vg`}
                                style={{ color: 'var(--primary)' }}
                            />
                            <div
                                className="text-2xl font-bold mb-1"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {stat.value}
                            </div>
                            <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>

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
                        className="mx-auto max-w-4xl rounded-2xl overflow-hidden"
                        style={{
                            transition: 'transform 0.4s ease-out',
                            willChange: 'transform',
                            boxShadow: '0 32px 80px rgba(230,57,70,0.1), 0 0 0 1px var(--border)',
                            background: 'var(--bg-surface)',
                        }}
                    >
                        <div
                            className="p-1 rounded-2xl"
                            style={{ background: 'linear-gradient(135deg, rgba(230,57,70,0.08), rgba(37,99,235,0.08))' }}
                        >
                            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                                {/* Window chrome */}
                                <div
                                    className="flex items-center gap-2 px-4 py-3"
                                    style={{ borderBottom: '1px solid var(--border-light)' }}
                                >
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    <div
                                        className="ml-4 flex-1 h-7 rounded-lg max-w-xs"
                                        style={{ background: 'var(--bg-surface)' }}
                                    ></div>
                                </div>
                                {/* Dashboard content */}
                                <div className="p-6 grid grid-cols-4 gap-4">
                                    {[
                                        { label: 'ID Cards', emoji: '🆔', color: '#E63946' },
                                        { label: 'Certificates', emoji: '📜', color: '#8B5CF6' },
                                        { label: 'Portfolios', emoji: '💼', color: '#2563EB' },
                                        { label: 'Marksheets', emoji: '📊', color: '#10B981' },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                                            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:scale-105"
                                            style={{
                                                background: 'var(--bg-surface)',
                                                border: '1px solid var(--border-light)',
                                            }}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                                style={{
                                                    background: `${item.color}15`,
                                                }}
                                            >
                                                {item.emoji}
                                            </div>
                                            <span
                                                className="text-xs font-medium"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                {item.label}
                                            </span>
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
                                                    background: `linear-gradient(90deg, ${['var(--primary)', 'var(--accent-purple)', 'var(--accent-blue)'][i]
                                                        }, transparent)`,
                                                    opacity: 0.12,
                                                    width: `${w}%`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
