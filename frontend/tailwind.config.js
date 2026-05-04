/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                /* Landing page palette */
                space: {
                    DEFAULT: '#0A0E27',
                    50: '#1a1f42',
                    100: '#14183a',
                    200: '#0f1331',
                    300: '#0A0E27',
                    400: '#07091d',
                    500: '#040614',
                },
                cyan: {
                    DEFAULT: '#00D9FF',
                    50: '#e0faff',
                    100: '#b3f2ff',
                    200: '#80eaff',
                    300: '#4de2ff',
                    400: '#1adbff',
                    500: '#00D9FF',
                    600: '#00aecc',
                    700: '#008299',
                    800: '#005766',
                    900: '#002b33',
                },
                violet: {
                    DEFAULT: '#8B5CF6',
                    50: '#f5f0ff',
                    100: '#ede5ff',
                    200: '#daccff',
                    300: '#c0a6ff',
                    400: '#a378ff',
                    500: '#8B5CF6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            fontFamily: {
                inter: ['Inter', 'system-ui', 'sans-serif'],
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-12px) rotate(2deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)' },
                    '50%': { boxShadow: '0 0 40px rgba(0, 217, 255, 0.5), 0 0 80px rgba(139, 92, 246, 0.2)' },
                },
                'orbit': {
                    '0%': { transform: 'rotate(0deg) translateX(var(--orbit-radius, 160px)) rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg) translateX(var(--orbit-radius, 160px)) rotate(-360deg)' },
                },
                'fade-slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(40px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'bounce-in': {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '50%': { transform: 'scale(1.15)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'scroll-hint': {
                    '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
                    '50%': { transform: 'translateY(12px)', opacity: '0.4' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float-slow 8s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
                'orbit': 'orbit var(--orbit-duration, 20s) linear infinite',
                'fade-slide-up': 'fade-slide-up 0.6s ease-out forwards',
                'shimmer': 'shimmer 3s ease-in-out infinite',
                'bounce-in': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
                'scroll-hint': 'scroll-hint 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
