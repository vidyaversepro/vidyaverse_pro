import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, Award, Camera, Briefcase,
    Ticket, BarChart3, BookOpen, FileText,
} from 'lucide-react';

const services = [
    {
        icon: CreditCard,
        title: 'Smart ID Cards',
        desc: 'Professional ID cards with AI-enhanced photos, QR codes, and batch printing.',
        benefit: 'Generate 500 cards in minutes',
        color: 'from-red-500 to-orange-500',
        glowColor: 'shadow-red-500/25',
        highlight: 'Most Popular',
    },
    {
        icon: Award,
        title: 'Digital Certificates',
        desc: 'Beautiful certificates for awards, achievements, and academic milestones.',
        benefit: 'Professional awards in 3 clicks',
        color: 'from-purple-500 to-indigo-600',
        glowColor: 'shadow-purple-500/25',
    },
    {
        icon: Camera,
        title: 'Group Photos',
        desc: 'Upload one group photo and let AI extract individual student faces automatically.',
        benefit: 'Auto-extract faces with AI',
        color: 'from-blue-500 to-cyan-500',
        glowColor: 'shadow-blue-500/25',
        highlight: 'AI Powered',
    },
    {
        icon: Briefcase,
        title: 'Student Portfolios',
        desc: 'Showcase student achievements with beautiful, shareable portfolio pages.',
        benefit: 'Shareable achievement pages',
        color: 'from-green-500 to-emerald-500',
        glowColor: 'shadow-green-500/25',
    },
    {
        icon: Ticket,
        title: 'Hall Tickets',
        desc: 'Exam passes with seat allocation, schedules, and automated distribution.',
        benefit: 'Exam passes with seat allocation',
        color: 'from-orange-500 to-amber-500',
        glowColor: 'shadow-orange-500/25',
    },
    {
        icon: BarChart3,
        title: 'Smart Marksheets',
        desc: 'Auto-calculate grades, ranks, and percentiles with custom grading scales.',
        benefit: 'Auto-calculate grades & ranks',
        color: 'from-teal-500 to-blue-500',
        glowColor: 'shadow-teal-500/25',
        highlight: 'Smart Testing',
    },
    {
        icon: BookOpen,
        title: 'Library Cards',
        desc: 'QR-enabled library cards with borrowing management and auto-expiry.',
        benefit: 'QR-enabled borrowing system',
        color: 'from-pink-500 to-rose-500',
        glowColor: 'shadow-pink-500/25',
    },
    {
        icon: FileText,
        title: 'Transfer Certificates',
        desc: 'Secure, tamper-proof transfer records with digital verification.',
        benefit: 'Secure, tamper-proof records',
        color: 'from-indigo-500 to-violet-500',
        glowColor: 'shadow-indigo-500/25',
    },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
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
                className="feature-card p-7 h-full cursor-default group"
                style={{
                    willChange: 'transform',
                    transition: 'transform 0.3s ease-out, box-shadow 0.3s ease, border-color 0.3s ease',
                }}
            >
                <div className="relative z-10">
                    {/* Highlight badge (DigiClassroom pattern) */}
                    {service.highlight && (
                        <span
                            className={`inline-block px-3 py-1 text-[11px] font-semibold rounded-full text-white mb-4 bg-gradient-to-r ${service.color}`}
                        >
                            {service.highlight}
                        </span>
                    )}

                    {/* Gradient Icon Container with glow shadow (DigiClassroom pattern) */}
                    <div
                        className={`icon-gradient mb-5 shadow-lg ${service.glowColor} bg-gradient-to-br ${service.color}`}
                    >
                        <service.icon size={28} className="relative z-10 text-white" />
                    </div>

                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {service.title}
                    </h3>

                    <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {service.desc}
                    </p>

                    <div
                        className="text-xs font-semibold flex items-center gap-1.5"
                        style={{ color: 'var(--primary)' }}
                    >
                        <span>→</span> {service.benefit}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function ServicesSection() {
    return (
        <section id="services" className="section-padding section-surface">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="section-overline">Inside the Platform · Document Studio</p>
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                        One pillar of many:{' '}
                        <span className="gradient-text-educational">the Document Studio.</span>
                    </h2>
                    <p className="text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Beyond academics, fees, and communication, Vidyaverse generates every official
                        document an institution issues — each pulling from the same single student record.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, i) => (
                        <ServiceCard key={i} service={service} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
