import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, Award, Camera, Briefcase,
    Ticket, BarChart3, BookOpen, FileText,
} from 'lucide-react';

const motifs = [
    'indic-motif-sriyantra', 'indic-motif-lotus', 'indic-motif-peacock', 'indic-motif-kolam',
    'indic-motif-meenakari', 'indic-motif-ashoka', 'indic-motif-lotus', 'indic-motif-sriyantra',
];

const services = [
    {
        icon: CreditCard,
        title: 'Smart ID Cards',
        desc: 'Professional ID cards with AI-enhanced photos, QR codes, and batch printing.',
        benefit: 'Generate 500 cards in minutes',
        highlight: 'Most Popular',
    },
    {
        icon: Award,
        title: 'Digital Certificates',
        desc: 'Beautiful certificates for awards, achievements, and academic milestones.',
        benefit: 'Professional awards in 3 clicks',
    },
    {
        icon: Camera,
        title: 'Group Photos',
        desc: 'Upload one group photo and let AI extract individual student faces automatically.',
        benefit: 'Auto-extract faces with AI',
        highlight: 'AI Powered',
    },
    {
        icon: Briefcase,
        title: 'Student Portfolios',
        desc: 'Showcase student achievements with beautiful, shareable portfolio pages.',
        benefit: 'Shareable achievement pages',
    },
    {
        icon: Ticket,
        title: 'Hall Tickets',
        desc: 'Exam passes with seat allocation, schedules, and automated distribution.',
        benefit: 'Exam passes with seat allocation',
    },
    {
        icon: BarChart3,
        title: 'Smart Marksheets',
        desc: 'Auto-calculate grades, ranks, and percentiles with custom grading scales.',
        benefit: 'Auto-calculate grades & ranks',
        highlight: 'Smart Testing',
    },
    {
        icon: BookOpen,
        title: 'Library Cards',
        desc: 'QR-enabled library cards with borrowing management and auto-expiry.',
        benefit: 'QR-enabled borrowing system',
    },
    {
        icon: FileText,
        title: 'Transfer Certificates',
        desc: 'Secure, tamper-proof transfer records with digital verification.',
        benefit: 'Secure, tamper-proof records',
    },
];

function ServiceCard({ service, motif, index }: { service: typeof services[0]; motif: string; index: number }) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
        card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-8px) scale(1.02)`;
    }, []);

    const handleMouseLeave = useCallback(() => {
        const card = cardRef.current;
        if (card) card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px) scale(1)';
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.07 }}
        >
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="indic-tile p-7 h-full cursor-default group"
                style={{ willChange: 'transform', transition: 'transform 0.3s ease-out, box-shadow 0.3s ease, border-color 0.3s ease' }}
            >
                <span className={`indic-tile__motif ${motif}`} />
                <div className="relative z-10">
                    {service.highlight && (
                        <span className="indic-caps inline-block px-3 py-1 rounded-full mb-4" style={{ background: 'var(--accent-soft)' }}>
                            {service.highlight}
                        </span>
                    )}

                    <div className="indic-icon-plinth w-14 h-14 mb-5">
                        <service.icon size={28} className="relative z-10" />
                    </div>

                    <h3 className="text-lg mb-2">{service.title}</h3>

                    <p className="text-sm leading-relaxed mb-4 indic-muted">{service.desc}</p>

                    <div className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--accent-strong)' }}>
                        <span>→</span> {service.benefit}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function ServicesSection() {
    return (
        <section id="services" className="indic-section--warm py-20">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="indic-eyebrow mb-4">Inside the Platform · Document Studio</span>
                    <h2 className="text-3xl sm:text-5xl mt-4 mb-4">
                        One pillar of many: the Document Studio.
                    </h2>
                    <p className="text-lg max-w-3xl mx-auto indic-muted">
                        Beyond academics, fees, and communication, Vidyaverse generates every official
                        document an institution issues — each pulling from the same single student record.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, i) => (
                        <ServiceCard key={i} service={service} motif={motifs[i]} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
