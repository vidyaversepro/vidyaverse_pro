/**
 * Status pills, shared.
 *
 * The Indic re-skin's Phase 4 pages each grew a local copy of this (StudentsPage,
 * AttendancePage, FeesPage, AdmissionsPage) with the same literal pigment hexes.
 * Those four are live-verified and deliberately left alone; every page restyled
 * after them imports from here instead of adding a fifth copy.
 *
 * Colour is semantic (approved / overdue / pending), not the app accent, so it must
 * NOT follow the kumkum ↔ peacock switch. It IS theme-aware, though: the pill
 * text/background pairs live in `styles/status-tones.css` with measured light and
 * dark values, because one hex cannot serve both — the original single-value
 * palette rendered indigo at 1.48:1 on the dark background, i.e. invisible.
 *
 * `TONE` still exports raw hexes for NON-text uses — icon strokes, card borders,
 * tinted panel backgrounds — where the 3:1 threshold applies and one value is fine.
 * Do not use TONE for pill text; use the `tone` prop, which resolves to a class.
 */

export const TONE = {
    green: '#15803d',
    temple: '#B8860B',
    red: '#C0392B',
    peacock: '#006A6E',
    indigo: '#1A237E',
    lotus: '#9C27B0',
    saffron: '#E07A28',
} as const;

export type ToneValue = string;

type ToneName = keyof typeof TONE;

/** Maps a TONE hex back to its name so callers can keep passing `TONE.x`. */
const HEX_TO_NAME: Record<string, ToneName> = Object.entries(TONE).reduce(
    (acc, [name, hex]) => { acc[hex.toLowerCase()] = name as ToneName; return acc; },
    {} as Record<string, ToneName>,
);

function toneClass(tone: ToneValue): string | null {
    const name = HEX_TO_NAME[String(tone).toLowerCase()];
    return name ? `pill-${name}` : null;
}

const PILL_BASE = 'inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap';

export function Pill({ label, tone, className = '' }: { label: string; tone: ToneValue; className?: string }) {
    const cls = toneClass(tone);
    // Known pigment -> themed class. Anything else keeps the literal inline colour.
    return cls
        ? <span className={`${PILL_BASE} ${cls} ${className}`}>{label}</span>
        : <span className={`${PILL_BASE} ${className}`} style={{ color: tone, background: `${tone}1f` }}>{label}</span>;
}

export function NeutralPill({ label, className = '' }: { label: string; className?: string }) {
    return (
        <span className={`${PILL_BASE} bg-muted text-muted-foreground border ${className}`}>
            {label}
        </span>
    );
}

/** Maps an arbitrary lowercase status string onto a pigment, with a neutral default. */
export const STATUS_TONE: Record<string, string> = {
    active: TONE.green,
    approved: TONE.green,
    completed: TONE.green,
    paid: TONE.green,
    cleared: TONE.green,
    present: TONE.green,
    resolved: TONE.green,
    published: TONE.green,
    issued: TONE.green,
    placed: TONE.green,
    in: TONE.green,

    pending: TONE.temple,
    draft: TONE.temple,
    scheduled: TONE.temple,
    partial: TONE.temple,
    late: TONE.temple,
    processing: TONE.temple,
    submitted: TONE.temple,

    inactive: TONE.red,
    rejected: TONE.red,
    cancelled: TONE.red,
    overdue: TONE.red,
    failed: TONE.red,
    absent: TONE.red,
    expired: TONE.red,
    out: TONE.red,

    ongoing: TONE.peacock,
    live: TONE.peacock,
    open: TONE.peacock,
    running: TONE.peacock,

    upcoming: TONE.indigo,
    new: TONE.indigo,
    generated: TONE.indigo,
};

/** Renders a status string as a coloured pill, falling back to a neutral one. */
export function StatusPill({ status, className = '' }: { status?: string | null; className?: string }) {
    if (!status) return <NeutralPill label="—" className={className} />;
    const tone = STATUS_TONE[String(status).toLowerCase()];
    const label = String(status).replace(/_/g, ' ');
    return tone
        ? <Pill label={label} tone={tone} className={`capitalize ${className}`} />
        : <NeutralPill label={label} className={`capitalize ${className}`} />;
}
