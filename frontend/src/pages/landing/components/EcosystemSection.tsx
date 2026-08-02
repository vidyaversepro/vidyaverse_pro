import { motion } from 'framer-motion';
import { Library, GraduationCap, KeyRound, ArrowUpRight, ShieldCheck, Building2 } from 'lucide-react';

/**
 * "The Powerful Trio" — the trio/federation story, rebuilt as one connected
 * orbital diagram rather than three cards. Vidyaverse is a dharma-chakra hub
 * at the centre; PDLMS and DigiClassroom sit as smaller mandala satellites on
 * ONE shared orbit ring, diametrically opposite each other with a single axle
 * line running straight through the hub — which is also architecturally
 * honest: both are OIDC relying parties of equal standing around the same
 * identity provider, not a hierarchy. Features are annotation labels on thin
 * leader-lines, astronomical-diagram style — no card chrome, no borders, no
 * background panels anywhere in this composition.
 *
 * This full section lives ONLY on Vidyaverse (the hub); the consumer apps
 * carry a footer badge instead.
 */

/* ---------- polar helpers (0–100 unit space, matches viewBox="0 0 100 100") ---------- */
function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function dotRing(cx: number, cy: number, r: number, count: number) {
    return Array.from({ length: count }, (_, i) => {
        const [x, y] = polar(cx, cy, r, (i * 360) / count);
        return { x, y, key: i };
    });
}

function petalPath(cx: number, cy: number, rBase: number, rTip: number, angleDeg: number, halfWidthDeg: number) {
    const [bx, by] = polar(cx, cy, rBase, angleDeg);
    const [tx, ty] = polar(cx, cy, rTip, angleDeg);
    const [c1x, c1y] = polar(cx, cy, (rBase + rTip) / 2, angleDeg - halfWidthDeg);
    const [c2x, c2y] = polar(cx, cy, (rBase + rTip) / 2, angleDeg + halfWidthDeg);
    return `M${bx},${by} Q${c1x},${c1y} ${tx},${ty} Q${c2x},${c2y} ${bx},${by} Z`;
}

function spokePath(cx: number, cy: number, rInner: number, rOuter: number, angleDeg: number, halfWidthDeg: number) {
    const [ax, ay] = polar(cx, cy, rInner, angleDeg - halfWidthDeg);
    const [bx, by] = polar(cx, cy, rInner, angleDeg + halfWidthDeg);
    const [tx, ty] = polar(cx, cy, rOuter, angleDeg);
    return `M${ax},${ay} L${tx},${ty} L${bx},${by} Z`;
}

/* ---------- the hub: a dharma-chakra, not a flag emblem —
   spoke count/proportions are original, no dotted rim + tricolour banding
   that would read as a reproduction of the state emblem ---------- */
function HubChakra({ size = 220 }: { size?: number }) {
    const c = 50;
    const dots = dotRing(c, c, 36, 28);
    const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
    const spokes = Array.from({ length: 12 }, (_, i) => i * 30);
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg" role="presentation">
            <defs>
                <radialGradient id="hub-core" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--gold)" />
                    <stop offset="55%" stopColor="var(--accent-primary)" />
                    <stop offset="100%" stopColor="var(--accent-strong)" />
                </radialGradient>
            </defs>

            <g className="indic-spin-slow" style={{ transformOrigin: '50px 50px', animationDuration: '90s' }}>
                {dots.map((d) => (
                    <circle key={d.key} cx={d.x} cy={d.y} r={0.7} fill="var(--gold)" opacity={0.7} />
                ))}
            </g>

            {petals.map((deg) => (
                <path
                    key={`p${deg}`}
                    d={petalPath(c, c, 26, 34, deg, 7)}
                    fill={deg % 45 === 0 ? 'rgb(var(--gold-rgb) / 0.5)' : 'rgb(var(--accent-strong-rgb) / 0.4)'}
                    stroke="var(--gold)"
                    strokeWidth={0.3}
                />
            ))}

            {spokes.map((deg) => (
                <path key={`s${deg}`} d={spokePath(c, c, 11, 24, deg, 3.2)} fill="var(--gold)" opacity={0.85} />
            ))}

            <circle cx={c} cy={c} r={12.5} fill="url(#hub-core)" stroke="var(--gold)" strokeWidth={0.6} />
            <circle cx={c} cy={c} r={3} fill="var(--ivory-cream)" />
        </svg>
    );
}

/* ---------- a satellite mandala: same ring language, one pigment, no spokes
   — visually smaller and quieter than the hub on purpose ---------- */
function SatelliteMandala({ size = 96, rgbVar }: { size?: number; rgbVar: string }) {
    const c = 50;
    const dots = dotRing(c, c, 34, 18);
    const petals = Array.from({ length: 10 }, (_, i) => i * 36);
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg" role="presentation">
            <defs>
                <radialGradient id={`sat-${rgbVar}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--ivory-cream)" />
                    <stop offset="60%" stopColor={`rgb(var(${rgbVar}))`} />
                    <stop offset="100%" stopColor={`rgb(var(${rgbVar}))`} />
                </radialGradient>
            </defs>
            {dots.map((d) => (
                <circle key={d.key} cx={d.x} cy={d.y} r={0.9} fill={`rgb(var(${rgbVar}))`} opacity={0.6} />
            ))}
            {petals.map((deg) => (
                <path
                    key={deg}
                    d={petalPath(c, c, 21, 30, deg, 9)}
                    fill={`rgb(var(${rgbVar}) / 0.35)`}
                    stroke={`rgb(var(${rgbVar}))`}
                    strokeWidth={0.4}
                />
            ))}
            <circle cx={c} cy={c} r={14} fill={`url(#sat-${rgbVar})`} stroke="var(--gold)" strokeWidth={0.5} />
        </svg>
    );
}

const HUB = { x: 50, y: 50 };
const ORBIT_R = 30;
const NODE_A = polar(HUB.x, HUB.y, ORBIT_R, -55); // PDLMS — upper right
const NODE_B = polar(HUB.x, HUB.y, ORBIT_R, 125); // DigiClassroom — lower left

const pdlms = {
    icon: Library,
    name: 'PDLMS',
    tag: 'Digital Library',
    features: ['EPUB, PDF, audiobooks', 'Varta AI study assistant', 'Citation-grounded answers'],
    rgbVar: '--saffron-rgb',
    href: 'https://pdlms.vgraphics.in',
};

const dcp = {
    icon: GraduationCap,
    name: 'DigiClassroom',
    tag: 'AI Tutor',
    features: ['Agentic RAG over NCERT', 'Adaptive Practest engine', 'Full productivity suite'],
    rgbVar: '--turmeric-rgb',
    href: 'https://digiclassroom.vgraphics.in',
};

function SatelliteAnnotation({ p, align }: { p: typeof pdlms; align: 'left' | 'right' }) {
    return (
        <div className={`max-w-[160px] ${align === 'right' ? 'text-right' : 'text-left'}`}>
            <a
                href={p.href}
                className={`inline-flex items-center gap-1.5 mb-2 group ${align === 'right' ? 'flex-row-reverse' : ''}`}
            >
                <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                    style={{ background: `rgb(var(${p.rgbVar}) / 0.16)`, color: `rgb(var(${p.rgbVar}))` }}
                >
                    <p.icon size={16} />
                </span>
                <span className="text-base font-semibold text-white group-hover:text-[color:var(--gold)] transition-colors">
                    {p.name}
                </span>
                <ArrowUpRight size={13} className="text-white/40 shrink-0" />
            </a>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/35 mb-2">{p.tag}</div>
            <ul className={`space-y-1 ${align === 'right' ? 'pr-2' : 'pl-2'}`}>
                {p.features.map((f) => (
                    <li
                        key={f}
                        className={`text-xs text-white/60 flex items-center gap-1.5 ${align === 'right' ? 'flex-row-reverse' : ''}`}
                    >
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ background: `rgb(var(${p.rgbVar}))` }} />
                        {f}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function EcosystemSection() {
    return (
        <section id="ecosystem" className="indic-section--deep py-24 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-6"
                >
                    <span className="indic-eyebrow mb-4">
                        <KeyRound size={14} /> The Vidyaverse Ecosystem
                    </span>
                    <h2 className="text-3xl sm:text-5xl mt-4 mb-4">
                        The <span className="gradient-text-indic">Powerful Trio</span>
                    </h2>
                    <p className="text-lg max-w-3xl mx-auto indic-muted">
                        One institutional identity, orbiting two connected products. Sign in once
                        with Vidyaverse and step straight into the library and the AI tutor — no
                        second password, no re-registration.
                    </p>
                </motion.div>

                {/* ── Desktop: the orbital diagram ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden lg:block relative w-full aspect-[16/10] max-w-4xl mx-auto mt-6"
                >
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <line
                            x1={NODE_A[0]} y1={NODE_A[1]} x2={NODE_B[0]} y2={NODE_B[1]}
                            stroke="rgb(var(--gold-rgb) / 0.3)" strokeWidth={0.25}
                        />
                        <circle
                            cx={HUB.x} cy={HUB.y} r={ORBIT_R} fill="none"
                            stroke="rgb(var(--gold-rgb) / 0.25)" strokeWidth={0.3} strokeDasharray="1.2,1.6"
                        />
                        {/* leader-line stems from each satellite out to its annotation */}
                        <line x1={NODE_A[0]} y1={NODE_A[1]} x2={80} y2={12} stroke="rgb(var(--saffron-rgb) / 0.4)" strokeWidth={0.25} />
                        <line x1={NODE_B[0]} y1={NODE_B[1]} x2={20} y2={88} stroke="rgb(var(--turmeric-rgb) / 0.4)" strokeWidth={0.25} />
                    </svg>

                    {/* hub */}
                    <div className="absolute" style={{ left: `${HUB.x}%`, top: `${HUB.y}%`, transform: 'translate(-50%, -50%)' }}>
                        <HubChakra size={200} />
                    </div>
                    <div
                        className="absolute text-center"
                        style={{ left: `${HUB.x}%`, top: `${HUB.y}%`, transform: 'translate(-50%, 68px)' }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-1.5">
                            <Building2 size={16} style={{ color: 'var(--gold)' }} />
                            <span className="text-lg text-white" style={{ fontFamily: 'var(--font-display)' }}>Vidyaverse</span>
                        </div>
                        <span className="indic-eyebrow" style={{ fontSize: '10px', padding: '0.25rem 0.7rem' }}>
                            <ShieldCheck size={11} /> Identity Provider
                        </span>
                    </div>

                    {/* PDLMS satellite */}
                    <div className="absolute" style={{ left: `${NODE_A[0]}%`, top: `${NODE_A[1]}%`, transform: 'translate(-50%, -50%)' }}>
                        <SatelliteMandala size={90} rgbVar={pdlms.rgbVar} />
                    </div>
                    <div className="absolute" style={{ left: '80%', top: '6%' }}>
                        <SatelliteAnnotation p={pdlms} align="left" />
                    </div>

                    {/* DigiClassroom satellite */}
                    <div className="absolute" style={{ left: `${NODE_B[0]}%`, top: `${NODE_B[1]}%`, transform: 'translate(-50%, -50%)' }}>
                        <SatelliteMandala size={90} rgbVar={dcp.rgbVar} />
                    </div>
                    <div className="absolute" style={{ right: '80%', bottom: '6%' }}>
                        <SatelliteAnnotation p={dcp} align="right" />
                    </div>
                </motion.div>

                {/* ── Mobile / tablet: vertical spine ── */}
                <div className="lg:hidden flex flex-col items-center mt-10">
                    <HubChakra size={140} />
                    <div className="flex items-center justify-center gap-2 mt-3 mb-1.5">
                        <Building2 size={15} style={{ color: 'var(--gold)' }} />
                        <span className="text-base text-white" style={{ fontFamily: 'var(--font-display)' }}>Vidyaverse</span>
                    </div>
                    <span className="indic-eyebrow mb-6" style={{ fontSize: '10px', padding: '0.25rem 0.7rem' }}>
                        <ShieldCheck size={11} /> Identity Provider
                    </span>

                    <div className="w-px h-10" style={{ background: 'linear-gradient(var(--gold), transparent)' }} />

                    {[{ p: pdlms }, { p: dcp }].map(({ p }, i) => (
                        <div key={p.name} className="w-full max-w-sm">
                            <div className="flex items-center gap-4 py-4">
                                <SatelliteMandala size={64} rgbVar={p.rgbVar} />
                                <SatelliteAnnotation p={p} align="left" />
                            </div>
                            {i === 0 && <div className="w-px h-10 mx-auto" style={{ background: 'rgb(var(--gold-rgb) / 0.3)' }} />}
                        </div>
                    ))}
                </div>

                {/* SSO assurance strip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/60"
                >
                    <span className="inline-flex items-center gap-2"><KeyRound size={15} style={{ color: 'var(--gold)' }} /> Sign in with Vidyaverse (OIDC)</span>
                    <span className="inline-flex items-center gap-2"><ShieldCheck size={15} style={{ color: 'var(--peacock-teal)' }} /> Ed25519-signed tokens</span>
                    <span className="inline-flex items-center gap-2"><Building2 size={15} style={{ color: 'var(--kumkum)' }} /> Roles &amp; memberships flow automatically</span>
                </motion.div>
            </div>
        </section>
    );
}
