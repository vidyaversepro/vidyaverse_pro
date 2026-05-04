import { motion } from 'framer-motion';
import {
    FolderOpen, FileSpreadsheet, UserCog, Clock,
    Frown, Target, Zap, Bot, Mail, Timer, Smile,
} from 'lucide-react';

const fadeUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const oldWay = [
    { icon: FolderOpen, text: 'ID cards from one vendor' },
    { icon: FileSpreadsheet, text: 'Certificates from another' },
    { icon: UserCog, text: 'Marksheets in spreadsheets' },
    { icon: Clock, text: 'Hall tickets manually printed' },
    { icon: Timer, text: 'Hours of repetitive work' },
    { icon: Frown, text: 'Stressed staff, unhappy parents' },
];

const newWay = [
    { icon: Target, text: 'One platform for everything' },
    { icon: Zap, text: 'Instant generation in 3 clicks' },
    { icon: Bot, text: 'AI handles photo enhancement' },
    { icon: Mail, text: 'Auto-email to parents & students' },
    { icon: Timer, text: 'Tasks done in minutes, not hours' },
    { icon: Smile, text: 'Happy staff, delighted parents' },
];

export default function ProblemSection() {
    return (
        <section className="section-padding section-surface" id="problem-solution">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div {...fadeUp} className="text-center mb-16">
                    <p className="section-overline">The Difference</p>
                    <h2
                        className="text-3xl sm:text-5xl font-bold tracking-tight"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Stop Juggling. Start{' '}
                        <span className="gradient-text">Simplifying.</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* OLD WAY */}
                    <motion.div
                        {...fadeUp}
                        className="feature-card comparison-old p-8"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className="icon-gradient w-12 h-12"
                                    style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                                >
                                    <span className="relative z-10 text-lg">✕</span>
                                </div>
                                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Without Vidyaverse
                                </h3>
                            </div>
                            <ul className="space-y-4">
                                {oldWay.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-3 text-sm"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        <item.icon size={18} className="text-red-400 shrink-0" />
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* NEW WAY */}
                    <motion.div
                        {...fadeUp}
                        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="feature-card comparison-new p-8"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className="icon-gradient w-12 h-12"
                                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))' }}
                                >
                                    <span className="relative z-10 text-lg">✓</span>
                                </div>
                                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    With Vidyaverse
                                </h3>
                            </div>
                            <ul className="space-y-4">
                                {newWay.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-3 text-sm font-medium"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        <item.icon size={18} style={{ color: 'var(--primary)' }} className="shrink-0" />
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
