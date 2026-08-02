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
        feature: 'Scope',
        traditional: { text: '3-5 separate vendors', bad: true },
        vidyaverse: { text: '47 modules, 1 platform', good: true },
        manual: { text: 'Disconnected workflows', bad: true },
    },
    {
        feature: 'Parent Reach',
        traditional: { text: 'Email/SMS (rarely opened)', bad: true },
        vidyaverse: { text: 'Native WhatsApp + AI replies', good: true },
        manual: { text: 'Diary notes & calls', bad: true },
    },
    {
        feature: 'Identity',
        traditional: { text: 'A login per tool', bad: true },
        vidyaverse: { text: 'One SSO across the stack', good: true },
        manual: { text: 'No digital identity', bad: true },
    },
    {
        feature: 'Scalability',
        traditional: { text: 'Costs increase linearly', bad: true },
        vidyaverse: { text: 'Multi-tenant, 10,000+ ready', good: true },
        manual: { text: 'Not scalable', bad: true },
    },
];

function CellIcon({ bad, good }: { bad?: boolean; good?: boolean; neutral?: boolean }) {
    if (good) return <Check size={16} className="flex-shrink-0" style={{ color: 'var(--gold)' }} />;
    if (bad) return <X size={16} className="text-white/25 flex-shrink-0" />;
    return <Minus size={16} className="text-white/25 flex-shrink-0" />;
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
        <section id="comparison" className="indic-section--deep relative py-28 sm:py-36">
            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="indic-eyebrow mb-4">The Difference</span>
                    <h2 className="text-3xl sm:text-5xl mt-4">
                        Why Vidyaverse Pro <span className="gradient-text-indic">Wins</span>
                    </h2>
                </motion.div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr>
                                <th className="text-left text-white/40 text-sm font-medium p-4 w-[140px]">Feature</th>
                                <th className="text-left text-white/50 text-sm font-medium p-4">Traditional ERPs</th>
                                <th className="text-left text-sm font-bold p-4 relative">
                                    <div
                                        className="rounded-t-2xl px-4 py-2 -mx-4 -my-2"
                                        style={{ background: 'rgb(var(--gold-rgb) / 0.12)', borderBottom: '2px solid var(--gold)' }}
                                    >
                                        <span className="gradient-text-indic font-extrabold">Vidyaverse Pro</span>
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
                                        <div className="px-4 py-1 -mx-4 -my-1 rounded-lg" style={{ background: 'rgb(var(--gold-rgb) / 0.08)' }}>
                                            <div className="flex items-center gap-2 text-sm text-white font-medium">
                                                <CellIcon good={row.vidyaverse.good} /> {row.vidyaverse.text}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-white/40">
                                            <CellIcon bad={row.manual.bad} /> {row.manual.text}
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
