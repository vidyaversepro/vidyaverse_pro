import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { MandalaMark } from '@/design/indic/motifs/mandala-mark';

const navLinks = [
    { label: 'Modules', href: '#modules' },
    { label: 'Communication', href: '#communication' },
    { label: 'Ecosystem', href: '#ecosystem' },
    { label: 'How It Works', href: '#how-it-works' },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300"
            style={{
                background: scrolled ? 'rgb(var(--parchment-rgb) / 0.9)' : 'rgb(var(--parchment-rgb) / 0.55)',
                borderBottom: scrolled ? '1px solid rgb(var(--temple-stone-rgb) / 0.22)' : '1px solid transparent',
                boxShadow: scrolled ? '0 4px 20px rgb(var(--night-ink-rgb) / 0.06)' : 'none',
            }}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Brand */}
                <a href="#" className="flex items-center gap-2.5 shrink-0">
                    <MandalaMark size={36} />
                    <span
                        className="text-xl tracking-tight text-[color:var(--night-ink)] dark:text-[color:var(--ivory-cream)]"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        Vidyaverse
                    </span>
                </a>

                {/* Desktop nav */}
                <ul className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className="text-sm font-semibold indic-muted hover:text-[color:var(--accent-strong)] dark:hover:text-[color:var(--accent-primary-dark)] transition-colors duration-200"
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full indic-muted hover:bg-[color:var(--accent-soft)] dark:hover:bg-white/5 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <a
                        href="/login"
                        className="text-sm font-semibold indic-muted hover:text-[color:var(--accent-strong)] dark:hover:text-[color:var(--accent-primary-dark)] px-4 py-2 transition-colors"
                    >
                        Log In
                    </a>
                    <a href="/register" className="indic-cta indic-cta--primary !min-h-0 !py-2.5 !px-5 text-sm">
                        Get Started
                    </a>
                </div>

                {/* Mobile */}
                <div className="flex md:hidden items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full indic-muted hover:bg-[color:var(--accent-soft)] dark:hover:bg-white/5 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 rounded-lg indic-muted hover:bg-[color:var(--accent-soft)] dark:hover:bg-white/5 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="md:hidden overflow-hidden"
                        style={{
                            background: 'var(--parchment)',
                            borderTop: '1px solid rgb(var(--temple-stone-rgb) / 0.22)',
                        }}
                    >
                        <div className="px-6 py-4 flex flex-col gap-3">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sm font-semibold indic-muted py-2"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <hr className="indic-rule" />
                            <a href="/login" className="text-sm font-semibold indic-muted py-2">
                                Log In
                            </a>
                            <a href="/register" className="indic-cta indic-cta--primary text-sm py-3 justify-center">
                                Get Started
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
