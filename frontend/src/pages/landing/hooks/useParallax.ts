import { useState, useEffect, useCallback, RefObject } from 'react';

interface ParallaxState {
    rotateX: number;
    rotateY: number;
    x: number;
    y: number;
}

export function useParallax(
    ref: RefObject<HTMLElement | null>,
    sensitivity: number = 20
): ParallaxState {
    const [state, setState] = useState<ParallaxState>({ rotateX: 0, rotateY: 0, x: 0, y: 0 });

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const x = ((e.clientX - centerX) / (rect.width / 2));
            const y = ((e.clientY - centerY) / (rect.height / 2));

            setState({
                rotateX: -y * sensitivity,
                rotateY: x * sensitivity,
                x: x * (sensitivity / 2),
                y: y * (sensitivity / 2),
            });
        },
        [ref, sensitivity]
    );

    const handleMouseLeave = useCallback(() => {
        setState({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        window.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [ref, handleMouseMove, handleMouseLeave]);

    return state;
}
