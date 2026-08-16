import React, { useMemo } from 'react';

interface RulerProps {
    orientation: 'horizontal' | 'vertical';
    /** Total length in px (before zoom) */
    lengthPx: number;
    /** mm-to-px conversion factor */
    mmToPx: number;
    /** Zoom scale (e.g. 0.85) */
    zoomScale: number;
}

const RULER_THICKNESS = 22;
const RULER_BG = 'hsl(var(--card) / 0.92)';
const RULER_BORDER = 'hsl(var(--border))';
const RULER_MINOR_TICK = 'hsl(var(--muted-foreground) / 0.5)';
const RULER_LABEL = 'hsl(var(--muted-foreground))';

/**
 * Renders a mm-based ruler with major (10 mm) and minor (5 mm) tick marks.
 * Designed to be absolutely-positioned around the canvas container. Plain
 * inline SVG (not Konva canvas), so it can reference CSS custom properties
 * directly — unlike the Konva-rendered grid guide, which cannot.
 */
export function Ruler({ orientation, lengthPx, mmToPx, zoomScale }: RulerProps) {
    const scaledLength = lengthPx * zoomScale;
    const scaledMmPx = mmToPx * zoomScale;
    const isHorizontal = orientation === 'horizontal';

    const ticks = useMemo(() => {
        const result: React.ReactNode[] = [];
        const totalMm = Math.ceil(lengthPx / mmToPx);

        for (let mm = 0; mm <= totalMm; mm++) {
            const pos = mm * scaledMmPx;
            if (pos > scaledLength) break;

            const isMajor = mm % 10 === 0;
            const isMid = mm % 5 === 0 && !isMajor;

            const tickHeight = isMajor ? 10 : isMid ? 6 : 3;
            const showLabel = isMajor && mm > 0;

            if (isHorizontal) {
                result.push(
                    <React.Fragment key={mm}>
                        <line
                            x1={pos} y1={RULER_THICKNESS}
                            x2={pos} y2={RULER_THICKNESS - tickHeight}
                            stroke={isMajor ? 'hsl(var(--primary))' : RULER_MINOR_TICK}
                            strokeWidth={isMajor ? 0.8 : 0.5}
                        />
                        {showLabel && (
                            <text
                                x={pos + 2}
                                y={RULER_THICKNESS - tickHeight - 1}
                                fontSize={8}
                                fontWeight={600}
                                fill={RULER_LABEL}
                            >
                                {mm}
                            </text>
                        )}
                    </React.Fragment>
                );
            } else {
                result.push(
                    <React.Fragment key={mm}>
                        <line
                            x1={RULER_THICKNESS} y1={pos}
                            x2={RULER_THICKNESS - tickHeight} y2={pos}
                            stroke={isMajor ? 'hsl(var(--primary))' : RULER_MINOR_TICK}
                            strokeWidth={isMajor ? 0.8 : 0.5}
                        />
                        {showLabel && (
                            <text
                                x={1}
                                y={pos + 3}
                                fontSize={8}
                                fontWeight={600}
                                fill={RULER_LABEL}
                                writingMode="tb"
                            >
                                {mm}
                            </text>
                        )}
                    </React.Fragment>
                );
            }
        }
        return result;
    }, [lengthPx, mmToPx, scaledMmPx, scaledLength, isHorizontal]);

    if (isHorizontal) {
        return (
            <svg
                width={scaledLength}
                height={RULER_THICKNESS}
                className="absolute top-0 left-0 pointer-events-none select-none"
                style={{ marginLeft: RULER_THICKNESS }}
            >
                {/* Ruler background */}
                <rect width={scaledLength} height={RULER_THICKNESS} fill={RULER_BG} />
                {/* Bottom border */}
                <line x1={0} y1={RULER_THICKNESS - 0.5} x2={scaledLength} y2={RULER_THICKNESS - 0.5} stroke={RULER_BORDER} strokeWidth={1} />
                {ticks}
            </svg>
        );
    }

    return (
        <svg
            width={RULER_THICKNESS}
            height={scaledLength}
            className="absolute top-0 left-0 pointer-events-none select-none"
            style={{ marginTop: RULER_THICKNESS }}
        >
            {/* Ruler background */}
            <rect width={RULER_THICKNESS} height={scaledLength} fill={RULER_BG} />
            {/* Right border */}
            <line x1={RULER_THICKNESS - 0.5} y1={0} x2={RULER_THICKNESS - 0.5} y2={scaledLength} stroke={RULER_BORDER} strokeWidth={1} />
            {ticks}
        </svg>
    );
}

/** Corner square that fills the top-left gap between horizontal and vertical rulers */
export function RulerCorner() {
    return (
        <div
            className="absolute top-0 left-0 pointer-events-none"
            style={{
                width: RULER_THICKNESS,
                height: RULER_THICKNESS,
                background: RULER_BG,
                borderRight: `1px solid ${RULER_BORDER}`,
                borderBottom: `1px solid ${RULER_BORDER}`,
                zIndex: 2,
            }}
        />
    );
}

export const RULER_SIZE = RULER_THICKNESS;
