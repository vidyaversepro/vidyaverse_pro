import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock, Headphones } from 'lucide-react';

const assurance = [
    { icon: Shield, text: 'Founding-cohort pricing' },
    { icon: Clock, text: '10-minute setup' },
    { icon: Headphones, text: 'Hands-on onboarding support' },
];

export default function CTASection() {
    return (
        <section className="py-24 cta-gradient-bg">
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-6">
                        Run Your Whole Institution on One Platform
                    </h2>
                    <p className="text-lg text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Vidyaverse launches in 2026. Join the founding cohort now and help shape the
                        operating system for modern Indian institutions.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <a href="/register" className="btn-white-landing text-lg px-10 py-4">
                            Join the Founding Cohort
                            <ArrowRight size={20} />
                        </a>
                        <a href="#modules" className="btn-outline-white text-lg px-10 py-4">
                            Explore the Platform
                        </a>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        {assurance.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                                <item.icon size={16} />
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
