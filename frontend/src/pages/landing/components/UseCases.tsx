import { motion } from 'framer-motion';
import { GraduationCap, Trophy, ClipboardList, Camera, Users, BookOpen } from 'lucide-react';

const useCases = [
    {
        icon: GraduationCap,
        title: 'Admission Season Rush',
        desc: '"We admit 500+ students in 2 weeks. ID cards used to take days. Now it\'s done in 30 minutes with bulk upload."',
        stat: '95% faster',
        motif: 'indic-motif-lotus',
    },
    {
        icon: Trophy,
        title: 'Award Day Ceremonies',
        desc: '"Need 200 certificates for annual day? Choose template, select students, generate. Parents love how professional they look."',
        stat: '3-click generation',
        motif: 'indic-motif-sriyantra',
    },
    {
        icon: ClipboardList,
        title: 'Exam Time Chaos',
        desc: '"Hall tickets with seat numbers, marksheets with auto-calculated grades — all from one dashboard. Zero manual errors."',
        stat: 'Zero errors',
        motif: 'indic-motif-ashoka',
    },
    {
        icon: Camera,
        title: 'Photo Day Workflow',
        desc: '"Upload one group photo, AI extracts individual faces, auto-assigns to student profiles. What took 3 days now takes 20 minutes."',
        stat: '10× faster',
        motif: 'indic-motif-peacock',
    },
    {
        icon: Users,
        title: 'Parent Communication',
        desc: '"Auto-generated portfolios with QR codes. Parents scan and see grades, certificates — all in one place. No more manual reports."',
        stat: '100% transparency',
        motif: 'indic-motif-kolam',
    },
    {
        icon: BookOpen,
        title: 'Transfer Season',
        desc: '"Transfer certificates with tamper-proof records and digital verification. No more lost paperwork."',
        stat: 'Fully digital',
        motif: 'indic-motif-meenakari',
    },
];

export default function UseCases() {
    return (
        <section id="use-cases" className="indic-section py-20">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="indic-eyebrow mb-4">Real Impact</span>
                    <h2 className="text-3xl sm:text-5xl mt-4 mb-4">
                        Real Problems. Real Solutions.
                    </h2>
                    <p className="text-lg max-w-3xl mx-auto indic-muted">
                        See how institutions like yours save hours every week with Vidyaverse Pro.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {useCases.map((uc, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="indic-tile p-8 h-full flex flex-col group"
                        >
                            <span className={`indic-tile__motif ${uc.motif}`} />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="indic-icon-plinth w-14 h-14 mb-6">
                                    <uc.icon size={28} className="relative z-10" />
                                </div>
                                <span className="indic-caps inline-block self-start px-3 py-1 rounded-full mb-3" style={{ background: 'var(--accent-soft)' }}>
                                    {uc.stat}
                                </span>
                                <h3 className="text-lg mb-3">{uc.title}</h3>
                                <p className="text-sm leading-relaxed flex-1 italic indic-muted">{uc.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
