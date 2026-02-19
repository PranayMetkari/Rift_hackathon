import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

/**
 * TiltCard — wraps children with interactive 3D mouse-tracking perspective tilt.
 * Uses framer-motion springs for ultra-smooth feel.
 */
const TiltCard = ({ children, className, style, strength = 10 }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-0.5, 0.5], [strength, -strength]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-strength, strength]);

    const springCfg = { stiffness: 180, damping: 22, mass: 0.5 };
    const sRotateX = useSpring(rotateX, springCfg);
    const sRotateY = useSpring(rotateY, springCfg);

    // Sheen highlight follows cursor
    const sheenX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
    const sheenY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);

    const handleMouse = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            style={{
                rotateX: sRotateX,
                rotateY: sRotateY,
                transformStyle: 'preserve-3d',
                transformPerspective: 900,
                position: 'relative',
                ...style,
            }}
            className={className}
        >
            {children}

            {/* Sheen overlay */}
            <motion.div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    background: 'radial-gradient(circle at var(--sx) var(--sy), rgba(255,255,255,0.07) 0%, transparent 65%)',
                    '--sx': sheenX,
                    '--sy': sheenY,
                    zIndex: 1,
                }}
            />
        </motion.div>
    );
};

export default TiltCard;
