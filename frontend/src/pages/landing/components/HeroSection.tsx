import { motion } from 'framer-motion';
import { ArrowRight, Play, Check, Calendar, MessageCircle } from 'lucide-react';
import { useRef, useCallback } from 'react';

const petals12 = Array.from({ length: 12 }, (_, i) => i * 30);
const petals8 = Array.from({ length: 8 }, (_, i) => i * 45);

const heroStats = [
    { value: '47', label: 'Integrated modules', color: 'var(--brand)' },
    { value: 'WhatsApp', label: 'Parent channel', color: 'var(--peacock)' },
    { value: 'SSO', label: 'One secure login', color: 'var(--indigo)' },
    { value: '10 min', label: 'Setup time', color: 'var(--deep-saffron)' },
];

const mockTiles = [
    { label: 'Attendance', rgbVar: '--peacock-teal-rgb', fg: 'var(--peacock)', icon: Check },
    { label: 'Fees', rgbVar: '--lotus-pink-rgb', fg: 'var(--lotus-pink)', rupee: true },
    { label: 'Timetable', rgbVar: '--indigo-rgb', fg: 'var(--indigo)', icon: Calendar },
    { label: 'WhatsApp', rgbVar: '--teal-rgb', fg: 'var(--teal-light)', icon: MessageCircle },
];

const mockBars = [
    { color: 'var(--brand)', width: '75%' },
    { color: 'var(--lotus-pink)', width: '50%' },
    { color: 'var(--peacock)', width: '90%' },
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
        <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden px-5 pt-[120px] pb-20">
            {/* Warm radial wash */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(120% 80% at 50% -10%, rgb(var(--saffron-rgb) / 0.10), transparent 55%),' +
                        'radial-gradient(90% 70% at 85% 20%, rgb(var(--gold-rgb) / 0.08), transparent 50%)',
                }}
            />

            {/* Hero mandala — two independently-rotating rings (outer 12-petal
                saffron @ 120s, inner 8-petal peacock @ 90s reverse) plus a
                breathing wrapper. Positioned so the flower's LEFT edge starts
                at the "Vidyaverse" headline's horizontal centre — its left
                half drapes over the headline's right half, the rest extends
                past the viewport edge (clipped by the section's
                overflow-hidden), matching the reference's actual rendered
                look. `left:50%` with no translateX (rather than the usual
                translateX(-50%) centering idiom) is what anchors the
                wrapper's edge — not its centre — to the headline's midpoint.
                Two nested divs on purpose: the outer one only positions, the
                inner one only breathes (scale) — combining them on one
                element lets the animation's `transform` clobber the static
                positioning. */}
            <div
                className="absolute pointer-events-none"
                style={{
                    top: '-18%',
                    left: '50%',
                    width: 'min(130vh, 1200px)',
                    aspectRatio: '1',
                }}
            >
              <div className="w-full h-full" style={{ animation: 'lg-breathe 9s ease-in-out infinite' }}>
                <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true">
                    <g style={{ transformOrigin: '200px 200px', animation: 'lg-spin 120s linear infinite' }}>
                        <circle cx="200" cy="200" r="182" fill="none" stroke="rgb(var(--deep-saffron-rgb) / 0.16)" strokeWidth="1" />
                        <circle cx="200" cy="200" r="160" fill="none" stroke="rgb(var(--saffron-rgb) / 0.2)" strokeWidth="0.8" />
                        {petals12.map((deg) => (
                            <path
                                key={`o${deg}`}
                                d="M200,42 Q222,72 200,104 Q178,72 200,42Z"
                                fill="rgb(var(--saffron-rgb) / 0.22)"
                                stroke="rgb(var(--deep-saffron-rgb) / 0.45)"
                                strokeWidth="0.5"
                                transform={`rotate(${deg} 200 200)`}
                            />
                        ))}
                    </g>
                    <g style={{ transformOrigin: '200px 200px', animation: 'lg-spinr 90s linear infinite' }}>
                        <circle cx="200" cy="200" r="104" fill="none" stroke="rgb(var(--peacock-teal-rgb) / 0.28)" strokeWidth="1" />
                        {petals8.map((deg) => (
                            <path
                                key={`i${deg}`}
                                d="M200,108 Q216,136 200,158 Q184,136 200,108Z"
                                fill="rgb(var(--peacock-teal-rgb) / 0.22)"
                                stroke="rgb(var(--peacock-teal-rgb) / 0.5)"
                                strokeWidth="0.8"
                                transform={`rotate(${deg} 200 200)`}
                            />
                        ))}
                    </g>
                    <circle cx="200" cy="200" r="42" fill="rgb(var(--gold-rgb) / 0.1)" stroke="rgb(var(--gold-rgb) / 0.5)" strokeWidth="1" />
                    <circle cx="200" cy="200" r="20" fill="rgb(var(--gold-rgb) / 0.22)" stroke="rgb(var(--deep-saffron-rgb) / 0.7)" strokeWidth="1.5" />
                    <circle cx="200" cy="200" r="8" fill="rgb(var(--gold-rgb) / 0.85)" />
                </svg>
              </div>
            </div>

            <div className="relative z-[2] text-center max-w-[940px] mx-auto">
                {/* Badge */}
                <motion.span
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2 px-4 py-[7px] rounded-full text-[13px] font-semibold"
                    style={{
                        color: 'var(--brand)',
                        background: 'rgb(var(--brand-rgb) / 0.08)',
                        border: '1px solid rgb(var(--brand-rgb) / 0.2)',
                    }}
                >
                    <span
                        className="w-[7px] h-[7px] rounded-full"
                        style={{ background: 'var(--brand)', animation: 'lg-bob 2.4s ease-in-out infinite' }}
                    />
                    Launching 2026 · Founding cohort now open
                </motion.span>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="leading-[1.02] mt-[22px] mb-2"
                >
                    <span
                        className="block text-[clamp(56px,12vw,132px)]"
                        style={{
                            fontFamily: 'var(--font-display)',
                            background: 'linear-gradient(120deg, var(--kumkum), var(--lotus-deep) 48%, var(--deep-saffron))',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent',
                        }}
                    >
                        Vidyaverse
                    </span>
                    <span
                        className="block mt-2 font-extrabold tracking-[-0.02em] text-[clamp(22px,4.4vw,44px)]"
                        style={{ color: 'var(--text)' }}
                    >
                        The operating system for modern institutions
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="font-deva text-[clamp(18px,2.6vw,26px)] mt-1.5 mb-[18px]"
                    style={{ color: 'var(--brand)' }}
                >
                    विद्या · एक मंच, समग्र संस्थान
                </motion.p>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-[640px] mx-auto mb-[34px] leading-[1.6] text-[clamp(16px,2.2vw,20px)] [text-wrap:pretty]"
                    style={{ color: 'var(--text2)' }}
                >
                    Run your entire campus from one system — academics, fees, attendance, transport, documents, and
                    AI-powered <strong style={{ color: 'var(--text)' }}>WhatsApp updates</strong> to every parent.{' '}
                    <strong style={{ color: 'var(--text)' }}>47 modules, one login.</strong>
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-wrap gap-3.5 justify-center mb-14"
                >
                    <a
                        href="/register"
                        className="lg-btn-shine inline-flex items-center gap-2 px-[30px] py-[15px] rounded-full font-bold text-base text-white transition-all duration-300 hover:-translate-y-[3px]"
                        style={{
                            background: 'linear-gradient(135deg, var(--brand), var(--brand-2))',
                            boxShadow: '0 12px 30px rgb(var(--brand-rgb) / 0.28)',
                        }}
                    >
                        Join the founding cohort
                        <ArrowRight size={19} />
                    </a>
                    <a
                        href="#modules"
                        className="inline-flex items-center gap-2 px-[30px] py-[15px] rounded-full font-bold text-base transition-all duration-300 hover:-translate-y-[3px]"
                        style={{
                            color: 'var(--brand)',
                            background: 'var(--elevated)',
                            border: '1.5px solid var(--brand)',
                        }}
                    >
                        <Play size={17} fill="currentColor" />
                        Explore the platform
                    </a>
                </motion.div>

                {/* Stat chips */}
                <div className="grid gap-3.5 max-w-[820px] mx-auto mb-14" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                    {heroStats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 26 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.36 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            className="px-3.5 py-[18px] rounded-[18px]"
                            style={{
                                background: 'var(--elevated)',
                                border: '1px solid var(--border-soft)',
                                boxShadow: '0 2px 16px rgb(var(--night-ink-rgb) / 0.05)',
                            }}
                        >
                            <div className="text-[30px] leading-tight" style={{ fontFamily: 'var(--font-display)', color: stat.color }}>
                                {stat.value}
                            </div>
                            <div className="text-[13px] font-semibold" style={{ color: 'var(--text2)' }}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Dashboard mockup with pointer tilt */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div
                        ref={visualRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="max-w-[860px] mx-auto rounded-[22px] overflow-hidden"
                        style={{
                            background: 'var(--elevated)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 30px 70px rgb(var(--night-ink-rgb) / 0.14)',
                            transition: 'transform 0.35s ease-out',
                            willChange: 'transform',
                        }}
                    >
                        {/* Window chrome */}
                        <div className="flex items-center gap-2 px-4 py-[13px]" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                            <span className="w-[11px] h-[11px] rounded-full" style={{ background: 'var(--brand)' }} />
                            <span className="w-[11px] h-[11px] rounded-full" style={{ background: 'var(--gold)' }} />
                            <span className="w-[11px] h-[11px] rounded-full" style={{ background: 'var(--peacock)' }} />
                            <span className="ml-3 flex-1 max-w-[280px] h-[26px] rounded-lg" style={{ background: 'rgb(var(--brand-rgb) / 0.08)' }} />
                        </div>
                        {/* Module tiles */}
                        <div className="p-[22px] grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                            {mockTiles.map((tile, i) => (
                                <motion.div
                                    key={tile.label}
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                                    className="flex flex-col items-center gap-2 px-2 py-4 rounded-[14px]"
                                    style={{
                                        background: `rgb(var(${tile.rgbVar}) / 0.06)`,
                                        border: '1px solid var(--border-soft)',
                                    }}
                                >
                                    <span
                                        className="w-10 h-10 rounded-[11px] flex items-center justify-center font-extrabold"
                                        style={{ background: `rgb(var(${tile.rgbVar}) / 0.14)`, color: tile.fg }}
                                    >
                                        {tile.rupee ? '₹' : tile.icon && <tile.icon size={20} />}
                                    </span>
                                    <span className="text-xs font-semibold" style={{ color: 'var(--text2)' }}>
                                        {tile.label}
                                    </span>
                                </motion.div>
                            ))}
                            {/* Progress bars */}
                            <div className="col-span-2 sm:col-span-4 grid grid-cols-3 gap-3 mt-1">
                                {mockBars.map((bar, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 1.2 + i * 0.15, duration: 0.7 }}
                                        className="h-[22px] rounded-lg origin-left"
                                        style={{
                                            background: `linear-gradient(90deg, ${bar.color}, transparent)`,
                                            opacity: 0.2,
                                            width: bar.width,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
