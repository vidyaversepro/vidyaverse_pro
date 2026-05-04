import { motion } from 'framer-motion';
import { Upload, Palette, Sparkles, Download } from 'lucide-react';

const steps = [
    { icon: Upload, label: 'Upload Data', desc: 'CSV or manual import', color: 'from-red-500 to-orange-500' },
    { icon: Palette, label: 'Choose Template', desc: '50+ premium designs', color: 'from-blue-500 to-cyan-500' },
    { icon: Sparkles, label: 'AI Magic', desc: 'Photos enhanced instantly', color: 'from-purple-500 to-indigo-600' },
    { icon: Download, label: 'Download & Share', desc: 'Print or email to parents', color: 'from-green-500 to-emerald-500' },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="section-padding">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="section-overline">Quick Start</p>
                    <h2
                        className="text-3xl sm:text-5xl font-bold tracking-tight mb-4"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        From Data to Documents.{' '}
                        <span className="gradient-text">In 4 Steps.</span>
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        No training needed. Upload, pick a template, and let AI handle the rest.
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Connecting line — desktop only */}
                    <div
                        className="hidden md:block absolute top-12 left-16 right-16 h-0.5"
                        style={{
                            background: 'linear-gradient(90deg, var(--primary), var(--accent-purple), var(--accent-blue), var(--accent-emerald))',
                            opacity: 0.2,
                        }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.5, delay: i * 0.12 }}
                                className="text-center"
                            >
                                {/* Step number */}
                                <div className="timeline-step-number mx-auto mb-4">
                                    {i + 1}
                                </div>

                                {/* Gradient icon */}
                                <div className={`icon-gradient mx-auto mb-4 bg-gradient-to-br ${step.color}`}>
                                    <step.icon size={28} className="relative z-10 text-white" />
                                </div>

                                <h3
                                    className="text-lg font-bold mb-1"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {step.label}
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
