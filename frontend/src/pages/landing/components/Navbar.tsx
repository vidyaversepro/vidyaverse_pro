import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { MandalaMark } from '@/design/indic/motifs/mandala-mark';

const navLinks = [
    { label: 'Modules', href: '#modules' },
    { label: 'Live demo', href: '#live' },
    { label: 'WhatsApp', href: '#communication' },
    { label: 'Ecosystem', href: '#ecosystem' },
    { label: 'Why Vidyaverse', href: '#compare' },
];

// Extra link shown only in the mobile sheet, mirroring the reference.
const mobileExtraLink = { label: 'How it works', href: '#how-it-works' };

/** The redesign's single JS breakpoint: mobile nav below 860px. */
function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 860);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 859px)');
        const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        setIsMobile(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    return isMobile;
}

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useIsMobile();
    const { theme, toggleTheme } = useTheme();

    // Close the sheet when crossing back to desktop.
    useEffect(() => {
        if (!isMobile) setMobileOpen(false);
    }, [isMobile]);

    return (
        <nav
            id="top"
            className="fixed top-0 left-0 right-0 z-50"
            style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                background: 'var(--glass)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 h-16 px-[clamp(16px,4vw,28px)]">
                {/* Brand */}
                <a href="#top" className="flex items-center gap-2.5 shrink-0" style={{ color: 'var(--text)' }}>
                    <MandalaMark size={36} />
                    <span className="text-[22px] tracking-[0.3px]" style={{ fontFamily: 'var(--font-display)' }}>
                        Vidyaverse
                    </span>
                </a>

                {/* Desktop nav */}
                {!isMobile && (
                    <>
                        <ul className="flex items-center list-none m-0 p-0" style={{ gap: 'clamp(18px,2.4vw,32px)' }}>
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-sm font-semibold transition-colors duration-200 hover:text-[color:var(--brand)]"
                                        style={{ color: 'var(--text2)' }}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={toggleTheme}
                                className="theme-toggle-btn"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            </button>
                            <a
                                href="/login"
                                className="text-sm font-semibold px-3.5 py-2 transition-colors duration-200 hover:text-[color:var(--brand)]"
                                style={{ color: 'var(--text2)' }}
                            >
                                Log in
                            </a>
                            <a
                                href="/register"
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-sm text-white transition-all duration-200 hover:-translate-y-px hover:brightness-[1.06]"
                                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-2))' }}
                            >
                                Get started
                            </a>
                        </div>
                    </>
                )}

                {/* Mobile */}
                {isMobile && (
                    <div className="flex items-center gap-2">
                        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="theme-toggle-btn"
                            style={{ color: 'var(--text)' }}
                            aria-label="Menu"
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile sheet */}
            <AnimatePresence>
                {isMobile && mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                        style={{
                            background: 'var(--bg)',
                            borderTop: '1px solid var(--border)',
                        }}
                    >
                        <div className="px-[clamp(16px,4vw,28px)] py-3.5 flex flex-col gap-1.5">
                            {[...navLinks.slice(0, 4), mobileExtraLink, navLinks[4]].map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sm font-semibold py-2.5"
                                    style={{ color: 'var(--text2)' }}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <a
                                href="/register"
                                onClick={() => setMobileOpen(false)}
                                className="text-center mt-1.5 py-3 rounded-full font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-2))' }}
                            >
                                Get started
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
