import { motion } from 'framer-motion';
import { Building2, Library, GraduationCap, KeyRound, ArrowUpRight, ShieldCheck } from 'lucide-react';

/**
 * "One Identity. Three Platforms." — the trio/federation story. Vidyaverse is the
 * OIDC identity hub; PDLMS (digital library) and DigiClassroom (AI tutor) are
 * relying parties. One institutional login flows across all three via Ed25519 OIDC.
 * This full section lives ONLY on Vidyaverse (the hub); the consumer apps carry a
 * footer badge instead. Red/purple/blue palette.
 */

const platforms = [
    {
        icon: Building2,
        name: 'Vidyaverse',
        tag: 'Campus OS',
        role: 'The identity hub',
        desc: 'The 47-module operating system — and the single sign-on provider for the whole stack.',
        color: 'from-red-500 to-orange-500',
        glow: 'shadow-red-500/30',
        href: null,
        hub: true,
    },
    {
        icon: Library,
        name: 'PDLMS',
        tag: 'Digital Library',
        role: 'Relying party',
        desc: 'AI-powered reading — EPUB, PDF, audiobooks, and the Varta AI study assistant with citations.',
        color: 'from-amber-500 to-orange-600',
        glow: 'shadow-amber-500/30',
        href: 'https://pdlms.vgraphics.in',
        hub: false,
    },
    {
        icon: GraduationCap,
        name: 'DigiClassroom',
        tag: 'AI Tutor',
        role: 'Relying party',
        desc: 'Agentic RAG tutoring over NCERT, adaptive Practest assessments, and a full productivity suite.',
        color: 'from-blue-500 to-indigo-600',
        glow: 'shadow-blue-500/30',
        href: 'https://digiclassroom.vgraphics.in',
        hub: false,
    },
];

export default function EcosystemSection() {
    return (
        <section
            id="ecosystem"
            className="py-24 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 55%, #1E293B 100%)' }}
        >
            {/* ambient blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 animate-float" style={{ background: 'radial-gradient(circle, #E63946, transparent)' }} />
                <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#A5B4FC', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <KeyRound size={14} /> The Vidyaverse Ecosystem
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
                        One Identity. <span style={{ background: 'linear-gradient(90deg,#FF6B6B,#A78BFA,#60A5FA)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Three Platforms.</span>
                    </h2>
                    <p className="text-lg max-w-3xl mx-auto text-white/70">
                        Students and staff sign in once with Vidyaverse — and step straight into the
                        library and the AI tutor. No second password, no re-registration. One
                        institutional identity, three connected products.
                    </p>
                </motion.div>

                {/* platform cards with SSO connector */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {platforms.map((p, i) => (
                        <motion.div
                            key={p.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className="relative rounded-2xl p-7 group"
                            style={{
                                background: p.hub ? 'rgba(230,57,70,0.08)' : 'rgba(255,255,255,0.04)',
                                border: p.hub ? '1px solid rgba(255,107,107,0.3)' : '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            {p.hub && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ background: 'linear-gradient(90deg,#E63946,#F97316)' }}>
                                    Identity Provider
                                </span>
                            )}
                            <div className={`icon-gradient mb-5 shadow-lg ${p.glow} bg-gradient-to-br ${p.color}`}>
                                <p.icon size={26} className="relative z-10 text-white" />
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/60">{p.tag}</span>
                            </div>
                            <div className="text-xs font-medium mb-3 text-white/40 uppercase tracking-wide">{p.role}</div>
                            <p className="text-sm leading-relaxed text-white/70 mb-4">{p.desc}</p>
                            {p.href ? (
                                <a href={p.href} className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white transition-colors">
                                    Visit {p.name} <ArrowUpRight size={15} />
                                </a>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#FCA5A5' }}>
                                    <ShieldCheck size={15} /> You are here
                                </span>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* SSO assurance strip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/60"
                >
                    <span className="inline-flex items-center gap-2"><KeyRound size={15} className="text-indigo-300" /> Sign in with Vidyaverse (OIDC)</span>
                    <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-300" /> Ed25519-signed tokens</span>
                    <span className="inline-flex items-center gap-2"><Building2 size={15} className="text-rose-300" /> Roles &amp; memberships flow automatically</span>
                </motion.div>
            </div>
        </section>
    );
}
