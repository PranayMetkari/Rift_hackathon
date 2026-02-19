import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    { gene: 'CYP2D6', task: 'Scanning metabolizer variants…' },
    { gene: 'CYP2C9', task: 'Evaluating warfarin sensitivity…' },
    { gene: 'VKORC1', task: 'Checking coagulation markers…' },
    { gene: 'CYP2C19', task: 'Mapping clopidogrel response…' },
    { gene: 'TPMT', task: 'Assessing thiopurine activity…' },
    { gene: 'DPYD', task: 'Checking fluoropyrimidine risk…' },
    { gene: 'SLCO1B1', task: 'Scanning statin transport genes…' },
    { gene: 'NUDT15', task: 'Finalising risk classification…' },
];

const LOGS = [
    '> Initialising pharmacogenomic engine v3.2…',
    '> Loading CPIC guideline database…',
    '> Parsing VCF variant records…',
    '> Cross-referencing PharmGKB annotations…',
    '> Running diplotype inference…',
    '> Applying Bayesian confidence model…',
    '> Generating clinical recommendations…',
    '> Analysis complete ✓',
];

/**
 * AnalysisLoader — full-screen overlay shown while analysis is running.
 * Shows gene scanner, animated progress, and scrolling terminal logs.
 */
export default function AnalysisLoader() {
    const [stepIdx, setStepIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [visibleLogs, setVisibleLogs] = useState([LOGS[0]]);

    useEffect(() => {
        // Cycle gene steps
        const stepTimer = setInterval(() => {
            setStepIdx(i => (i + 1) % STEPS.length);
        }, 700);

        // Drive smooth progress bar
        let pct = 0;
        const progTimer = setInterval(() => {
            pct = Math.min(pct + Math.random() * 3.5 + 1, 97);
            setProgress(pct);
        }, 180);

        // Add log lines progressively
        LOGS.forEach((_, i) => {
            if (i === 0) return;
            setTimeout(() => {
                setVisibleLogs(l => [...l, LOGS[i]]);
            }, i * 700);
        });

        return () => {
            clearInterval(stepTimer);
            clearInterval(progTimer);
        };
    }, []);

    const current = STEPS[stepIdx];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 300,
                background: 'rgba(9,14,26,0.97)',
                backdropFilter: 'blur(16px)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 36, padding: 32,
            }}
        >
            {/* Animated orb cluster */}
            <div style={{ position: 'relative', width: 140, height: 140 }}>
                {[0, 1, 2, 3].map(i => (
                    <motion.div
                        key={i}
                        animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.05, 1] }}
                        transition={{
                            rotate: { duration: 2.2 - i * 0.3, ease: 'linear', repeat: Infinity },
                            scale: { duration: 1.8, repeat: Infinity, delay: i * 0.3 },
                        }}
                        style={{
                            position: 'absolute',
                            inset: i * 14,
                            borderRadius: '50%',
                            border: `2px solid ${['#3B82F6', '#A78BFA', '#34D399', '#FCD34D'][i]}`,
                            boxShadow: `0 0 14px ${['rgba(59,130,246,0.5)', 'rgba(167,139,250,0.5)', 'rgba(52,211,153,0.5)', 'rgba(252,211,77,0.5)'][i]}`,
                        }}
                    />
                ))}
                {/* Pulsing centre dot */}
                <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'radial-gradient(circle, #93C5FD, #3B82F6)',
                        boxShadow: '0 0 28px rgba(59,130,246,0.9)',
                    }} />
                </motion.div>
            </div>

            {/* Title + active gene */}
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 22, fontWeight: 700, color: '#E2E8F0',
                    marginBottom: 10, letterSpacing: '-0.3px',
                }}>
                    Analysing Genomic Profile
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.gene}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                    >
                        <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 13, fontWeight: 700, color: '#60A5FA',
                            background: 'rgba(59,130,246,0.15)',
                            border: '1px solid rgba(59,130,246,0.35)',
                            padding: '3px 10px', borderRadius: 6,
                        }}>
                            {current.gene}
                        </span>
                        <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 12.5, color: '#64748B',
                        }}>
                            {current.task}
                        </span>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div style={{ width: 320 }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 8,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11, color: '#475569',
                }}>
                    <span>Genomic Analysis</span>
                    <span style={{ color: '#60A5FA' }}>{progress.toFixed(0)}%</span>
                </div>
                <div style={{
                    height: 4, background: '#1E293B', borderRadius: 99, overflow: 'hidden',
                }}>
                    <motion.div
                        style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #3B82F6, #A78BFA, #34D399)',
                            borderRadius: 99,
                            boxShadow: '0 0 12px rgba(59,130,246,0.7)',
                        }}
                        transition={{ ease: 'linear' }}
                    />
                </div>
            </div>

            {/* Terminal log */}
            <div style={{
                width: 380, maxWidth: '90vw',
                background: '#0D1626',
                border: '1px solid #1E293B',
                borderRadius: 10,
                overflow: 'hidden',
                fontFamily: "'JetBrains Mono', monospace",
            }}>
                <div style={{
                    padding: '8px 14px',
                    background: '#111827',
                    borderBottom: '1px solid #1E293B',
                    display: 'flex', alignItems: 'center', gap: 7,
                }}>
                    {['#F87171', '#FCD34D', '#34D399'].map(c => (
                        <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.8 }} />
                    ))}
                    <span style={{ fontSize: 11, color: '#475569', marginLeft: 4 }}>sanjeevani-engine — analysis</span>
                </div>
                <div style={{
                    padding: '12px 14px',
                    maxHeight: 120,
                    overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                    {visibleLogs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                fontSize: 11.5, color: i === visibleLogs.length - 1 ? '#93C5FD' : '#475569',
                                lineHeight: 1.6,
                            }}
                        >
                            {log}
                        </motion.div>
                    ))}
                    {/* Blinking cursor */}
                    <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        style={{ fontSize: 12, color: '#3B82F6', lineHeight: 1 }}
                    >
                        ▋
                    </motion.span>
                </div>
            </div>
        </motion.div>
    );
}
