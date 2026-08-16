import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const oldWay = [
    'ID cards from one vendor',
    'Certificates from another',
    'Marksheets in spreadsheets',
    'Hall tickets manually printed',
    'Hours of repetitive work',
    'Stressed staff, unhappy parents',
];

const newWay = [
    'One platform for everything',
    'Instant generation in 3 clicks',
    'AI handles photo enhancement',
    'Auto-email to parents & students',
    'Tasks done in minutes, not hours',
    'Happy staff, delighted parents',
];

const fadeUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function ComparisonSection() {
    return (
        <section
            id="compare"
            className="relative overflow-hidden px-[clamp(16px,4vw,28px)] py-[clamp(64px,9vw,110px)]"
            style={{ background: '#0A0F1E' }}
        >
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(135deg, rgb(var(--kumkum-rgb) / 0.1), rgb(var(--lotus-deep-rgb) / 0.08) 50%, rgb(var(--peacock-teal-rgb) / 0.1)),' +
                        'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),' +
                        'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '100% 100%, 42px 42px, 42px 42px',
                }}
            />
            <div className="relative max-w-[1000px] mx-auto">
                <motion.div {...fadeUp} className="text-center max-w-[660px] mx-auto mb-13">
                    <span
                        className="inline-block text-xs font-bold tracking-[0.16em] uppercase px-3 py-1 rounded-full"
                        style={{ color: 'var(--gold)', background: 'rgb(var(--gold-rgb) / 0.14)', border: '1px solid rgb(var(--gold-rgb) / 0.34)' }}
                    >
                        Why Vidyaverse
                    </span>
                    <h2 className="my-3.5 leading-[1.1] text-[clamp(30px,5.2vw,52px)]" style={{ fontFamily: 'var(--font-display)', color: '#FFF8F0' }}>
                        One platform beats a drawer of vendors
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* The old way */}
                    <motion.div
                        {...fadeUp}
                        className="p-8 rounded-[22px]"
                        style={{ background: 'rgb(255 255 255 / 0.03)', border: '1px solid rgb(255 255 255 / 0.1)' }}
                    >
                        <h3 className="text-lg font-extrabold mb-5" style={{ color: 'rgb(255 248 240 / 0.75)' }}>
                            The old way
                        </h3>
                        <ul className="flex flex-col gap-3.5">
                            {oldWay.map((text, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-[14.5px] leading-relaxed" style={{ color: 'rgb(255 248 240 / 0.6)' }}>
                                    <X size={17} className="shrink-0 mt-0.5" style={{ color: '#8a5a55' }} />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* The Vidyaverse way */}
                    <motion.div
                        {...fadeUp}
                        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="relative p-8 rounded-[22px]"
                        style={{
                            background: 'linear-gradient(160deg, rgb(var(--kumkum-rgb) / 0.18), rgb(var(--lotus-deep-rgb) / 0.14))',
                            border: '1px solid rgb(var(--gold-rgb) / 0.3)',
                            boxShadow: '0 24px 60px rgb(0 0 0 / 0.4)',
                        }}
                    >
                        <span
                            className="absolute -top-3 right-[22px] px-3.5 py-1 rounded-full text-[11px] font-extrabold tracking-[0.05em] uppercase"
                            style={{ color: 'var(--night-ink)', background: 'linear-gradient(135deg, var(--gold), var(--deep-saffron))' }}
                        >
                            Vidyaverse
                        </span>
                        <h3 className="text-lg font-extrabold mb-5" style={{ color: '#FFF8F0' }}>
                            The Vidyaverse way
                        </h3>
                        <ul className="flex flex-col gap-3.5">
                            {newWay.map((text, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-[14.5px] leading-relaxed" style={{ color: '#FFF8F0' }}>
                                    <Check size={17} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
