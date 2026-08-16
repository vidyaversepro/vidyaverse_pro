import { motion } from 'framer-motion';
import { useState } from 'react';

type DocType = 'ID Card' | 'Marksheet' | 'Hall Ticket';

const docTypes: DocType[] = ['ID Card', 'Marksheet', 'Hall Ticket'];

const petals8 = [0, 45, 90, 135, 180, 225, 270, 315];
const petals8b = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
const petals12 = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

const markRows = [
    { sub: 'English', mk: '88', gr: 'A1' },
    { sub: 'Hindi', mk: '91', gr: 'A1' },
    { sub: 'Mathematics', mk: '95', gr: 'A1' },
    { sub: 'Science', mk: '86', gr: 'A2' },
    { sub: 'Social Science', mk: '82', gr: 'A2' },
];

const hallRows = [
    { d: '02 Jun', p: 'Mathematics', t: '9:00 – 12:00' },
    { d: '04 Jun', p: 'Science', t: '9:00 – 12:00' },
    { d: '06 Jun', p: 'English', t: '9:00 – 11:30' },
    { d: '08 Jun', p: 'Social Science', t: '9:00 – 11:30' },
];

/** White-petal mandala used on the ID-card and hall-ticket headers. */
function DocLogoWhite({ size }: { size: number }) {
    return (
        <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
            <defs>
                <radialGradient id="lg-id-logo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="72%" stopColor="#fff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0.3" />
                </radialGradient>
            </defs>
            <circle cx="60" cy="60" r="58" fill="rgba(255,255,255,0.16)" />
            <g>
                {petals8.map((d) => (
                    <path key={`o${d}`} d="M60,58 C46,42 46,20 60,12 C74,20 74,42 60,58 Z" fill="#fff" fillOpacity="0.5" transform={`rotate(${d} 60 60)`} />
                ))}
                {petals8b.map((d) => (
                    <path key={`i${d}`} d="M60,52 C51,42 51,30 60,25 C69,30 69,42 60,52 Z" fill="#fff" fillOpacity="0.72" transform={`rotate(${d} 60 60)`} />
                ))}
            </g>
            <circle cx="60" cy="60" r="14" fill="url(#lg-id-logo)" />
            <circle cx="60" cy="60" r="5.5" fill="#fff" />
        </svg>
    );
}

/** Brand-inked logo for the marksheet header. */
function MarksheetLogo({ size }: { size: number }) {
    return (
        <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" style={{ flexShrink: 0 }}>
            <defs>
                <radialGradient id="lg-ms-logo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--gold)" />
                    <stop offset="70%" stopColor="var(--brand)" />
                    <stop offset="100%" stopColor="var(--brand-2)" />
                </radialGradient>
            </defs>
            <circle cx="60" cy="60" r="58" fill="none" stroke="var(--brand)" strokeWidth="2" />
            {petals8.map((d) => (
                <path key={d} d="M60,56 C48,40 48,22 60,15 C72,22 72,40 60,56 Z" fill="rgb(var(--brand-rgb) / 0.3)" transform={`rotate(${d} 60 60)`} />
            ))}
            <circle cx="60" cy="60" r="16" fill="url(#lg-ms-logo)" />
            <circle cx="60" cy="60" r="6" fill="#fff" />
        </svg>
    );
}

/** 12-petal watermark for the marksheet background. */
function MarksheetWatermark({ size }: { size: number }) {
    return (
        <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
            <g>
                {petals12.map((d) => (
                    <path key={d} d="M60,58 C46,38 46,18 60,10 C74,18 74,38 60,58 Z" fill="#000" transform={`rotate(${d} 60 60)`} />
                ))}
            </g>
            <circle cx="60" cy="60" r="14" fill="#000" />
        </svg>
    );
}

/** Passport-style student portrait, 88x108 (ID card). */
function PhotoID() {
    return (
        <svg viewBox="0 0 88 108" width="88" height="108" aria-hidden="true">
            <rect width="88" height="108" fill="#EAF2F4" />
            <path d="M8,108 C8,84 26,74 44,74 C62,74 80,84 80,108 Z" fill="#3E63A6" />
            <rect x="37" y="60" width="14" height="18" rx="5" fill="#E0A578" />
            <circle cx="44" cy="44" r="21" fill="#EEB588" />
            <path d="M22,45 C22,27 66,27 66,45 C66,34 57,25 44,25 C31,25 22,33 22,45 Z" fill="#2B2016" />
            <circle cx="37" cy="45" r="2.3" fill="#3a281e" />
            <circle cx="51" cy="45" r="2.3" fill="#3a281e" />
            <path d="M38,53 Q44,58 50,53" stroke="#8a4e34" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
    );
}

/** Smaller portrait, 72x88 (hall ticket). */
function PhotoHall() {
    return (
        <svg viewBox="0 0 72 88" width="72" height="88" aria-hidden="true">
            <rect width="72" height="88" fill="#EAF2F4" />
            <path d="M6,88 C6,68 21,60 36,60 C51,60 66,68 66,88 Z" fill="#3E63A6" />
            <rect x="30" y="48" width="12" height="15" rx="4" fill="#E0A578" />
            <circle cx="36" cy="36" r="17" fill="#EEB588" />
            <path d="M18,37 C18,22 54,22 54,37 C54,28 47,21 36,21 C25,21 18,27 18,37 Z" fill="#2B2016" />
            <circle cx="30" cy="37" r="1.9" fill="#3a281e" />
            <circle cx="42" cy="37" r="1.9" fill="#3a281e" />
            <path d="M31,43 Q36,47 41,43" stroke="#8a4e34" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
    );
}

function IDCardPreview() {
    return (
        <div
            className="w-[360px] max-w-full rounded-[18px] overflow-hidden"
            style={{ background: '#fff', boxShadow: '0 24px 60px rgb(var(--night-ink-rgb) / 0.18)', border: '1px solid var(--border)' }}
        >
            <div className="flex items-center gap-[11px] px-4 py-3.5 text-white" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-2))' }}>
                <DocLogoWhite size={36} />
                <div style={{ lineHeight: 1.15 }}>
                    <div className="text-base" style={{ fontFamily: 'var(--font-display)' }}>Sunrise Public School</div>
                    <div className="text-[10px]" style={{ opacity: 0.85 }}>Student Identity Card · 2026–27</div>
                </div>
            </div>
            <div className="p-[18px] flex gap-4">
                <div className="w-[88px] h-[108px] rounded-[10px] overflow-hidden shrink-0" style={{ border: '1px solid #e2e2e2' }}>
                    <PhotoID />
                </div>
                <div className="flex-1 text-[12.5px] leading-[1.7]" style={{ color: '#333' }}>
                    <div className="font-extrabold text-[15px] mb-[7px]" style={{ color: '#111' }}>Aarav Sharma</div>
                    {[
                        ['Class', 'Grade 6 · A'],
                        ['Roll No.', '14'],
                        ['Admission', 'VVP-2291'],
                        ['Blood grp', 'B+'],
                        ['Valid till', 'Mar 2027'],
                    ].map(([k, v]) => (
                        <div key={k} className="flex justify-between" style={{ padding: '1px 0' }}>
                            <span style={{ color: '#999' }}>{k}</span>
                            <span className="font-semibold">{v}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-between px-[18px] pb-4">
                <div className="text-[9px]" style={{ color: '#aaa', fontFamily: 'monospace' }}>ID · VVP-2291-06A</div>
                <div
                    className="w-[52px] h-[52px] rounded-lg"
                    style={{ background: 'repeating-conic-gradient(#111 0 25%, #fff 0 50%) 50%/11px 11px' }}
                />
            </div>
        </div>
    );
}

function MarksheetPreview() {
    return (
        <div
            className="relative w-[440px] max-w-full rounded-[14px] overflow-hidden"
            style={{
                background: '#fffdf8',
                boxShadow: '0 24px 60px rgb(var(--night-ink-rgb) / 0.18)',
                border: '1px solid var(--border)',
                outline: '3px double rgb(var(--temple-stone-rgb) / 0.35)',
                outlineOffset: '-8px',
            }}
        >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.05 }}>
                <MarksheetWatermark size={220} />
            </div>

            <div className="relative flex items-center gap-3 px-5 py-[10px]" style={{ borderBottom: '2px solid var(--brand)' }}>
                <MarksheetLogo size={46} />
                <div className="flex-1 text-center" style={{ lineHeight: 1.2 }}>
                    <div className="text-[20px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand)' }}>Sunrise Public School</div>
                    <div className="text-[9px]" style={{ color: '#888' }}>Affiliated to CBSE · Affil. No. 2130456 · Lucknow, U.P.</div>
                    <div
                        className="inline-block mt-[5px] text-[10px] font-extrabold tracking-[0.1em] uppercase text-white px-3 py-0.5 rounded-full"
                        style={{ background: 'var(--brand)' }}
                    >
                        Statement of Marks
                    </div>
                </div>
            </div>

            <div className="relative grid grid-cols-2 gap-x-4 px-5 pt-[10px] pb-1.5 text-[11px]" style={{ color: '#555' }}>
                {[
                    ['Name', 'Aarav Sharma'],
                    ['Class', 'VI-A'],
                    ['Roll No.', '14'],
                    ['Adm No.', 'VVP-2291'],
                    ['Father', 'Rakesh Sharma'],
                    ['Session', '2026–27 · Term 2'],
                ].map(([k, v]) => (
                    <div key={k} className="flex justify-between" style={{ borderBottom: '1px dotted #ddd', padding: '2px 0' }}>
                        <span style={{ color: '#999' }}>{k}</span>
                        <span className="font-bold" style={{ color: '#111' }}>{v}</span>
                    </div>
                ))}
            </div>

            <div className="relative px-5 pt-2.5 pb-1.5">
                <div className="flex text-[9px] font-extrabold tracking-[0.04em] uppercase text-white rounded-t-[5px]" style={{ background: 'var(--brand)' }}>
                    <span className="flex-1 px-2.5 py-1.5">Subject</span>
                    <span className="w-11 text-center px-1 py-1.5" style={{ borderLeft: '1px solid rgba(255,255,255,0.25)' }}>Max</span>
                    <span className="w-11 text-center px-1 py-1.5" style={{ borderLeft: '1px solid rgba(255,255,255,0.25)' }}>Obt</span>
                    <span className="w-10 text-center px-1 py-1.5" style={{ borderLeft: '1px solid rgba(255,255,255,0.25)' }}>Gr</span>
                </div>
                {markRows.map((r) => (
                    <div key={r.sub} className="flex text-xs" style={{ color: '#222', borderBottom: '1px solid #eee', background: '#fff' }}>
                        <span className="flex-1 px-2.5 py-1.5">{r.sub}</span>
                        <span className="w-11 text-center px-1 py-1.5" style={{ color: '#888' }}>100</span>
                        <span className="w-11 text-center px-1 py-1.5 font-semibold">{r.mk}</span>
                        <span className="w-10 text-center px-1 py-1.5 font-bold" style={{ color: 'var(--brand)' }}>{r.gr}</span>
                    </div>
                ))}
                <div className="flex text-xs font-extrabold rounded-b-[5px]" style={{ color: '#111', background: 'rgb(var(--brand-rgb) / 0.09)' }}>
                    <span className="flex-1 px-2.5 py-[7px]">Total</span>
                    <span className="w-11 text-center px-1 py-[7px]">500</span>
                    <span className="w-11 text-center px-1 py-[7px]">442</span>
                    <span className="w-10 text-center px-1 py-[7px]" style={{ color: 'var(--brand)' }}>A1</span>
                </div>
            </div>

            <div className="relative flex justify-around mx-5 px-5 py-2 rounded-[10px] text-center" style={{ background: 'rgb(var(--brand-rgb) / 0.06)' }}>
                <div>
                    <div className="text-[18px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand)', lineHeight: 1 }}>88.4%</div>
                    <div className="text-[9px] uppercase tracking-[0.05em]" style={{ color: '#888' }}>Percentage</div>
                </div>
                <div style={{ borderLeft: '1px solid rgb(var(--temple-stone-rgb) / 0.3)' }} />
                <div>
                    <div className="text-[18px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--peacock)', lineHeight: 1 }}>9.2</div>
                    <div className="text-[9px] uppercase tracking-[0.05em]" style={{ color: '#888' }}>CGPA</div>
                </div>
                <div style={{ borderLeft: '1px solid rgb(var(--temple-stone-rgb) / 0.3)' }} />
                <div>
                    <div className="text-[18px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--deep-saffron)', lineHeight: 1 }}>PASS</div>
                    <div className="text-[9px] uppercase tracking-[0.05em]" style={{ color: '#888' }}>Result · Rank 3</div>
                </div>
            </div>

            <div className="relative flex justify-between items-end px-5 py-3.5">
                <div className="text-center text-[9px]" style={{ color: '#999' }}>
                    <div className="text-[15px] -rotate-3 mb-0.5" style={{ fontFamily: "'Yatra One', cursive", color: '#334' }}>S.Iyer</div>
                    <div className="pt-0.5 w-[90px]" style={{ borderTop: '1px solid #bbb' }}>Class Teacher</div>
                </div>
                <div
                    className="w-11 h-11 rounded-full -rotate-12 flex items-center justify-center text-[7px] font-extrabold text-center leading-[1.1]"
                    style={{ border: '2px solid rgb(var(--kumkum-rgb) / 0.5)', color: 'rgb(var(--kumkum-rgb) / 0.65)' }}
                >
                    SPS<br />VERIFIED
                </div>
                <div className="text-center text-[9px]" style={{ color: '#999' }}>
                    <div className="text-[15px] -rotate-3 mb-0.5" style={{ fontFamily: "'Yatra One', cursive", color: '#334' }}>R.Menon</div>
                    <div className="pt-0.5 w-[90px]" style={{ borderTop: '1px solid #bbb' }}>Principal</div>
                </div>
            </div>
        </div>
    );
}

function HallTicketPreview() {
    return (
        <div
            className="w-[440px] max-w-full rounded-[14px] overflow-hidden"
            style={{ background: '#fff', boxShadow: '0 24px 60px rgb(var(--night-ink-rgb) / 0.18)', border: '1px solid var(--border)' }}
        >
            <div className="flex items-center gap-3 px-[18px] py-3.5 text-white" style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-deep))' }}>
                <DocLogoWhite size={42} />
                <div className="flex-1" style={{ lineHeight: 1.2 }}>
                    <div className="text-[18px]" style={{ fontFamily: 'var(--font-display)' }}>Sunrise Public School</div>
                    <div className="text-[10px]" style={{ opacity: 0.85 }}>Admit Card · Annual Examination 2026</div>
                </div>
                <div className="text-[9px] font-extrabold tracking-[0.06em] uppercase px-[9px] py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.18)' }}>
                    Class VI
                </div>
            </div>
            <div className="flex gap-3.5 px-[18px] py-3.5" style={{ borderBottom: '1px solid #eee' }}>
                <div className="w-[72px] h-[88px] rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid #e2e2e2' }}>
                    <PhotoHall />
                </div>
                <div className="flex-1 text-xs leading-[1.55]" style={{ color: '#444' }}>
                    <div className="font-extrabold text-sm mb-[5px]" style={{ color: '#111' }}>Aarav Sharma</div>
                    {[
                        ['Roll No.', '14'],
                        ['Adm No.', 'VVP-2291'],
                        ['Centre', 'Main Block · R-204'],
                    ].map(([k, v]) => (
                        <div key={k} className="flex justify-between" style={{ borderBottom: '1px dotted #ddd', padding: '1px 0' }}>
                            <span style={{ color: '#999' }}>{k}</span>
                            <span className="font-semibold">{v}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="px-[18px] pt-1.5 pb-3.5">
                <div className="flex justify-between text-[10px] font-extrabold tracking-[0.06em] uppercase py-2" style={{ color: '#999', borderBottom: '1px solid #eee' }}>
                    <span>Date</span>
                    <span>Paper</span>
                    <span>Time</span>
                </div>
                {hallRows.map((r) => (
                    <div key={r.d} className="flex justify-between text-[12.5px] py-2" style={{ color: '#333', borderBottom: '1px solid #f2f2f2' }}>
                        <span className="w-[62px] font-semibold">{r.d}</span>
                        <span className="flex-1">{r.p}</span>
                        <span style={{ color: '#666' }}>{r.t}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-end px-[18px] pb-4">
                <div className="text-[9px] max-w-[210px] leading-[1.4]" style={{ color: '#aaa' }}>
                    Bring this admit card to every paper. Electronic devices are prohibited in the hall.
                </div>
                <div className="text-center text-[9px]" style={{ color: '#999' }}>
                    <div className="text-sm -rotate-3" style={{ fontFamily: "'Yatra One', cursive", color: '#334' }}>R.Menon</div>
                    <div className="pt-0.5 w-[86px]" style={{ borderTop: '1px solid #bbb' }}>Controller</div>
                </div>
            </div>
        </div>
    );
}

export default function DocumentStudio() {
    const [docType, setDocType] = useState<DocType>('ID Card');

    return (
        <section id="documents" className="px-[clamp(16px,4vw,28px)] py-[clamp(64px,9vw,110px)]" style={{ background: 'var(--surface)' }}>
            <div className="max-w-[960px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-[680px] mx-auto mb-9"
                >
                    <span className="text-xs font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--lotus-pink)' }}>
                        Document Studio
                    </span>
                    <h2
                        className="my-3.5 leading-[1.1] text-[clamp(30px,5.2vw,52px)]"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                    >
                        Every document, generated in one click
                    </h2>
                    <p className="leading-[1.6] text-[clamp(15px,2vw,19px)] [text-wrap:pretty]" style={{ color: 'var(--text2)' }}>
                        Pick a document type — Vidyaverse renders it from your institution&apos;s template, branding and
                        live student data. Ready to print or send.
                    </p>
                </motion.div>

                {/* Segmented control */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="flex justify-center flex-wrap gap-2 mb-[34px]"
                >
                    {docTypes.map((t) => (
                        <button
                            key={t}
                            onClick={() => setDocType(t)}
                            className="px-[22px] py-2.5 rounded-full font-bold text-[13.5px] cursor-pointer transition-all duration-200"
                            style={{
                                background: docType === t ? 'var(--brand)' : 'var(--elevated)',
                                color: docType === t ? '#fff' : 'var(--text2)',
                                border: `1px solid ${docType === t ? 'var(--brand)' : 'var(--border)'}`,
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </motion.div>

                {/* Live preview */}
                <motion.div
                    key={docType}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="flex justify-center"
                >
                    {docType === 'ID Card' && <IDCardPreview />}
                    {docType === 'Marksheet' && <MarksheetPreview />}
                    {docType === 'Hall Ticket' && <HallTicketPreview />}
                </motion.div>
            </div>
        </section>
    );
}
