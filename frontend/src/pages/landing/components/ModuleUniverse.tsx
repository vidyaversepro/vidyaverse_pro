import { motion } from 'framer-motion';
import {
    GraduationCap, Wrench, Wallet, MessageSquare, FileText, BrainCircuit,
} from 'lucide-react';

/**
 * "The Module Universe" — the repositioning centerpiece. Vidyaverse is no longer a
 * document-generation tool; it's a 47-module institutional OS. Modules are grouped
 * into the six real categories from backend/src/config/module-registry.ts and shown
 * as a glass category grid with module chips. Capability framing (no fake counts).
 */

const categories = [
    {
        icon: GraduationCap,
        name: 'Academics',
        color: 'from-red-500 to-orange-500',
        glow: 'shadow-red-500/25',
        modules: ['Student Info', 'Classes & Sections', 'Attendance', 'Timetable', 'Examinations', 'Gradebook (CCE)', 'Online Assessments', 'Assignments', 'AI Tutor', 'Live Classes'],
    },
    {
        icon: Wrench,
        name: 'Operations',
        color: 'from-blue-500 to-cyan-500',
        glow: 'shadow-blue-500/25',
        modules: ['Transport + GPS', 'Hostel & Mess', 'Inventory', 'Health & Clinic', 'Visitor & Gate Pass', 'Library'],
    },
    {
        icon: Wallet,
        name: 'Finance',
        color: 'from-emerald-500 to-green-500',
        glow: 'shadow-emerald-500/25',
        modules: ['Fees & Invoicing', 'Concessions & Plans', 'Online Payments', 'HR & Payroll', 'Accounting & Ledgers'],
    },
    {
        icon: MessageSquare,
        name: 'Communication',
        color: 'from-purple-500 to-indigo-600',
        glow: 'shadow-purple-500/25',
        modules: ['WhatsApp Messaging', 'AI Inbound Replies', 'Voice Notes', 'Notices & Events', 'Guardian Digests'],
    },
    {
        icon: FileText,
        name: 'Document Studio',
        color: 'from-amber-500 to-orange-600',
        glow: 'shadow-amber-500/25',
        modules: ['ID Cards', 'Certificates', 'Marksheets', 'Hall Tickets', 'Transfer Certs', 'Portfolios', 'Library Cards', 'Group Photos'],
    },
    {
        icon: BrainCircuit,
        name: 'Intelligence',
        color: 'from-pink-500 to-rose-500',
        glow: 'shadow-pink-500/25',
        modules: ['Admissions CRM', 'Reports & BI', 'Analytics', 'Approvals', 'Alumni', 'Placement'],
    },
];

export default function ModuleUniverse() {
    return (
        <section id="modules" className="section-padding section-surface">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="section-overline">One Platform</p>
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                        <span className="gradient-text-red">47 Modules.</span>{' '}
                        <span className="gradient-text-educational">One Login. Zero Silos.</span>
                    </h2>
                    <p className="text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Everything an institution runs on — academics, operations, finance, parent
                        communication, documents, and analytics — in a single connected system.
                        Toggle on only what you need; the rest waits in one tap.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.5, delay: i * 0.07 }}
                        >
                            <div className="feature-card p-7 h-full group">
                                <div className="relative z-10">
                                    <div className={`icon-gradient mb-5 shadow-lg ${cat.glow} bg-gradient-to-br ${cat.color}`}>
                                        <cat.icon size={26} className="relative z-10 text-white" />
                                    </div>
                                    <div className="flex items-baseline justify-between mb-4">
                                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {cat.name}
                                        </h3>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-tertiary)' }}>
                                            {cat.modules.length} modules
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.modules.map((m) => (
                                            <span
                                                key={m}
                                                className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-300 group-hover:scale-[1.02]"
                                                style={{
                                                    background: 'var(--bg-surface)',
                                                    color: 'var(--text-secondary)',
                                                    border: '1px solid var(--border-light)',
                                                }}
                                            >
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center text-sm mt-10"
                    style={{ color: 'var(--text-tertiary)' }}
                >
                    Per-institution module toggles &amp; tiered plans — enable what fits your campus, scale when you grow.
                </motion.p>
            </div>
        </section>
    );
}
