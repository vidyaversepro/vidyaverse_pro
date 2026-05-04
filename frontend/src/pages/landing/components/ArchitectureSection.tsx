import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Monitor, Server, Database, Zap, HardDrive,
    Brain, Layers, FileOutput, X,
} from 'lucide-react';

const nodes = [
    {
        id: 'frontend',
        icon: Monitor,
        label: 'Frontend',
        tech: 'React + Vite',
        color: 'text-cyan-400',
        detail: 'React 18 with TypeScript, Vite 5 for blazing-fast builds, TailwindCSS for styling, Framer Motion for animations.',
        row: 0,
        col: 1,
    },
    {
        id: 'backend',
        icon: Server,
        label: 'Backend',
        tech: 'Fastify + TS',
        color: 'text-violet-400',
        detail: 'Fastify 4 — 3x faster than Express. TypeScript for type safety. JWT auth with role-based access control.',
        row: 1,
        col: 1,
    },
    {
        id: 'database',
        icon: Database,
        label: 'Database',
        tech: 'MySQL + Prisma',
        color: 'text-emerald-400',
        detail: 'MySQL for reliability. Prisma ORM for type-safe queries and migrations. Multi-tenant schema isolation.',
        row: 2,
        col: 0,
    },
    {
        id: 'cache',
        icon: Zap,
        label: 'Cache',
        tech: 'Redis',
        color: 'text-amber-400',
        detail: 'Redis for sub-millisecond response times. Session management, rate limiting, and queue orchestration.',
        row: 2,
        col: 1,
    },
    {
        id: 'storage',
        icon: HardDrive,
        label: 'Storage',
        tech: 'MinIO (S3)',
        color: 'text-sky-400',
        detail: 'Self-hosted S3-compatible object storage. Photos, documents, and templates stored on your infrastructure.',
        row: 2,
        col: 2,
    },
    {
        id: 'ai',
        icon: Brain,
        label: 'AI Cascade',
        tech: '4 Tiers',
        color: 'text-fuchsia-400',
        detail: 'Tier 0: Cache (40% hit, FREE) → Tier 1: OpenCV (50%, FREE) → Tier 2: Perceptual hash (FREE) → Tier 3: Gemini (10%, PAID).',
        row: 3,
        col: 0,
    },
    {
        id: 'jobs',
        icon: Layers,
        label: 'Job Queue',
        tech: 'BullMQ',
        color: 'text-orange-400',
        detail: 'Background job processing for batch operations — ID card generation, certificate creation, photo processing.',
        row: 3,
        col: 1,
    },
    {
        id: 'docs',
        icon: FileOutput,
        label: 'Doc Engine',
        tech: 'Puppeteer',
        color: 'text-rose-400',
        detail: 'Headless Chrome for pixel-perfect document generation — ID cards, certificates, marksheets in PDF/PNG.',
        row: 3,
        col: 2,
    },
];

export default function ArchitectureSection() {
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const active = nodes.find((n) => n.id === activeNode);

    return (
        <section id="architecture" className="relative py-28 sm:py-36 overflow-hidden">
            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4 block">
                        Under the Hood
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                        Built for <span className="gradient-text">Scale</span>
                    </h2>
                    <p className="text-white/50 text-lg max-w-xl mx-auto">
                        Click any node to explore the technology stack powering Vidyaverse Pro.
                    </p>
                </motion.div>

                {/* Architecture grid */}
                <div className="relative max-w-3xl mx-auto">
                    {/* Connection lines (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 600 500" fill="none" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <linearGradient id="archLine" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>
                        {/* Frontend → Backend */}
                        <line x1="300" y1="60" x2="300" y2="170" stroke="url(#archLine)" strokeWidth="2" strokeDasharray="6 4" />
                        {/* Backend → DB/Cache/Storage */}
                        <line x1="300" y1="220" x2="100" y2="310" stroke="url(#archLine)" strokeWidth="2" strokeDasharray="6 4" />
                        <line x1="300" y1="220" x2="300" y2="310" stroke="url(#archLine)" strokeWidth="2" strokeDasharray="6 4" />
                        <line x1="300" y1="220" x2="500" y2="310" stroke="url(#archLine)" strokeWidth="2" strokeDasharray="6 4" />
                        {/* Bottom row connections */}
                        <line x1="100" y1="370" x2="100" y2="430" stroke="url(#archLine)" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="300" y1="370" x2="300" y2="430" stroke="url(#archLine)" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="500" y1="370" x2="500" y2="430" stroke="url(#archLine)" strokeWidth="1" strokeDasharray="4 4" />
                    </svg>

                    {/* Nodes */}
                    <div className="relative z-10 space-y-6">
                        {[0, 1, 2, 3].map((row) => (
                            <div
                                key={row}
                                className={`grid gap-4 ${row <= 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-3'
                                    }`}
                            >
                                {nodes
                                    .filter((n) => n.row === row)
                                    .map((node) => (
                                        <motion.button
                                            key={node.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: node.row * 0.1 + node.col * 0.05 }}
                                            onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                                            className={`arch-node flex items-center gap-3 text-left w-full ${activeNode === node.id ? 'active' : ''
                                                }`}
                                        >
                                            <node.icon size={22} className={node.color} />
                                            <div>
                                                <p className="font-semibold text-sm">{node.label}</p>
                                                <p className="text-xs text-white/40">{node.tech}</p>
                                            </div>
                                        </motion.button>
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail panel */}
                <AnimatePresence>
                    {active && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-8 max-w-2xl mx-auto"
                        >
                            <div className="glass-card p-6 relative">
                                <button
                                    onClick={() => setActiveNode(null)}
                                    className="absolute top-4 right-4 text-white/40 hover:text-white"
                                    aria-label="Close detail"
                                >
                                    <X size={18} />
                                </button>
                                <div className="flex items-center gap-3 mb-3">
                                    <active.icon size={24} className={active.color} />
                                    <h3 className="font-bold text-lg">{active.label}</h3>
                                    <span className="text-xs text-white/40 ml-auto">{active.tech}</span>
                                </div>
                                <p className="text-white/60 text-sm leading-relaxed">{active.detail}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
