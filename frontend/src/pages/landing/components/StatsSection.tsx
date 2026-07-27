import { motion } from 'framer-motion';
import { Quote, Star, Users, School, FileCheck, Award } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

/* DigiClassroom-style animated counter with easeOut */
function useCounter(target: number, suffix = '', duration = 2000) {
    const [value, setValue] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const done = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !done.current) {
                    done.current = true;
                    let step = 0;
                    const steps = 60;
                    const interval = setInterval(() => {
                        step++;
                        const progress = step / steps;
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        setValue(Math.floor(target * easeOut));
                        if (step >= steps) {
                            clearInterval(interval);
                            setValue(target);
                        }
                    }, duration / steps);
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return { ref, display: value.toLocaleString() + suffix };
}

const stats = [
    { icon: Users, label: 'Integrated Modules', target: 47, suffix: '' },
    { icon: School, label: 'Module Categories', target: 6, suffix: '' },
    { icon: FileCheck, label: 'Document Types', target: 8, suffix: '' },
    { icon: Award, label: 'Multi-Tenant Ready', target: 100, suffix: '%' },
];

// Pre-launch: design-partner personas, not fabricated named customers (honest
// founding-cohort framing — value props voiced through roles, no invented people).
const testimonials = [
    {
        name: 'School Principal',
        role: 'Founding-cohort persona',
        quote: 'What we need is one system instead of five vendors — fees, attendance, transport, and parent messaging that all share the same student record. That is exactly what Vidyaverse is built to be.',
        stars: 5,
    },
    {
        name: 'Admin Officer',
        role: 'Founding-cohort persona',
        quote: 'The promise that matters most: reach every parent on WhatsApp automatically — attendance, results, fee links — without anyone copy-pasting numbers.',
        stars: 5,
    },
    {
        name: 'Vice Principal',
        role: 'Founding-cohort persona',
        quote: 'One login across the campus stack, with documents and marksheets generated from the same data — that removes the busywork our staff drown in.',
        stars: 5,
    },
];

function StatCard({ stat }: { stat: typeof stats[0] }) {
    const counter = useCounter(stat.target, stat.suffix);
    return (
        <div ref={counter.ref} className="glass-stat-card">
            <stat.icon size={36} className="mx-auto mb-3 text-white" />
            <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                {counter.display}
            </div>
            <div className="text-sm text-white/80 font-medium">{stat.label}</div>
        </div>
    );
}

export default function StatsSection() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            {/* Stats — gradient bg with glass counter cards (DigiClassroom pattern) */}
            <section
                id="testimonials"
                className="py-20"
                style={{ background: 'linear-gradient(135deg, #E63946 0%, #8B5CF6 50%, #2563EB 100%)' }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                            Built to Run Everything
                        </h2>
                        <p className="text-lg text-white/80 max-w-3xl mx-auto">
                            One connected platform — not a pile of disconnected tools
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.85 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            >
                                <StatCard stat={stat} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials (DigiClassroom carousel pattern) */}
            <section className="section-padding">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <p className="section-overline">Built With Educators</p>
                        <h2
                            className="text-3xl sm:text-5xl font-bold tracking-tight"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Designed with our{' '}
                            <span className="gradient-text-educational">founding cohort</span>
                        </h2>
                        <p className="text-sm mt-3" style={{ color: 'var(--text-tertiary)' }}>
                            Illustrative voices from design-partner interviews · launching 2026
                        </p>
                    </motion.div>

                    <div className="relative">
                        <div className="testimonial-card p-8 md:p-12 text-center">
                            <div className="flex justify-center mb-6">
                                {[...Array(testimonials[current].stars)].map((_, i) => (
                                    <Star key={i} size={22} className="text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>

                            <Quote
                                size={36}
                                className="mx-auto mb-4 opacity-15"
                                style={{ color: 'var(--primary)' }}
                            />

                            <blockquote
                                className="text-lg sm:text-xl italic leading-relaxed mb-8 max-w-3xl mx-auto"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                "{testimonials[current].quote}"
                            </blockquote>

                            <div className="flex items-center justify-center gap-4">
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))' }}
                                >
                                    {testimonials[current].name[0]}
                                </div>
                                <div className="text-left">
                                    <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {testimonials[current].name}
                                    </div>
                                    <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                        {testimonials[current].role}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-2 mt-8">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className="w-3 h-3 rounded-full transition-all duration-300"
                                    style={{
                                        background: i === current ? 'var(--primary)' : 'var(--border)',
                                        transform: i === current ? 'scale(1.3)' : 'scale(1)',
                                    }}
                                    aria-label={`Testimonial ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
