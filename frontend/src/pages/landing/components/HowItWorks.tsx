import { motion } from 'framer-motion';

const steps = [
    {
        number: 1,
        title: 'Set up your institution',
        desc: 'Add classes, sections and students — or bulk-import from a spreadsheet. Branding applied everywhere automatically.',
        gradient: 'linear-gradient(135deg, var(--brand), var(--brand-2))',
        shadow: 'rgb(var(--brand-rgb) / 0.3)',
    },
    {
        number: 2,
        title: 'Toggle the modules you need',
        desc: 'Start with attendance and fees, add transport or hostel later. Every module shares one database, so nothing is re-entered.',
        gradient: 'linear-gradient(135deg, var(--peacock-teal), var(--teal-light))',
        shadow: 'rgb(var(--peacock-teal-rgb) / 0.3)',
    },
    {
        number: 3,
        title: 'Go live with parents',
        desc: 'Connect WhatsApp and updates start flowing. Generate ID cards, marksheets and certificates on demand.',
        gradient: 'linear-gradient(135deg, var(--deep-saffron), var(--gold))',
        shadow: 'rgb(var(--deep-saffron-rgb) / 0.3)',
    },
];

export default function HowItWorks() {
    return (
        <section id="how" className="px-[clamp(16px,4vw,28px)] py-[clamp(64px,9vw,110px)]" style={{ background: 'var(--surface)' }}>
            <div className="max-w-[1080px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-[660px] mx-auto mb-14"
                >
                    <span className="text-xs font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--brand)' }}>
                        How it works
                    </span>
                    <h2
                        className="my-3.5 leading-[1.1] text-[clamp(30px,5.2vw,52px)]"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                    >
                        From sign-up to running campus in a day
                    </h2>
                </motion.div>

                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 26 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.7, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center p-8 rounded-[22px]"
                            style={{ background: 'var(--elevated)', border: '1px solid var(--border-soft)' }}
                        >
                            <div
                                className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center text-white text-[26px]"
                                style={{ fontFamily: 'var(--font-display)', background: step.gradient, boxShadow: `0 10px 26px ${step.shadow}` }}
                            >
                                {step.number}
                            </div>
                            <h3 className="text-xl font-extrabold mb-2.5" style={{ color: 'var(--text)' }}>
                                {step.title}
                            </h3>
                            <p className="text-[14.5px] leading-[1.6]" style={{ color: 'var(--text2)' }}>
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
