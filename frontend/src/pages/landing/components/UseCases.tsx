import { motion } from 'framer-motion';
import { GraduationCap, Trophy, ClipboardList, Camera, Users, BookOpen } from 'lucide-react';

const useCases = [
    {
        icon: GraduationCap,
        title: 'Admission Season Rush',
        desc: '"We admit 500+ students in 2 weeks. ID cards used to take days. Now it\'s done in 30 minutes with bulk upload."',
        stat: '95% faster',
        color: 'from-red-500 to-orange-500',
        glowColor: 'shadow-red-500/25',
    },
    {
        icon: Trophy,
        title: 'Award Day Ceremonies',
        desc: '"Need 200 certificates for annual day? Choose template, select students, generate. Parents love how professional they look."',
        stat: '3-click generation',
        color: 'from-purple-500 to-indigo-600',
        glowColor: 'shadow-purple-500/25',
    },
    {
        icon: ClipboardList,
        title: 'Exam Time Chaos',
        desc: '"Hall tickets with seat numbers, marksheets with auto-calculated grades — all from one dashboard. Zero manual errors."',
        stat: 'Zero errors',
        color: 'from-blue-500 to-cyan-500',
        glowColor: 'shadow-blue-500/25',
    },
    {
        icon: Camera,
        title: 'Photo Day Workflow',
        desc: '"Upload one group photo, AI extracts individual faces, auto-assigns to student profiles. What took 3 days now takes 20 minutes."',
        stat: '10× faster',
        color: 'from-green-500 to-emerald-500',
        glowColor: 'shadow-green-500/25',
    },
    {
        icon: Users,
        title: 'Parent Communication',
        desc: '"Auto-generated portfolios with QR codes. Parents scan and see grades, certificates — all in one place. No more manual reports."',
        stat: '100% transparency',
        color: 'from-orange-500 to-amber-500',
        glowColor: 'shadow-orange-500/25',
    },
    {
        icon: BookOpen,
        title: 'Transfer Season',
        desc: '"Transfer certificates with tamper-proof records and digital verification. No more lost paperwork."',
        stat: 'Fully digital',
        color: 'from-pink-500 to-rose-500',
        glowColor: 'shadow-pink-500/25',
    },
];

export default function UseCases() {
    return (
        <section id="use-cases" className="section-padding">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="section-overline">Real Impact</p>
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                        Real Problems.{' '}
                        <span className="gradient-text-educational">Real Solutions.</span>
                    </h2>
                    <p className="text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        See how institutions like yours save hours every week with Vidyaverse Pro.
                    </p>
                </motion.div>

                {/* DigiClassroom feature card pattern: gradient icon, hover overlay, glow shadow */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {useCases.map((uc, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                        >
                            <div className={`feature-card p-8 h-full flex flex-col group`}>
                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Gradient icon (DigiClassroom pattern) */}
                                    <div
                                        className={`icon-gradient mb-6 shadow-lg ${uc.glowColor}`}
                                        style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                                    >
                                        <div className={`icon-gradient bg-gradient-to-br ${uc.color}`}>
                                            <uc.icon size={28} className="relative z-10 text-white" />
                                        </div>
                                    </div>
                                    {/* Highlight badge */}
                                    <span
                                        className={`inline-block self-start px-3 py-1 text-xs font-semibold rounded-full text-white mb-3 bg-gradient-to-r ${uc.color}`}
                                    >
                                        {uc.stat}
                                    </span>
                                    <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                                        {uc.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed flex-1 italic" style={{ color: 'var(--text-secondary)' }}>
                                        {uc.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
