import { motion } from 'framer-motion';
import { Link2, Building2, ShieldCheck } from 'lucide-react';
import mandalaFloral from '../assets/mandala-floral.png';
import CardMandala from './CardMandala';

const ecoApps = [
    {
        name: 'Vidyaverse',
        tag: 'Identity Provider · Hub',
        color: 'var(--gold)',
        rgbVar: '--gold-rgb',
        desc: 'The institutional OS and single sign-on that powers the whole ecosystem.',
        feats: ['One login for every app', 'Roles & memberships flow out', 'Ed25519-signed OIDC tokens'],
    },
    {
        name: 'PDLMS',
        tag: 'Digital Library',
        color: 'var(--saffron)',
        rgbVar: '--saffron-rgb',
        desc: 'EPUB, PDF and audiobooks with an AI study assistant, one tap away.',
        feats: ['EPUB, PDF, audiobooks', 'Varta AI study assistant', 'Citation-grounded answers'],
    },
    {
        name: 'DigiClassroom',
        tag: 'AI Tutor',
        color: 'var(--deep-saffron)',
        rgbVar: '--deep-saffron-rgb',
        desc: 'Agentic RAG over NCERT with an adaptive practice-test engine.',
        feats: ['Agentic RAG over NCERT', 'Adaptive Practest engine', 'Full productivity suite'],
    },
];

export default function EcosystemSection() {
    return (
        <section id="ecosystem" className="relative overflow-hidden px-[clamp(16px,4vw,28px)] py-[clamp(64px,9vw,110px)]" style={{ background: 'var(--bg)' }}>
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'radial-gradient(70% 55% at 50% 22%, rgb(var(--gold-rgb) / 0.1), transparent 62%),' +
                        'linear-gradient(rgb(var(--temple-stone-rgb) / 0.05) 1px, transparent 1px),' +
                        'linear-gradient(90deg, rgb(var(--temple-stone-rgb) / 0.05) 1px, transparent 1px)',
                    backgroundSize: '100% 100%, 44px 44px, 44px 44px',
                }}
            />
            <div className="relative max-w-[1080px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-[720px] mx-auto mb-3"
                >
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--brand)' }}>
                        <Link2 size={14} /> The Vidyaverse Ecosystem
                    </span>
                    <h2 className="my-3.5 leading-[1.1] text-[clamp(30px,5.4vw,54px)]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                        The{' '}
                        <span
                            style={{
                                background: 'linear-gradient(120deg, var(--brand), var(--deep-saffron) 55%, var(--gold))',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                color: 'transparent',
                            }}
                        >
                            Powerful Trio
                        </span>
                    </h2>
                    <p className="leading-[1.6] text-[clamp(15px,2vw,19px)] [text-wrap:pretty]" style={{ color: 'var(--text2)' }}>
                        One institutional identity, orbiting two connected products. Sign in once with Vidyaverse
                        and step straight into the library and the AI tutor — no second password, no re-registration.
                    </p>
                </motion.div>

                {/* Orbital diagram */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mx-auto mb-10"
                    style={{ width: 'min(560px, 94vw)', aspectRatio: '1 / 0.92' }}
                >
                    <svg viewBox="0 0 400 368" width="100%" height="100%" className="absolute inset-0" aria-hidden="true">
                        <circle cx="200" cy="184" r="138" fill="none" stroke="rgb(var(--temple-stone-rgb) / 0.38)" strokeWidth="0.7" strokeDasharray="2.5,4" />
                        <line x1="278" y1="70" x2="122" y2="298" stroke="rgb(var(--temple-stone-rgb) / 0.3)" strokeWidth="0.7" />
                    </svg>

                    {/* Hub — Vidyaverse */}
                    <img
                        src={mandalaFloral}
                        alt=""
                        className="absolute inset-0 m-auto"
                        style={{
                            width: '52%',
                            height: 'auto',
                            aspectRatio: '1',
                            animation: 'lg-spin 140s linear infinite',
                            filter: 'drop-shadow(0 6px 20px rgb(var(--brand-rgb) / 0.28))',
                        }}
                    />
                    <div
                        className="absolute inset-0 m-auto flex items-center justify-center text-white pointer-events-none"
                        style={{
                            width: 58,
                            height: 58,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--gold), var(--brand) 62%, var(--brand-2))',
                            border: '2px solid var(--gold)',
                            boxShadow: '0 6px 20px rgb(var(--brand-rgb) / 0.4)',
                            fontFamily: 'var(--font-display)',
                            fontSize: 24,
                        }}
                    >
                        वि
                        <div
                            className="absolute whitespace-nowrap font-semibold"
                            style={{
                                top: 'calc(100% + 7px)',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: 11,
                                letterSpacing: '0.04em',
                                color: 'var(--text2)',
                                background: 'var(--bg)',
                                padding: '1px 8px',
                                borderRadius: 6,
                            }}
                        >
                            Vidyaverse · IdP
                        </div>
                    </div>

                    {/* PDLMS satellite — upper right */}
                    <div className="absolute text-center" style={{ left: '69.5%', top: '19%', transform: 'translate(-50%, -50%)' }}>
                        <div className="relative mx-auto" style={{ width: 'clamp(84px, 17vw, 116px)', aspectRatio: '1' }}>
                            <img
                                src={mandalaFloral}
                                alt=""
                                className="absolute inset-0 w-full"
                                style={{ animation: 'lg-spinr 95s linear infinite', filter: 'hue-rotate(-12deg) drop-shadow(0 3px 10px rgb(var(--kumkum-rgb) / 0.3))' }}
                            />
                            <div
                                className="absolute"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '34%',
                                    aspectRatio: '1',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, #fff, var(--saffron) 70%, var(--kumkum))',
                                    border: '1.5px solid var(--gold)',
                                }}
                            />
                        </div>
                        <div className="mt-1 text-xs font-extrabold" style={{ color: 'var(--text)' }}>
                            PDLMS
                        </div>
                    </div>

                    {/* DigiClassroom satellite — lower left */}
                    <div className="absolute text-center" style={{ left: '30.5%', top: '81%', transform: 'translate(-50%, -50%)' }}>
                        <div className="relative mx-auto" style={{ width: 'clamp(84px, 17vw, 116px)', aspectRatio: '1' }}>
                            <img
                                src={mandalaFloral}
                                alt=""
                                className="absolute inset-0 w-full"
                                style={{ animation: 'lg-spinr 110s linear infinite', filter: 'hue-rotate(18deg) drop-shadow(0 3px 10px rgb(var(--deep-saffron-rgb) / 0.3))' }}
                            />
                            <div
                                className="absolute"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '34%',
                                    aspectRatio: '1',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, #fff, var(--deep-saffron) 70%, var(--temple-stone))',
                                    border: '1.5px solid var(--gold)',
                                }}
                            />
                        </div>
                        <div className="mt-1 text-xs font-extrabold" style={{ color: 'var(--text)' }}>
                            DigiClassroom
                        </div>
                    </div>
                </motion.div>

                {/* App cards */}
                <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                    {ecoApps.map((app, i) => (
                        <motion.div
                            key={app.name}
                            initial={{ opacity: 0, y: 26 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="relative overflow-hidden p-[26px] rounded-[20px]"
                            style={{ background: 'var(--elevated)', border: '1px solid var(--border)', boxShadow: '0 2px 18px rgb(var(--night-ink-rgb) / 0.05)' }}
                        >
                            <span className="absolute top-0 left-0 right-0 h-1" style={{ background: app.color }} />
                            <CardMandala color={app.color} />
                            <div className="flex items-center gap-2.5 mb-1.5">
                                <span className="w-3 h-3 rounded-full" style={{ background: app.color }} />
                                <span className="text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                                    {app.name}
                                </span>
                            </div>
                            <div className="text-[10px] font-bold tracking-[0.08em] uppercase mb-3" style={{ color: 'var(--text3)' }}>
                                {app.tag}
                            </div>
                            <p className="text-[13.5px] leading-[1.6] mb-4" style={{ color: 'var(--text2)' }}>
                                {app.desc}
                            </p>
                            <div className="flex flex-col gap-2">
                                {app.feats.map((f) => (
                                    <div key={f} className="flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--text2)' }}>
                                        <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: app.color }} />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* SSO assurance strip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-x-7 gap-y-3.5 mt-9 text-[13.5px]"
                    style={{ color: 'var(--text2)' }}
                >
                    <span className="inline-flex items-center gap-2">
                        <Link2 size={15} style={{ color: 'var(--brand)' }} /> Sign in with Vidyaverse (OIDC)
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <ShieldCheck size={15} style={{ color: 'var(--peacock-teal)' }} /> Ed25519-signed tokens
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <Building2 size={15} style={{ color: 'var(--deep-saffron)' }} /> Roles &amp; memberships flow automatically
                    </span>
                </motion.div>
            </div>
        </section>
    );
}
