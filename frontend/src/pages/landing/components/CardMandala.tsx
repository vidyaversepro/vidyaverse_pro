const petals12 = Array.from({ length: 12 }, (_, i) => i * 30);

/**
 * Small rotating corner mandala for card-style tiles — the same curved-petal
 * shape as the CTA section's decoration (`CTASection.tsx`), not the
 * mandala-floral.png photo used in the ecosystem hub. Sized down and tinted
 * to the card's own accent colour so it reads as a quiet corner flourish,
 * not a competing focal point. Host card needs `relative overflow-hidden`.
 */
export default function CardMandala({ color }: { color: string }) {
    return (
        <svg
            viewBox="0 0 400 400"
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{ top: -22, right: -22, width: 88, height: 88, opacity: 0.16 }}
        >
            <g style={{ transformOrigin: '200px 200px', animation: 'lg-spin 26s linear infinite' }}>
                <circle cx="200" cy="200" r="180" fill="none" stroke={color} strokeWidth="2" />
                {petals12.map((deg) => (
                    <path
                        key={deg}
                        d="M200,40 Q224,74 200,106 Q176,74 200,40Z"
                        fill={color}
                        transform={`rotate(${deg} 200 200)`}
                    />
                ))}
            </g>
            <circle cx="200" cy="200" r="30" fill={color} />
        </svg>
    );
}
