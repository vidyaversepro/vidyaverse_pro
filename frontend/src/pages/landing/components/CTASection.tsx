import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock, Headphones } from 'lucide-react';

const assurance = [
    { icon: Shield, text: 'No credit card required' },
    { icon: Clock, text: '10-minute setup' },
    { icon: Headphones, text: 'Dedicated onboarding support' },
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
                        Ready to Simplify Your Institution?
                    </h2>
                    <p className="text-lg text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join 1,000+ institutions already saving hundreds of hours every month
                        with Vidyaverse Pro.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <a href="/register" className="btn-white-landing text-lg px-10 py-4">
                            Start Free Trial
                            <ArrowRight size={20} />
                        </a>
                        <a href="#services" className="btn-outline-white text-lg px-10 py-4">
                            Explore Features
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
