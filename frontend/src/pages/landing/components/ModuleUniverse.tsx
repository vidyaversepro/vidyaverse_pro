import { motion } from 'framer-motion';
import {
    GraduationCap, Wrench, Wallet, MessageSquare, FileText, BrainCircuit,
} from 'lucide-react';

/**
 * "The Module Universe" — the repositioning centerpiece. Vidyaverse is no longer a
 * document-generation tool; it's a 47-module institutional OS. Modules are grouped
 * into the six real categories from backend/src/config/module-registry.ts and shown
 * as Indic tiles with a distinct mandala motif per category — six categories, six
 * motifs, no two cards sharing a watermark. Capability framing (no fake counts).
 */

const categories = [
    {
        icon: GraduationCap,
        name: 'Academics',
        motif: 'indic-motif-lotus',
        modules: ['Student Info', 'Classes & Sections', 'Attendance', 'Timetable', 'Examinations', 'Gradebook (CCE)', 'Online Assessments', 'Assignments', 'AI Tutor', 'Live Classes'],
    },
    {
        icon: Wrench,
        name: 'Operations',
        motif: 'indic-motif-kolam',
        modules: ['Transport + GPS', 'Hostel & Mess', 'Inventory', 'Health & Clinic', 'Visitor & Gate Pass', 'Library'],
    },
    {
        icon: Wallet,
        name: 'Finance',
        motif: 'indic-motif-meenakari',
        modules: ['Fees & Invoicing', 'Concessions & Plans', 'Online Payments', 'HR & Payroll', 'Accounting & Ledgers'],
    },
    {
        icon: MessageSquare,
        name: 'Communication',
        motif: 'indic-motif-peacock',
        modules: ['WhatsApp Messaging', 'AI Inbound Replies', 'Voice Notes', 'Notices & Events', 'Guardian Digests'],
    },
    {
        icon: FileText,
        name: 'Document Studio',
        motif: 'indic-motif-sriyantra',
        modules: ['ID Cards', 'Certificates', 'Marksheets', 'Hall Tickets', 'Transfer Certs', 'Portfolios', 'Library Cards', 'Group Photos'],
    },
    {
        icon: BrainCircuit,
        name: 'Intelligence',
        motif: 'indic-motif-ashoka',
        modules: ['Admissions CRM', 'Reports & BI', 'Analytics', 'Approvals', 'Alumni', 'Placement'],
    },
];

export default function ModuleUniverse() {
    return (
        <section id="modules" className="indic-section--warm py-20">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="indic-eyebrow mb-4">One Platform</span>
                    <h2 className="text-3xl sm:text-5xl mt-4 mb-4">
                        47 Modules. One Login. Zero Silos.
                    </h2>
                    <p className="text-lg max-w-3xl mx-auto indic-muted">
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
                            className="indic-tile p-7 h-full group"
                        >
                            <span className={`indic-tile__motif ${cat.motif}`} />
                            <div className="relative z-10">
                                <div className="indic-icon-plinth w-14 h-14 mb-5">
                                    <cat.icon size={26} className="relative z-10" />
                                </div>
                                <div className="flex items-baseline justify-between mb-4">
                                    <h3 className="text-xl">{cat.name}</h3>
                                    <span className="indic-caps">{cat.modules.length} modules</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cat.modules.map((m) => (
                                        <span
                                            key={m}
                                            className="text-xs font-medium px-2.5 py-1 rounded-lg indic-muted transition-all duration-300 group-hover:scale-[1.02]"
                                            style={{
                                                background: 'rgb(var(--accent-primary-rgb) / 0.06)',
                                                border: '1px solid rgb(var(--temple-stone-rgb) / 0.18)',
                                            }}
                                        >
                                            {m}
                                        </span>
                                    ))}
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
                    className="text-center text-sm mt-10 indic-muted"
                >
                    Per-institution module toggles &amp; tiered plans — enable what fits your campus, scale when you grow.
                </motion.p>
            </div>
        </section>
    );
}
