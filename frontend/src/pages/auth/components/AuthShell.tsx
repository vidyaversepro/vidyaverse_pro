import { ReactNode } from 'react';
import { MandalaMark } from '@/design/indic/motifs/mandala-mark';

const BRAND_POINTS = [
    '47 modules, one login',
    'WhatsApp-first parent communication',
    'ID cards & marksheets in seconds',
];

interface AuthShellProps {
    /** Small icon shown above the heading on status screens (sent/success/error). */
    statusIcon?: ReactNode;
    statusTone?: string;
    statusBg?: string;
    heading: ReactNode;
    sub: ReactNode;
    /** Optional card (e.g. institution/admin-email summary) between sub and children. */
    infoCard?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
}

/**
 * Shared split-screen frame for every auth page: desktop shows a dark
 * `indic-auth-aside` brand panel beside the form; phone/tablet collapse to a
 * single full-screen column with a compact mandala + wordmark header.
 * Matches design_handoff_app_upgrade/reference/Auth Pages.dc.html.
 */
export function AuthShell({ statusIcon, statusTone, statusBg, heading, sub, infoCard, children, footer }: AuthShellProps) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-background">
            <div className="indic-auth-aside relative hidden lg:flex flex-col justify-between w-[44%] flex-shrink-0 overflow-hidden p-10 text-white">
                <div
                    className="absolute -top-[10%] -right-[14%] opacity-[0.16] pointer-events-none"
                    style={{ width: 'min(90%,460px)', aspectRatio: '1' }}
                    aria-hidden="true"
                >
                    <MandalaMark size={460} spin />
                </div>

                <div className="relative flex items-center gap-3">
                    <span className="inline-flex overflow-hidden rounded-full" style={{ width: 34, height: 34 }}>
                        <MandalaMark size={34} />
                    </span>
                    <span className="text-[22px]" style={{ fontFamily: 'var(--font-display)' }}>Vidyaverse</span>
                </div>

                <div className="relative">
                    <h2 className="text-[30px] leading-[1.25] tracking-[0.3px]">
                        The operating system for modern institutions
                    </h2>
                    <p className="font-deva text-base opacity-80 mt-3">विद्या · एक मंच, समग्र संस्थान</p>
                    <div className="flex flex-col gap-3 mt-6">
                        {BRAND_POINTS.map((point) => (
                            <div key={point} className="flex items-center gap-[11px] text-sm font-medium opacity-95">
                                <span className="w-6 h-6 rounded-lg bg-white/[0.16] flex items-center justify-center flex-shrink-0">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12l4 4 10-11" />
                                    </svg>
                                </span>
                                {point}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative text-[12.5px] opacity-70 font-semibold">
                    Trusted by 240+ institutions across India
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-auto min-w-0">
                <div className="flex lg:hidden flex-col items-center gap-2 pt-9 px-5 pb-1.5">
                    <span className="inline-flex overflow-hidden rounded-full" style={{ width: 52, height: 52 }}>
                        <MandalaMark size={52} />
                    </span>
                    <span className="text-xl text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Vidyaverse</span>
                </div>

                <div className="flex-1 flex flex-col justify-center px-5 py-8 sm:px-10">
                    <div className="w-full max-w-[392px] mx-auto indic-rise">
                        {statusIcon && (
                            <div
                                className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center mb-[18px]"
                                style={{ color: statusTone, background: statusBg }}
                            >
                                {statusIcon}
                            </div>
                        )}

                        <h1 className="text-[27px] leading-[1.2] text-foreground">{heading}</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-[7px] leading-[1.5]">{sub}</p>

                        {infoCard && <div className="mt-5">{infoCard}</div>}

                        <div className="mt-[22px]">{children}</div>

                        {footer && (
                            <div className="mt-5 text-center text-[13.5px] text-muted-foreground">{footer}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
