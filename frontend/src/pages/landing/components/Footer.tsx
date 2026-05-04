const links = [
    { label: 'Use Cases', href: '#use-cases' },
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Success Stories', href: '#testimonials' },
];

export default function Footer() {
    return (
        <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo */}
                    <a href="#" className="flex items-center shrink-0">
                        <img
                            src="/vidyaverse-logo.png"
                            alt="Vidyaverse"
                            className="h-8 w-auto"
                            style={{ maxWidth: '160px' }}
                        />
                    </a>

                    {/* Links */}
                    <nav className="flex flex-wrap justify-center gap-6">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium transition-colors duration-300 hover:text-[var(--primary)]"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Copyright */}
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        © {new Date().getFullYear()} Vidyaverse Pro. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
