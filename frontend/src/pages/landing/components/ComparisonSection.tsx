import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

const rows = [
    {
        feature: 'Cost',
        traditional: { text: '$50-200/user/month', bad: true },
        vidyaverse: { text: 'Self-hosted — $0/month', good: true },
        manual: { text: 'Paper-based chaos', bad: true },
    },
    {
        feature: 'Data Ownership',
        traditional: { text: 'Third-party servers', bad: true },
        vidyaverse: { text: 'Your server, your control', good: true },
        manual: { text: 'No digital records', bad: true },
    },
    {
        feature: 'Services',
        traditional: { text: '8 separate tools', bad: true },
        vidyaverse: { text: '8 services, 1 platform', good: true },
        manual: { text: 'Disconnected workflows', bad: true },
    },
    {
        feature: 'AI Costs',
        traditional: { text: 'Gemini API = $100s', bad: true },
        vidyaverse: { text: 'OpenCV cascade = 90% savings', good: true },
        manual: { text: 'No AI automation', bad: true },
    },
    {
        feature: 'Setup Time',
        traditional: { text: 'Weeks of onboarding', bad: true },
        vidyaverse: { text: '10-minute setup', good: true },
        manual: { text: 'No setup needed', neutral: true },
    },
    {
        feature: 'Scalability',
        traditional: { text: 'Costs increase linearly', bad: true },
        vidyaverse: { text: '10,000+ institutions', good: true },
        manual: { text: 'Not scalable', bad: true },
    },
];

function CellIcon({ bad, good }: { bad?: boolean; good?: boolean; neutral?: boolean }) {
    if (good) return <Check size={16} className="text-emerald-400 flex-shrink-0" />;
    if (bad) return <X size={16} className="text-red-400/70 flex-shrink-0" />;
    return <Minus size={16} className="text-white/30 flex-shrink-0" />;
}

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, delay: i * 0.08 },
    }),
};

export default function ComparisonSection() {
    return (
        <section id="comparison" className="relative py-28 sm:py-36 grid-bg">
            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-4 block">
                        The Difference
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                        Why Vidyaverse Pro{' '}
                        <span className="gradient-text">Wins</span>
                    </h2>
                </motion.div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr>
                                <th className="text-left text-white/40 text-sm font-medium p-4 w-[140px]">Feature</th>
                                <th className="text-left text-white/50 text-sm font-medium p-4">Traditional ERPs</th>
                                <th className="text-left text-sm font-bold p-4 relative">
                                    <div className="comparison-highlight rounded-t-2xl px-4 py-2 -mx-4 -my-2">
                                        <span className="gradient-text font-extrabold">Vidyaverse Pro</span>
                                    </div>
                                </th>
                                <th className="text-left text-white/50 text-sm font-medium p-4">Manual Process</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <motion.tr
                                    key={i}
                                    custom={i}
                                    variants={rowVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="border-t border-white/5"
                                >
                                    <td className="p-4 text-white/60 text-sm font-medium">{row.feature}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-white/40">
                                            <CellIcon bad={row.traditional.bad} /> {row.traditional.text}
                                        </div>
                                    </td>
                                    <td className="p-4 relative">
                                        <div className="comparison-highlight px-4 py-1 -mx-4 -my-1 rounded-lg">
                                            <div className="flex items-center gap-2 text-sm text-white font-medium">
                                                <CellIcon good={row.vidyaverse.good} /> {row.vidyaverse.text}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-white/40">
                                            <CellIcon bad={row.manual.bad} neutral={row.manual.neutral} /> {row.manual.text}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
