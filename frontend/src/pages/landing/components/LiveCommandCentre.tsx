import { motion } from 'framer-motion';
import { useState } from 'react';

type DashTab = 'Overview' | 'Attendance' | 'Fees' | 'Admissions';

const tabs: DashTab[] = ['Overview', 'Attendance', 'Fees', 'Admissions'];

const kpis = [
    { label: 'Students', value: '1,248', sub: '+18 this week', color: 'var(--brand)' },
    { label: 'Present today', value: '96.2%', sub: '1,201 / 1,248', color: 'var(--peacock)' },
    { label: 'Fees collected', value: '₹18.4L', sub: '82% of target', color: 'var(--deep-saffron)' },
    { label: 'Pending dues', value: '₹4.1L', sub: '214 students', color: 'var(--lotus-pink)' },
];

const attWeek = [
    { d: 'Mon', h: '86%' },
    { d: 'Tue', h: '92%' },
    { d: 'Wed', h: '90%' },
    { d: 'Thu', h: '95%' },
    { d: 'Fri', h: '97%' },
    { d: 'Sat', h: '78%' },
    { d: 'Sun', h: '40%' },
];

const attRows = [
    { cls: 'Grade 6-A', pct: '95%', label: '38 / 40' },
    { cls: 'Grade 7-B', pct: '90%', label: '36 / 40' },
    { cls: 'Grade 8-A', pct: '98%', label: '41 / 42' },
    { cls: 'Grade 9-C', pct: '84%', label: '32 / 38' },
    { cls: 'Grade 10-A', pct: '100%', label: '44 / 44' },
];

const feePayments = [
    { name: 'Aarav Sharma', cls: 'Grade 6-A', time: '2 min ago', amt: '+₹12,500' },
    { name: 'Diya Patel', cls: 'Grade 8-A', time: '11 min ago', amt: '+₹12,500' },
    { name: 'Kabir Nair', cls: 'Grade 10-A', time: '38 min ago', amt: '+₹15,000' },
];

const funnel = [
    { stage: 'Enquiries', n: '340', w: '100%' },
    { stage: 'Applications', n: '210', w: '62%' },
    { stage: 'Interviews', n: '156', w: '46%' },
    { stage: 'Admitted', n: '118', w: '35%' },
];

function PanelHeader({ title, value }: { title: string; value?: string }) {
    return (
        <div
            className="flex justify-between items-center text-[13px] font-semibold mb-[18px]"
            style={{ color: 'var(--text)' }}
        >
            <span>{title}</span>
            {value && <span style={{ color: 'var(--deep-saffron)' }}>{value}</span>}
        </div>
    );
}

export default function LiveCommandCentre() {
    const [tab, setTab] = useState<DashTab>('Overview');

    return (
        <section id="live" className="px-[clamp(16px,4vw,28px)] py-[clamp(64px,9vw,110px)]">
            <div className="max-w-[1200px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-[720px] mx-auto mb-11"
                >
                    <span className="text-xs font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--peacock)' }}>
                        Live preview
                    </span>
                    <h2
                        className="my-3.5 leading-[1.1] text-[clamp(30px,5.2vw,52px)]"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                    >
                        Your whole campus, one command centre
                    </h2>
                    <p className="leading-[1.6] text-[clamp(15px,2vw,19px)] [text-wrap:pretty]" style={{ color: 'var(--text2)' }}>
                        Every module writes to one shared record, so the dashboard is always live. Switch tabs below to
                        see attendance, fees and admissions update in place — this is the real thing, not a picture.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-[1000px] mx-auto rounded-[22px] overflow-hidden"
                    style={{
                        background: 'var(--elevated)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 30px 70px rgb(var(--night-ink-rgb) / 0.12)',
                    }}
                >
                    {/* Browser chrome */}
                    <div className="flex items-center gap-2 px-4 py-[13px]" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        <span className="w-[11px] h-[11px] rounded-full" style={{ background: 'var(--brand)' }} />
                        <span className="w-[11px] h-[11px] rounded-full" style={{ background: 'var(--gold)' }} />
                        <span className="w-[11px] h-[11px] rounded-full" style={{ background: 'var(--peacock)' }} />
                        <span className="ml-2.5 text-xs font-semibold" style={{ color: 'var(--text3)' }}>
                            app.vidyaverse.in / dashboard
                        </span>
                    </div>

                    {/* Tabs */}
                    <div
                        className="flex flex-wrap gap-0.5 px-[clamp(8px,2vw,16px)]"
                        style={{ borderBottom: '1px solid var(--border-soft)' }}
                    >
                        {tabs.map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className="px-4 py-3.5 bg-transparent cursor-pointer font-bold text-[13.5px] transition-colors duration-200"
                                style={{
                                    color: tab === t ? 'var(--brand)' : 'var(--text2)',
                                    borderBottom: `3px solid ${tab === t ? 'var(--brand)' : 'transparent'}`,
                                    marginBottom: '-1px',
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="p-[clamp(16px,3vw,28px)]">
                        {/* KPIs */}
                        <div className="grid gap-3.5 mb-[22px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                            {kpis.map((k) => (
                                <div key={k.label} className="p-4 rounded-[14px]" style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
                                    <div className="text-xs font-semibold" style={{ color: 'var(--text2)' }}>
                                        {k.label}
                                    </div>
                                    <div className="text-[26px] my-1" style={{ fontFamily: 'var(--font-display)', color: k.color }}>
                                        {k.value}
                                    </div>
                                    <div className="text-[11px]" style={{ color: 'var(--text3)' }}>
                                        {k.sub}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Panels */}
                        {tab === 'Overview' && (
                            <div className="rounded-[14px] p-5" style={{ border: '1px solid var(--border-soft)' }}>
                                <PanelHeader title="Attendance · last 7 days" />
                                <div className="flex items-end gap-[clamp(6px,2vw,18px)] h-[170px]">
                                    {attWeek.map((b) => (
                                        <div key={b.d} className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                                            <div
                                                className="w-full max-w-[48px] rounded-t-lg"
                                                style={{
                                                    height: b.h,
                                                    background: 'linear-gradient(180deg, var(--brand), var(--brand-2))',
                                                }}
                                            />
                                            <span className="text-[11px]" style={{ color: 'var(--text3)' }}>
                                                {b.d}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === 'Attendance' && (
                            <div className="flex flex-col gap-[13px]">
                                {attRows.map((r) => (
                                    <div key={r.cls} className="flex items-center gap-3.5">
                                        <span className="w-24 text-[13px] font-semibold shrink-0" style={{ color: 'var(--text)' }}>
                                            {r.cls}
                                        </span>
                                        <div className="flex-1 h-[10px] rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: r.pct,
                                                    background: 'linear-gradient(90deg, var(--peacock), var(--teal-light))',
                                                }}
                                            />
                                        </div>
                                        <span className="w-[66px] text-right text-xs shrink-0" style={{ color: 'var(--text2)' }}>
                                            {r.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {tab === 'Fees' && (
                            <div>
                                <PanelHeader title="Term-2 collection" value="₹18.4L / ₹22.5L" />
                                <div className="h-3.5 rounded-full overflow-hidden mb-6" style={{ background: 'var(--surface)' }}>
                                    <div
                                        className="h-full w-[82%] rounded-full"
                                        style={{ background: 'linear-gradient(90deg, var(--deep-saffron), var(--gold))' }}
                                    />
                                </div>
                                <div className="text-[13px] font-bold mb-3" style={{ color: 'var(--text)' }}>
                                    Recent payments · WhatsApp pay links
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    {feePayments.map((p) => (
                                        <div
                                            key={p.name}
                                            className="flex justify-between items-center px-3.5 py-[11px] rounded-xl"
                                            style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)' }}
                                        >
                                            <div>
                                                <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
                                                    {p.name}
                                                </div>
                                                <div className="text-[11px]" style={{ color: 'var(--text3)' }}>
                                                    {p.cls} · {p.time}
                                                </div>
                                            </div>
                                            <span className="font-extrabold text-sm" style={{ color: 'var(--peacock)' }}>
                                                {p.amt}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === 'Admissions' && (
                            <div className="flex flex-col gap-3.5">
                                {funnel.map((f) => (
                                    <div key={f.stage}>
                                        <div className="flex justify-between text-[13px] mb-[5px]">
                                            <span className="font-semibold" style={{ color: 'var(--text)' }}>
                                                {f.stage}
                                            </span>
                                            <span style={{ color: 'var(--text2)' }}>{f.n}</span>
                                        </div>
                                        <div
                                            className="h-6 rounded-lg"
                                            style={{
                                                width: f.w,
                                                minWidth: 64,
                                                background: 'linear-gradient(90deg, var(--lotus-pink), var(--lotus-deep))',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
