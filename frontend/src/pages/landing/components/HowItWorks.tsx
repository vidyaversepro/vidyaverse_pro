import { motion } from 'framer-motion';
import { Upload, Palette, Sparkles, Download } from 'lucide-react';

const steps = [
    { icon: Upload, label: 'Upload Data', desc: 'CSV or manual import' },
    { icon: Palette, label: 'Choose Template', desc: '50+ premium designs' },
    { icon: Sparkles, label: 'AI Magic', desc: 'Photos enhanced instantly' },
    { icon: Download, label: 'Download & Share', desc: 'Print or email to parents' },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="indic-section--warm py-20">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="indic-eyebrow mb-4">Quick Start</span>
                    <h2 className="text-3xl sm:text-5xl mt-4 mb-4">
                        From Data to Documents. In 4 Steps.
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto indic-muted">
                        No training needed. Upload, pick a template, and let AI handle the rest.
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Connecting line — desktop only */}
                    <hr className="indic-rule hidden md:block absolute top-8 left-16 right-16" />

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
                                {/* Gradient icon */}
                                <span className="indic-icon-plinth w-16 h-16 mx-auto mb-4">
                                    <step.icon size={28} className="relative z-10" />
                                </span>

                                <h3 className="text-lg mb-1">{step.label}</h3>
                                <p className="text-sm indic-muted">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
