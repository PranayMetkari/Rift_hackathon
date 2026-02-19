import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LETTERS = 'Sanjeevani'.split('');

/**
 * SplashScreen — plays once on app load, then dissolves.
 * Calls onDone() after ~1.8s.
 */
export default function SplashScreen({ onDone }) {
    const [phase, setPhase] = useState('in'); // 'in' | 'hold' | 'out'

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 800);
        const t2 = setTimeout(() => setPhase('out'), 1400);
        const t3 = setTimeout(onDone, 1900);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    return (
        <AnimatePresence>
            {phase !== 'out' && (
                <motion.div
                    key="splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.5, ease: 'easeIn' }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: '#0F172A',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 28,
                    }}
                >
                    {/* DNA ring spinner */}
                    <div style={{ position: 'relative', width: 88, height: 88 }}>
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                                transition={{ duration: 1.6 - i * 0.25, ease: 'linear', repeat: Infinity }}
                                style={{
                                    position: 'absolute',
                                    inset: i * 12,
                                    borderRadius: '50%',
                                    border: `2px solid ${['#3B82F6', '#A78BFA', '#34D399'][i]}`,
                                    boxShadow: `0 0 10px ${['rgba(59,130,246,0.55)', 'rgba(167,139,250,0.55)', 'rgba(52,211,153,0.55)'][i]}`,
                                }}
                            />
                        ))}
                        <motion.div
                            animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <div style={{
                                width: 14, height: 14, borderRadius: '50%',
                                background: 'radial-gradient(circle, #93C5FD, #3B82F6)',
                                boxShadow: '0 0 18px rgba(59,130,246,0.9)',
                            }} />
                        </motion.div>
                    </div>

                    {/* Letter-by-letter brand name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {LETTERS.map((ch, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.055 + 0.1, duration: 0.35, ease: 'easeOut' }}
                                style={{
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    fontSize: 30, fontWeight: 700,
                                    background: 'linear-gradient(90deg, #E2E8F0, #93C5FD)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    letterSpacing: '-0.3px',
                                    display: 'inline-block',
                                }}
                            >
                                {ch}
                            </motion.span>
                        ))}
                        <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.75, duration: 0.4 }}
                            style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: 30, fontWeight: 700,
                                color: '#60A5FA',
                                marginLeft: 6,
                            }}
                        >
                            AI
                        </motion.span>
                    </div>

                    {/* Tagline */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.85, duration: 0.5 }}
                        style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 11.5, color: '#475569',
                            letterSpacing: '2px', textTransform: 'uppercase',
                        }}
                    >
                        AI-Powered Pharmacogenomics
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
