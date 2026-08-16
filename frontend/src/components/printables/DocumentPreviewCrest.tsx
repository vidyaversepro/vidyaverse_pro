import { MandalaMark } from '@/design/indic/motifs/mandala-mark';

/**
 * DocumentPreviewCrest — the shared ornamental placeholder for a printable's
 * preview (Phase 5, Document Studio). A gold hairline frame, a faint mandala
 * watermark, a MandalaMark crest and an optional Yatra One label — the visual
 * identity every doc-type card falls back to when there's no rendered
 * thumbnail yet. Purely decorative; carries no data.
 */
export function DocumentPreviewCrest({
    label,
    size = 44,
    className = '',
}: {
    label?: string;
    size?: number;
    className?: string;
}) {
    return (
        <div
            className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden ${className}`}
            style={{
                background:
                    'radial-gradient(120% 120% at 50% 0%, rgb(var(--gold-rgb) / 0.10) 0%, hsl(var(--card)) 70%)',
            }}
        >
            {/* Gold hairline frame */}
            <div
                className="pointer-events-none absolute inset-2 rounded-md"
                style={{ border: '1px solid rgb(var(--temple-stone-rgb) / 0.35)' }}
            />
            {/* Faint mandala watermark behind the crest */}
            <MandalaMark
                size={size * 2.2}
                spin={false}
                className="pointer-events-none absolute opacity-[0.06]"
            />
            <MandalaMark size={size} spin={false} className="relative" />
            {label && (
                <span
                    className="relative mt-2 max-w-[85%] truncate px-2 text-center text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    {label}
                </span>
            )}
        </div>
    );
}
