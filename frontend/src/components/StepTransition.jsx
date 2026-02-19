import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
    'Initialising genomic parser…',
    'Reading variant call format…',
    'Mapping allele frequencies…',
    'Running pharmacogene lookup…',
    'Applying CPIC guidelines…',
    'Generating risk classification…',
];

const COLORS = ['#3B82F6', '#A78BFA', '#34D399', '#FCD34D', '#F87171', '#60A5FA'];

export default function StepTransition({ label = 'Loading…', onDone }) {
    const [progress, setProgress] = useState(0);
    const [textIndex, setTextIndex] = useState(0);
    const [burst, setBurst] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const msgTimer = setInterval(() => {
            setTextIndex(i => Math.min(i + 1, MESSAGES.length - 1));
        }, 500);

        let pct = 0;
        const progTimer = setInterval(() => {
            pct += Math.random() * 12 + 3;
            if (pct >= 100) {
                pct = 100;
                clearInterval(progTimer);
                // Show particle burst just before done
                setTimeout(() => setBurst(true), 100);
            }
            setProgress(Math.min(pct, 100));
        }, 90);

        const done = setTimeout(onDone, 2400);

        return () => {
            clearInterval(msgTimer);
            clearInterval(progTimer);
            clearTimeout(done);
        };
    }, []);

    // Generate particles on burst
    const particles = Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * 360;
        const dist = 60 + Math.random() * 60;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;
        const color = COLORS[i % COLORS.length];
        return { tx, ty, color, delay: Math.random() * 0.15 };
    });

    return (
        <AnimatePresence>
            <motion.div
                key="step-transition"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: 'rgba(9,14,26,0.97)',
                    backdropFilter: 'blur(14px)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 28,
                }}
            >
                {/* Spinning rings + particle burst origin */}
                <div ref={containerRef} style={{ position: 'relative', width: 130, height: 130 }}>
                    {[0, 1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                            transition={{ duration: 1.8 - i * 0.18, ease: 'linear', repeat: Infinity, delay: i * 0.1 }}
                            style={{
                                position: 'absolute',
                                inset: i * 10,
                                borderRadius: '50%',
                                border: `2.5px solid ${COLORS[i]}`,
                                boxShadow: `0 0 14px ${COLORS[i]}88`,
                                transformStyle: 'preserve-3d',
                            }}
                        />
                    ))}
                    {/* Centre glow */}
                    <motion.div
                        animate={{ scale: [1, 1.35, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                            position: 'absolute', inset: 0, margin: 'auto',
                            width: 20, height: 20, borderRadius: '50%',
                            background: 'radial-gradient(circle, #93C5FD, #3B82F6)',
                            boxShadow: '0 0 24px rgba(59,130,246,0.9)',
                            top: 'calc(50% - 10px)', left: 'calc(50% - 10px)',
                        }}
                    />
                    {/* Particle burst */}
                    {burst && particles.map((p, i) => (
                        <div
                            key={i}
                            className="particle"
                            style={{
                                '--tx': `${p.tx}px`,
                                '--ty': `${p.ty}px`,
                                background: p.color,
                                boxShadow: `0 0 6px ${p.color}`,
                                top: 'calc(50% - 3px)',
                                left: 'calc(50% - 3px)',
                                animationDelay: `${p.delay}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Text */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 21, fontWeight: 700, color: '#E2E8F0',
                        marginBottom: 10, letterSpacing: '-0.3px',
                    }}>
                        {label}
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={textIndex}
                            initial={{ opacity: 0, y: 7 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -7 }}
                            transition={{ duration: 0.22 }}
                            style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 12.5, color: '#64748B', letterSpacing: '0.3px',
                            }}
                        >
                            {MESSAGES[textIndex]}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Progress bar */}
                <div style={{ width: 280, height: 3, background: '#1E293B', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                        style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #3B82F6, #A78BFA, #34D399)',
                            borderRadius: 99,
                            boxShadow: '0 0 10px rgba(59,130,246,0.7)',
                        }}
                        transition={{ ease: 'linear' }}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
