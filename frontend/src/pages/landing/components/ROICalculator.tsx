import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const fmt = (n: number) => n.toLocaleString('en-IN');

export default function ROICalculator() {
    const [students, setStudents] = useState(1200);

    const { roiHours, roiMsgs, roiDocs } = useMemo(
        () => ({
            roiHours: Math.round(students * 0.6),
            roiMsgs: students * 14,
            roiDocs: students * 9,
        }),
        [students]
    );

    return (
        <section id="roi" className="px-[clamp(16px,4vw,28px)] py-[clamp(40px,6vw,72px)]" style={{ background: 'var(--bg)' }}>
            <div className="max-w-[860px] mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-[640px] mx-auto mb-8"
                >
                    <span className="text-xs font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--ink-kumkum)' }}>
                        What you&apos;ll save
                    </span>
                    <h2
                        className="my-3.5 leading-[1.1] text-[clamp(28px,5vw,50px)]"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                    >
                        See the time Vidyaverse gives back
                    </h2>
                    <p className="leading-[1.6] text-[clamp(15px,2vw,18px)]" style={{ color: 'var(--text2)' }}>
                        Drag the slider to your campus size — watch the monthly savings update live.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-left rounded-[22px] p-[clamp(24px,4vw,44px)]"
                    style={{ background: 'var(--elevated)', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgb(var(--night-ink-rgb) / 0.1)' }}
                >
                    <div className="flex justify-between items-baseline flex-wrap gap-2 mb-2">
                        <span className="font-bold text-[15px]" style={{ color: 'var(--text)' }}>
                            Students on campus
                        </span>
                        <span className="text-[clamp(26px,4vw,34px)]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-kumkum)' }}>
                            {fmt(students)}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={100}
                        max={5000}
                        step={50}
                        value={students}
                        onChange={(e) => setStudents(Number(e.target.value))}
                        className="w-full h-1.5 cursor-pointer"
                        style={{ accentColor: 'var(--kumkum)' }}
                        aria-label="Students on campus"
                    />
                    <div className="flex justify-between text-[11px] mt-1" style={{ color: 'var(--text3)' }}>
                        <span>100</span>
                        <span>5,000</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-[30px]">
                        <div className="p-5 rounded-2xl" style={{ background: 'rgb(var(--kumkum-rgb) / 0.06)', border: '1px solid var(--border-soft)' }}>
                            <div className="text-[clamp(30px,5vw,42px)] leading-none" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-kumkum)' }}>
                                {fmt(roiHours)}
                            </div>
                            <div className="text-[13px] font-semibold mt-1.5" style={{ color: 'var(--text2)' }}>
                                admin hours saved / month
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl" style={{ background: 'rgb(var(--peacock-teal-rgb) / 0.07)', border: '1px solid var(--border-soft)' }}>
                            <div className="text-[clamp(30px,5vw,42px)] leading-none" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-peacock)' }}>
                                {fmt(roiMsgs)}
                            </div>
                            <div className="text-[13px] font-semibold mt-1.5" style={{ color: 'var(--text2)' }}>
                                parent messages / month
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl" style={{ background: 'rgb(var(--deep-saffron-rgb) / 0.1)', border: '1px solid var(--border-soft)' }}>
                            <div className="text-[clamp(30px,5vw,42px)] leading-none" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-saffron)' }}>
                                {fmt(roiDocs)}
                            </div>
                            <div className="text-[13px] font-semibold mt-1.5" style={{ color: 'var(--text2)' }}>
                                documents generated / year
                            </div>
                        </div>
                    </div>

                    <p className="text-xs mt-[18px]" style={{ color: 'var(--text3)' }}>
                        Indicative estimates from founding-cohort pilots. Actuals vary by modules enabled.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
