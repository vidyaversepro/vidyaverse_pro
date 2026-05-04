import { useState, useEffect, useRef } from 'react';

export function useCountUp(
    end: number,
    duration: number = 2000,
    startOnView: boolean = true
): { value: number; ref: React.RefObject<HTMLElement | null> } {
    const [value, setValue] = useState(0);
    const [started, setStarted] = useState(false);
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!startOnView) {
            setStarted(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started) {
                    setStarted(true);
                }
            },
            { threshold: 0.3 }
        );

        const el = elementRef.current;
        if (el) observer.observe(el);

        return () => {
            if (el) observer.unobserve(el);
        };
    }, [startOnView, started]);

    useEffect(() => {
        if (!started) return;

        let startTime: number;
        let animationFrame: number;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(step);
            }
        };

        animationFrame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrame);
    }, [started, end, duration]);

    return { value, ref: elementRef };
}
