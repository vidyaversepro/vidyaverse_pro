import { motion } from 'framer-motion';
import { GraduationCap, Trophy, ClipboardList, Camera, Users, BookOpen } from 'lucide-react';
import type { CSSProperties } from 'react';
import CardMandala from './CardMandala';

const useCases = [
    {
        icon: GraduationCap,
        title: 'Admission Season Rush',
        desc: '"We admit 500+ students in 2 weeks. ID cards used to take days. Now it\'s done in 30 minutes with bulk upload."',
        stat: '95% faster',
        color: 'var(--peacock-teal)',
        rgbVar: '--peacock-teal-rgb',
    },
    {
        icon: Trophy,
        title: 'Award Day Ceremonies',
        desc: '"Need 200 certificates for annual day? Choose template, select students, generate. Parents love how professional they look."',
        stat: '3-click generation',
        color: 'var(--indigo-ink)',
        rgbVar: '--indigo-rgb',
    },
    {
        icon: ClipboardList,
        title: 'Exam Time Chaos',
        desc: '"Hall tickets with seat numbers, marksheets with auto-calculated grades — all from one dashboard. Zero manual errors."',
        stat: 'Zero errors',
        color: 'var(--clay-mid)',
        rgbVar: '--deep-saffron-rgb',
    },
    {
        icon: Camera,
        title: 'Photo Day Workflow',
        desc: '"Upload one group photo, AI extracts individual faces, auto-assigns to student profiles. What took 3 days now takes 20 minutes."',
        stat: '10× faster',
        color: 'var(--teal-light)',
        rgbVar: '--teal-rgb',
    },
    {
        icon: Users,
        title: 'Parent Communication',
        desc: '"Auto-generated portfolios with QR codes. Parents scan and see grades, certificates — all in one place. No more manual reports."',
        stat: '100% transparency',
        color: 'var(--lotus-pink)',
        rgbVar: '--lotus-pink-rgb',
    },
    {
        icon: BookOpen,
        title: 'Transfer Season',
        desc: '"Transfer certificates with tamper-proof records and digital verification. No more lost paperwork."',
        stat: 'Fully digital',
        color: 'var(--brand)',
        rgbVar: '--brand-rgb',
    },
];

export default function UseCases() {
    return (
        <section id="use-cases" className="px-[clamp(16px,4vw,28px)] py-[clamp(64px,9vw,110px)]" style={{ background: 'var(--surface)' }}>
            <div className="max-w-[1200px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-[720px] mx-auto mb-14"
                >
                    <span className="text-xs font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--brand)' }}>
                        Real impact
                    </span>
                    <h2
                        className="my-3.5 leading-[1.08] text-[clamp(30px,5.2vw,54px)]"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                    >
                        Real problems. Real solutions.
                    </h2>
                    <p className="leading-[1.6] text-[clamp(15px,2vw,19px)] [text-wrap:pretty]" style={{ color: 'var(--text2)' }}>
                        See how institutions like yours save hours every week with Vidyaverse.
                    </p>
                </motion.div>

                <div className="grid gap-[22px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {useCases.map((uc, i) => (
                        <motion.div
                            key={uc.title}
                            initial={{ opacity: 0, y: 26 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.7, delay: (i % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
                            className="lg-module-card relative overflow-hidden p-7 rounded-[22px]"
                            style={{
                                '--mc': `var(${uc.rgbVar})`,
                                background: 'var(--elevated)',
                                border: '1px solid var(--border-soft)',
                                boxShadow: '0 2px 18px rgb(var(--night-ink-rgb) / 0.05)',
                            } as CSSProperties}
                        >
                            <CardMandala color={uc.color} />
                            <span
                                className="w-14 h-14 rounded-[15px] flex items-center justify-center mb-[18px]"
                                style={{ background: `rgb(var(${uc.rgbVar}) / 0.12)`, color: uc.color }}
                            >
                                <uc.icon size={26} strokeWidth={1.7} />
                            </span>
                            <span
                                className="inline-block text-[11px] font-bold tracking-[0.06em] uppercase px-[11px] py-[5px] rounded-full mb-3.5"
                                style={{ color: uc.color, background: `rgb(var(${uc.rgbVar}) / 0.1)` }}
                            >
                                {uc.stat}
                            </span>
                            <h3 className="text-[19px] font-extrabold mb-2.5" style={{ color: 'var(--text)' }}>
                                {uc.title}
                            </h3>
                            <p className="text-[13.5px] leading-[1.6] italic" style={{ color: 'var(--text2)' }}>
                                {uc.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
