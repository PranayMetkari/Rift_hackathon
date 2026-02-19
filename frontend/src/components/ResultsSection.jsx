import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RiskCard from './RiskCard';

// Animated number count-up
const AnimatedCount = ({ target }) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (target === 0) return;
        let cur = 0;
        const step = Math.max(1, Math.floor(target / 18));
        const t = setInterval(() => {
            cur = Math.min(cur + step, target);
            setVal(cur);
            if (cur >= target) clearInterval(t);
        }, 55);
        return () => clearInterval(t);
    }, [target]);
    return <span>{val}</span>;
};

// Risk badge colors (matching CSS variables)
const getRiskColor = (label) => {
    if (!label) return '#60A5FA';
    const l = label.toLowerCase();
    if (l.includes('high') || l.includes('toxic') || l.includes('poor')) return '#F87171';
    if (l.includes('adjust') || l.includes('warn') || l.includes('intermediate')) return '#FCD34D';
    return '#34D399';
};

const getRiskBg = (label) => {
    if (!label) return 'rgba(59,130,246,0.14)';
    const l = label.toLowerCase();
    if (l.includes('high') || l.includes('toxic') || l.includes('poor')) return 'rgba(248,113,113,0.14)';
    if (l.includes('adjust') || l.includes('warn') || l.includes('intermediate')) return 'rgba(252,211,77,0.12)';
    return 'rgba(52,211,153,0.12)';
};

const ResultsSection = ({ results }) => {
    if (!results?.length) return null;
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const highRisk = results.filter(r => {
        const l = (r.label || '').toLowerCase();
        return l.includes('high') || l.includes('toxic') || l.includes('poor');
    });
    const warnRisk = results.filter(r => {
        const l = (r.label || '').toLowerCase();
        return l.includes('adjust') || l.includes('warn') || l.includes('intermediate');
    });
    const safeRisk = results.filter(r => {
        const l = (r.label || '').toLowerCase();
        return !l.includes('high') && !l.includes('toxic') && !l.includes('poor') && !l.includes('adjust') && !l.includes('warn') && !l.includes('intermediate');
    });

    return (
        <div style={{ paddingBottom: 40 }}>
            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 12,
                    marginBottom: 28,
                    paddingBottom: 20,
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <motion.div
                            animate={{ boxShadow: ['0 0 4px rgba(52,211,153,0.5)', '0 0 10px rgba(52,211,153,0.9)', '0 0 4px rgba(52,211,153,0.5)'] }}
                            transition={{ repeat: Infinity, duration: 1.8 }}
                            style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399', flexShrink: 0 }}
                        />
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#34D399', fontFamily: "'JetBrains Mono',monospace" }}>
                            Analysis Complete
                        </div>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.2 }}>
                        Risk Assessment Results
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 5, fontFamily: "'Inter',sans-serif" }}>
                        <AnimatedCount target={results.length} /> drug{results.length > 1 ? 's' : ''} analyzed · {date}
                    </div>
                </div>

                {/* Summary badges with count-up */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {highRisk.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.14)', border: '1px solid rgba(248,113,113,0.4)' }}
                        >
                            <motion.div
                                animate={{ boxShadow: ['0 0 6px rgba(248,113,113,0.4)', '0 0 12px rgba(248,113,113,0.8)', '0 0 6px rgba(248,113,113,0.4)'] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                style={{ width: 9, height: 9, borderRadius: '50%', background: '#F87171' }}
                            />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#FCA5A5' }}><AnimatedCount target={highRisk.length} /> High Risk</span>
                        </motion.div>
                    )}
                    {warnRisk.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: 'rgba(252,211,77,0.12)', border: '1px solid rgba(252,211,77,0.4)' }}
                        >
                            <motion.div
                                animate={{ boxShadow: ['0 0 6px rgba(252,211,77,0.4)', '0 0 12px rgba(252,211,77,0.8)', '0 0 6px rgba(252,211,77,0.4)'] }}
                                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                                style={{ width: 9, height: 9, borderRadius: '50%', background: '#FCD34D' }}
                            />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#FDE68A' }}><AnimatedCount target={warnRisk.length} /> Dose Adjust</span>
                        </motion.div>
                    )}
                    {safeRisk.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.4)' }}
                        >
                            <motion.div
                                animate={{ boxShadow: ['0 0 6px rgba(52,211,153,0.4)', '0 0 12px rgba(52,211,153,0.8)', '0 0 6px rgba(52,211,153,0.4)'] }}
                                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                                style={{ width: 9, height: 9, borderRadius: '50%', background: '#34D399' }}
                            />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#6EE7B7' }}><AnimatedCount target={safeRisk.length} /> Safe</span>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* ── Summary Table ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                style={{
                    background: 'var(--card-bg, rgba(15,23,42,0.7))',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    marginBottom: 32,
                    backdropFilter: 'blur(10px)',
                }}
            >
                <div style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    background: 'rgba(30,41,59,0.5)',
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#93C5FD', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                        Results Summary
                    </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: 'rgba(30,41,59,0.4)' }}>
                                {['Drug', 'Drug Class', 'Gene', 'Diplotype', 'Phenotype', 'Risk Level', 'Severity', 'Evidence', 'Confidence'].map(col => (
                                    <th key={col} style={{
                                        padding: '10px 16px',
                                        textAlign: 'left',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        letterSpacing: '0.8px',
                                        textTransform: 'uppercase',
                                        color: '#94A3B8',
                                        fontFamily: "'JetBrains Mono',monospace",
                                        borderBottom: '1px solid var(--border)',
                                        whiteSpace: 'nowrap',
                                        background: 'rgba(15,23,42,0.6)',
                                    }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => {
                                const rColor = getRiskColor(r.label);
                                const rBg = getRiskBg(r.label);
                                return (
                                    <tr
                                        key={i}
                                        style={{
                                            borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.07)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#E2E8F0', whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                                            {r.drug || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#94A3B8', fontSize: 12, whiteSpace: 'nowrap' }}>
                                            {r.drugClass || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#60A5FA', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, whiteSpace: 'nowrap' }}>
                                            {r.gene || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#A78BFA', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, whiteSpace: 'nowrap' }}>
                                            {r.diplotype || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#CBD5E1', fontSize: 12 }}>
                                            {r.phenotype || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '4px 10px', borderRadius: 6,
                                                background: rBg,
                                                border: `1px solid ${rColor}70`,
                                                color: rColor,
                                                fontSize: 12, fontWeight: 700,
                                            }}>
                                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: rColor, display: 'inline-block', flexShrink: 0 }} />
                                                {r.label || '—'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#CBD5E1', fontSize: 12, whiteSpace: 'nowrap' }}>
                                            {r.severity || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#34D399', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, whiteSpace: 'nowrap' }}>
                                            {r.cpicLevel || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    flex: 1, height: 5, borderRadius: 99,
                                                    background: 'rgba(255,255,255,0.1)',
                                                    minWidth: 60, overflow: 'hidden',
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${((r.confidence || 0) * 100).toFixed(0)}%`,
                                                        background: `linear-gradient(90deg, ${rColor}, ${rColor}99)`,
                                                        borderRadius: 99,
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: rColor, fontFamily: "'JetBrains Mono',monospace", minWidth: 32 }}>
                                                    {((r.confidence || 0) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ── Section label with animated line ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#64748B', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>
                    Detailed Analysis
                </div>
                <motion.div
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--border),transparent)' }}
                />
                <span style={{ fontSize: 11, color: '#475569', fontFamily: "'JetBrains Mono',monospace" }}>
                    {results.length} result{results.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* ── Detailed Cards Grid — staggered entrance ── */}
            <div className="results-grid">
                {results.map((r, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <RiskCard result={r} index={i} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ResultsSection;
