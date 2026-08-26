import { motion } from 'framer-motion';
import {
    GraduationCap, Wrench, Wallet, MessageSquare, FileText, Sparkles,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import CardMandala from './CardMandala';

/**
 * "The Module Universe" — the repositioning centerpiece. Vidyaverse is a
 * 47-module institutional OS, grouped into the six real categories from
 * backend/src/config/module-registry.ts. Each category card carries its own
 * pigment from the indic palette (set as --mc, which drives the hover border
 * in landing.css).
 */

const categories = [
    {
        icon: GraduationCap,
        name: 'Academics',
        color: 'var(--ink-peacock)',
        rgbVar: '--peacock-teal-rgb',
        chipAlpha: 0.06,
        modules: ['Student Info', 'Classes & Sections', 'Attendance', 'Timetable', 'Examinations', 'Gradebook (CCE)', 'Online Tests', 'Assignments', 'AI Tutor', 'Live Classes'],
    },
    {
        icon: Wrench,
        name: 'Operations',
        color: 'var(--ink-indigo)',
        rgbVar: '--indigo-rgb',
        chipAlpha: 0.06,
        modules: ['Transport + GPS', 'Hostel & Mess', 'Inventory', 'Health & Clinic', 'Visitor & Gate Pass', 'Library'],
    },
    {
        icon: Wallet,
        name: 'Finance',
        color: 'var(--ink-clay)',
        rgbVar: '--deep-saffron-rgb',
        chipAlpha: 0.09,
        modules: ['Fees & Invoicing', 'Concessions & Plans', 'Online Payments', 'HR & Payroll', 'Accounting'],
    },
    {
        icon: MessageSquare,
        name: 'Communication',
        color: 'var(--ink-teal)',
        rgbVar: '--teal-rgb',
        chipAlpha: 0.07,
        modules: ['WhatsApp Messaging', 'AI Inbound Replies', 'Voice Notes', 'Notices & Events', 'Guardian Digests'],
    },
    {
        icon: FileText,
        name: 'Document Studio',
        color: 'var(--ink-lotus)',
        rgbVar: '--lotus-pink-rgb',
        chipAlpha: 0.07,
        modules: ['ID Cards', 'Certificates', 'Marksheets', 'Hall Tickets', 'Transfer Certs', 'Portfolios', 'Library Cards', 'Group Photos'],
    },
    {
        icon: Sparkles,
        name: 'Intelligence',
        color: 'var(--brand)',
        rgbVar: '--brand-rgb',
        chipAlpha: 0.07,
        modules: ['Admissions CRM', 'Reports & BI', 'Analytics', 'Approvals', 'Alumni', 'Placement'],
    },
];

export default function ModuleUniverse() {
    return (
        <section
            id="modules"
            className="px-[clamp(16px,4vw,28px)] py-[clamp(64px,9vw,110px)]"
            style={{ background: 'var(--surface)' }}
        >
            <div className="max-w-[1200px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-[720px] mx-auto mb-14"
                >
                    <span className="text-xs font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--brand)' }}>
                        One platform
                    </span>
                    <h2
                        className="my-3.5 leading-[1.08] text-[clamp(30px,5.2vw,54px)]"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                    >
                        47 modules. One login. Zero silos.
                    </h2>
                    <p className="leading-[1.6] text-[clamp(15px,2vw,19px)] [text-wrap:pretty]" style={{ color: 'var(--text2)' }}>
                        Everything an institution runs on — academics, operations, finance, parent
                        communication, documents, and intelligence — in a single connected system.
                        Toggle on only what you need.
                    </p>
                </motion.div>

                <div className="grid gap-[22px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 26 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.7, delay: (i % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
                            className="lg-module-card relative overflow-hidden p-7 rounded-[22px]"
                            style={{
                                '--mc': `var(${cat.rgbVar})`,
                                background: 'var(--elevated)',
                                border: '1px solid var(--border-soft)',
                                boxShadow: '0 2px 18px rgb(var(--night-ink-rgb) / 0.05)',
                            } as CSSProperties}
                        >
                            <CardMandala color={cat.color} />
                            <span
                                className="w-14 h-14 rounded-[15px] flex items-center justify-center mb-[18px]"
                                style={{ background: `rgb(var(${cat.rgbVar}) / 0.12)`, color: cat.color }}
                            >
                                <cat.icon size={26} strokeWidth={1.7} />
                            </span>
                            <div className="flex items-baseline justify-between mb-3.5">
                                <h3 className="text-[21px] font-extrabold m-0" style={{ color: 'var(--text)' }}>
                                    {cat.name}
                                </h3>
                                <span className="text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: 'var(--text3)' }}>
                                    {cat.modules.length} modules
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {cat.modules.map((m) => (
                                    <span
                                        key={m}
                                        className="text-[12.5px] font-semibold px-[11px] py-[5px] rounded-[9px]"
                                        style={{
                                            color: 'var(--text2)',
                                            background: `rgb(var(${cat.rgbVar}) / ${cat.chipAlpha})`,
                                            border: '1px solid var(--border-soft)',
                                        }}
                                    >
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center text-sm mt-[34px]"
                    style={{ color: 'var(--text2)' }}
                >
                    Per-institution module toggles &amp; tiered plans — enable what fits your campus, scale when you grow.
                </motion.p>
            </div>
        </section>
    );
}
