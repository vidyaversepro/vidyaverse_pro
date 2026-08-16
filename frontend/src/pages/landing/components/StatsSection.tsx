import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

/* Reference-matching animated counter with easeOut. */
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

    return { ref, display: value.toLocaleString('en-IN') + suffix };
}

const stats = [
    { target: 47, suffix: '', label: 'Integrated modules', color: 'var(--brand)' },
    { target: 6, suffix: '', label: 'Connected categories', color: 'var(--peacock-teal)' },
    { target: 8, suffix: '', label: 'Printable documents', color: 'var(--lotus-pink)' },
    { target: 10, suffix: 'm', label: 'Minutes to set up', color: 'var(--deep-saffron)' },
];

function Stat({ stat }: { stat: typeof stats[0] }) {
    const counter = useCounter(stat.target, stat.suffix);
    return (
        <div ref={counter.ref} className="text-center">
            <div className="leading-none text-[clamp(40px,7vw,66px)]" style={{ fontFamily: 'var(--font-display)', color: stat.color }}>
                {counter.display}
            </div>
            <div className="text-sm font-semibold mt-1.5" style={{ color: 'var(--text2)' }}>
                {stat.label}
            </div>
        </div>
    );
}

export default function StatsSection() {
    return (
        <section className="px-[clamp(16px,4vw,28px)] py-[clamp(56px,8vw,96px)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6 }}
                className="max-w-[1000px] mx-auto grid gap-5 text-center"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}
            >
                {stats.map((stat) => (
                    <Stat key={stat.label} stat={stat} />
                ))}
            </motion.div>
        </section>
    );
}
