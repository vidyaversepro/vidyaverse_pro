import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const petals12 = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

export default function CTASection() {
    return (
        <section id="cta" className="px-[clamp(16px,4vw,28px)] pt-[clamp(20px,4vw,40px)] pb-[clamp(64px,9vw,110px)]">
            <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden max-w-[1080px] mx-auto rounded-[32px] text-center px-[clamp(24px,5vw,64px)] py-[clamp(44px,7vw,88px)]"
                style={{
                    background: 'linear-gradient(135deg, var(--kumkum), var(--lotus-deep) 60%, var(--deep-saffron))',
                    boxShadow: '0 30px 80px rgb(var(--kumkum-rgb) / 0.3)',
                }}
            >
                {/* Decorative spinning mandala */}
                <div className="absolute pointer-events-none" style={{ top: '-40%', right: '-10%', width: 520, aspectRatio: '1', opacity: 0.16 }}>
                    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true">
                        <g style={{ transformOrigin: '200px 200px', animation: 'lg-spin 80s linear infinite' }}>
                            <circle cx="200" cy="200" r="180" fill="none" stroke="#fff" strokeWidth="1" />
                            {petals12.map((deg) => (
                                <path
                                    key={deg}
                                    d="M200,40 Q224,74 200,106 Q176,74 200,40Z"
                                    fill="rgba(255,255,255,0.5)"
                                    transform={`rotate(${deg} 200 200)`}
                                />
                            ))}
                        </g>
                        <circle cx="200" cy="200" r="30" fill="#fff" />
                    </svg>
                </div>

                <div className="relative z-[2]">
                    <p className="font-deva mb-3" style={{ color: 'var(--ink-gold)', fontSize: 'clamp(18px,3vw,26px)' }}>
                        आइए, साथ मिलकर विद्या का प्रबंध करें
                    </p>
                    <h2
                        className="mb-4 leading-[1.08] text-[clamp(30px,5.6vw,58px)]"
                        style={{ fontFamily: 'var(--font-display)', color: '#fff' }}
                    >
                        Bring your whole campus into one system
                    </h2>
                    <p
                        className="max-w-[560px] mx-auto mb-[34px] leading-[1.6]"
                        style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(16px,2.2vw,20px)' }}
                    >
                        Join the founding cohort for 2026 and shape the platform with us — priority onboarding,
                        founder pricing, direct line to the team.
                    </p>
                    <div className="flex flex-wrap gap-3.5 justify-center">
                        <a
                            href="/register"
                            className="inline-flex items-center gap-2 px-[34px] py-4 rounded-full font-extrabold text-base transition-all duration-300 hover:-translate-y-[3px]"
                            /* --kumkum, not --ink-kumkum: this pill is WHITE in both themes, so it
                               always needs the deep pigment. The theme-aware ink lightens for
                               dark surfaces and measured 2.77:1 here. */
                            style={{ color: 'var(--kumkum)', background: '#fff' }}
                        >
                            Join the founding cohort
                            <ArrowRight size={19} />
                        </a>
                        <a
                            href="#modules"
                            className="inline-flex items-center gap-2 px-[34px] py-4 rounded-full font-bold text-base text-white transition-colors duration-300"
                            style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.5)' }}
                        >
                            Book a walkthrough
                        </a>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
