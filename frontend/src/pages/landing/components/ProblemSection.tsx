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
        <section className="indic-section py-20" id="problem-solution">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div {...fadeUp} className="text-center mb-16">
                    <span className="indic-eyebrow mb-4">The Difference</span>
                    <h2 className="text-3xl sm:text-5xl mt-4">
                        Stop Juggling. Start Simplifying.
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* OLD WAY */}
                    <motion.div {...fadeUp} className="indic-tile p-8">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg"
                                    style={{
                                        background: 'rgb(var(--bark-rgb) / 0.12)',
                                        color: 'var(--bark)',
                                    }}
                                >
                                    ✕
                                </div>
                                <h3 className="text-xl">Without Vidyaverse</h3>
                            </div>
                            <ul className="space-y-4">
                                {oldWay.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm indic-muted">
                                        <item.icon size={18} className="shrink-0" style={{ color: 'var(--bark)' }} />
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
                        className="indic-tile p-8"
                        style={{ borderColor: 'rgb(var(--accent-primary-rgb) / 0.35)' }}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="indic-icon-plinth w-12 h-12 text-lg">✓</span>
                                <h3 className="text-xl">With Vidyaverse</h3>
                            </div>
                            <ul className="space-y-4">
                                {newWay.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                        <item.icon size={18} className="shrink-0" style={{ color: 'var(--accent-strong)' }} />
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
