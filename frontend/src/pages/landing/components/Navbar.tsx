import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const navLinks = [
    { label: 'Use Cases', href: '#use-cases' },
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Success Stories', href: '#testimonials' },
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav shadow-md' : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Official Logo */}
                <a href="#" className="flex items-center shrink-0">
                    <img
                        src="/vidyaverse-logo.png"
                        alt="Vidyaverse"
                        className="h-10 w-auto"
                        style={{ maxWidth: '180px' }}
                    />
                </a>

                {/* Desktop nav */}
                <ul className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className="text-sm font-medium transition-all duration-300 hover:text-[var(--primary)]"
                                style={{ color: 'var(--text-secondary)' }}
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
                        className="theme-toggle-btn"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <a
                        href="/login"
                        className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 hover:text-[var(--primary)]"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Log In
                    </a>
                    <a href="/register" className="btn-primary-landing text-sm px-5 py-2.5">
                        Start Free Trial
                    </a>
                </div>

                {/* Mobile */}
                <div className="flex md:hidden items-center gap-2">
                    <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 rounded-lg"
                        style={{ color: 'var(--text-primary)' }}
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
                        style={{ background: 'var(--bg)', borderTop: '1px solid var(--border-light)' }}
                    >
                        <div className="px-6 py-4 flex flex-col gap-3">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sm font-medium py-2"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <hr style={{ borderColor: 'var(--border-light)' }} />
                            <a href="/login" className="text-sm font-medium py-2" style={{ color: 'var(--text-secondary)' }}>
                                Log In
                            </a>
                            <a href="/register" className="btn-primary-landing text-sm py-3 text-center">
                                Start Free Trial
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
