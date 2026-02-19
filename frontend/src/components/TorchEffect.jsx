import { useEffect, useRef, useState } from 'react';

/**
 * TorchEffect — full-page radial spotlight that follows mouse/touch.
 * Rendered as a fixed overlay with pointer-events: none so it never
 * blocks any interactions.
 */
export default function TorchEffect() {
    const [pos, setPos] = useState({ x: -999, y: -999 });
    const [visible, setVisible] = useState(false);
    const idleTimer = useRef(null);

    useEffect(() => {
        const resetIdle = () => {
            setVisible(true);
            clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(() => setVisible(false), 3000);
        };

        const onMove = (e) => {
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            setPos({ x, y });
            resetIdle();
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('touchmove', onMove);
            clearTimeout(idleTimer.current);
        };
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 4,
                opacity: visible ? 1 : 0,
                transition: 'opacity 1.2s ease',
                background: `radial-gradient(circle 320px at ${pos.x}px ${pos.y}px,
                    rgba(59,130,246,0.11) 0%,
                    rgba(99,102,241,0.06) 35%,
                    transparent 70%)`,
            }}
        />
    );
}
