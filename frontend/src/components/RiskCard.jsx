import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── colour helpers ────────────────────────────────────────────────────────────
const getRiskColor = (label) => {
    if (!label) return '#3B82F6';
    const l = label.toLowerCase();
    if (l.includes('high') || l.includes('toxic') || l.includes('poor')) return '#F87171';
    if (l.includes('adjust') || l.includes('warn') || l.includes('intermediate')) return '#FCD34D';
    return '#34D399';
};

const getRiskBg = (label) => {
    if (!label) return 'rgba(59,130,246,0.12)';
    const l = label.toLowerCase();
    if (l.includes('high') || l.includes('toxic') || l.includes('poor')) return 'rgba(248,113,113,0.12)';
    if (l.includes('adjust') || l.includes('warn') || l.includes('intermediate')) return 'rgba(252,211,77,0.10)';
    return 'rgba(52,211,153,0.10)';
};

// ─── shared dark tokens ────────────────────────────────────────────────────────
const T = {
    cardBg: '#1E293B',
    innerBg: '#0F172A',
    border: '#334155',
    borderSoft: '#1E293B',
    textPrimary: '#E2E8F0',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textLabel: '#64748B',
};
// ─── AI Insight Content with typewriter animation ─────────────────────────────
const AIInsightContent = ({ result, tokens: T }) => {
    const fullText = result.rawResponse?.llm_generated_explanation?.summary || result.note || 'No AI insight available for this result.';
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const idx = useRef(0);

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        idx.current = 0;
        // Typing speed: ~18ms per char for natural feel
        const timer = setInterval(() => {
            if (idx.current < fullText.length) {
                setDisplayed(fullText.slice(0, idx.current + 1));
                idx.current++;
            } else {
                setDone(true);
                clearInterval(timer);
            }
        }, 14);
        return () => clearInterval(timer);
    }, [fullText]);

    const citations = result.rawResponse?.llm_generated_explanation?.variant_citations || [];

    return (
        <div style={{ padding: '20px 18px', background: T.innerBg }}>

            {/* Header row: AI badge + model tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                    padding: '4px 12px', borderRadius: 20,
                    background: 'linear-gradient(135deg,rgba(99,102,241,0.28),rgba(59,130,246,0.22))',
                    border: '1px solid rgba(99,102,241,0.45)',
                }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#C7D2FE', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.8px' }}>
                        AI ANALYSIS
                    </span>
                </div>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(99,102,241,0.4),transparent)' }} />
                {/* Live generating indicator */}
                {!done ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                style={{ width: 4, height: 4, borderRadius: '50%', background: '#818CF8' }}
                            />
                        ))}
                        <span style={{ fontSize: 10, color: '#818CF8', fontFamily: "'JetBrains Mono',monospace" }}>generating</span>
                    </div>
                ) : (
                    <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>Sanjeevani AI · GPT-4o</span>
                )}
            </div>

            {/* Main typewriter text box with pulsing glow border */}
            <motion.div
                animate={{
                    boxShadow: done
                        ? '0 0 0px rgba(99,102,241,0)'
                        : ['0 0 0px rgba(99,102,241,0)', '0 0 14px rgba(99,102,241,0.35)', '0 0 0px rgba(99,102,241,0)'],
                }}
                transition={{ repeat: done ? 0 : Infinity, duration: 2, ease: 'easeInOut' }}
                style={{
                    padding: '16px 18px',
                    background: 'linear-gradient(135deg,rgba(18,12,50,0.85),rgba(15,23,42,0.9))',
                    border: '1px solid rgba(99,102,241,0.28)',
                    borderLeft: '3px solid #818CF8',
                    borderRadius: '0 10px 10px 0',
                    marginBottom: 14,
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: 60,
                }}
            >
                {/* Radial glow corner */}
                <div style={{
                    position: 'absolute', top: -20, right: -20,
                    width: 90, height: 90, borderRadius: '50%',
                    background: 'radial-gradient(circle,rgba(99,102,241,0.18),transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <p style={{
                    fontSize: 13.5, color: '#CBD5E1', lineHeight: 1.88,
                    margin: 0, fontFamily: "'Inter',sans-serif",
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    position: 'relative',
                }}>
                    {displayed}
                    {/* Blinking cursor while typing */}
                    {!done && (
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.55 }}
                            style={{ display: 'inline-block', width: 2, height: '1em', background: '#818CF8', marginLeft: 2, verticalAlign: 'text-bottom', borderRadius: 1 }}
                        />
                    )}
                </p>
            </motion.div>

            {/* Referenced variant chips — staggered fade-in */}
            {citations.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>
                        Referenced Variants
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {citations.map((c, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
                                style={{
                                    padding: '4px 11px',
                                    background: 'rgba(99,102,241,0.15)',
                                    border: '1px solid rgba(99,102,241,0.35)',
                                    borderRadius: 20,
                                    fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
                                    color: '#A5B4FC', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: 5,
                                }}
                            >
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366F1', display: 'inline-block', flexShrink: 0 }} />
                                {c.rsid} {c.allele} ({c.genotype})
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Disclaimer */}
            <div style={{
                padding: '8px 12px',
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.16)',
                borderRadius: 8,
                fontSize: 11.5, color: '#64748B',
                fontFamily: "'Inter',sans-serif",
            }}>
                This insight is AI-generated. Always verify with a clinical pharmacist before treatment decisions.
            </div>
        </div>
    );
};

const RiskCard = ({ result, index }) => {

    const [expandedSection, setExpandedSection] = useState(null);

    const riskColor = getRiskColor(result.label);
    const riskBg = getRiskBg(result.label);

    const toggleSection = (s) => setExpandedSection(expandedSection === s ? null : s);

    // ── Section header pill ──────────────────────────────────────────────
    const SectionHeader = ({ id, icon, label, accentColor, headerBg, textColor }) => (
        <div
            onClick={() => toggleSection(id)}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 16px',
                background: headerBg || '#1E293B',
                borderBottom: `1px solid ${T.border}`,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    {icon}
                </svg>
                <span style={{ fontWeight: 700, fontSize: 13, color: textColor || accentColor, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{label}</span>
            </div>
            <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={textColor || accentColor} strokeWidth="2.5"
                style={{ transition: 'transform 0.3s', transform: expandedSection === id ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
            >
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </div>
    );

    return (
        <div
            className="risk-card-container"
            style={{
                animationDelay: `${index * 60}ms`,
                background: T.cardBg,
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${T.border}`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
                position: 'relative',
            }}
        >
            {/* Shine sweep on mount */}
            <div className="risk-card-shine" />
            {/* ── HEADER ───────────────────────────────────────────────────────── */}
            <div style={{
                padding: '20px 22px',
                borderLeft: `5px solid ${riskColor}`,
                background: riskBg,
                borderBottom: `1px solid ${T.border}`,
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) auto auto',
                gap: '16px 24px',
                alignItems: 'center',
            }}>
                {/* Drug info */}
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5 }}>
                        {result.drug || 'Unknown Drug'}
                    </div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
                        {result.drugClass || 'Unknown Class'}
                    </div>
                </div>

                {/* Metrics row */}
                <div style={{ display: 'flex', gap: 28 }}>
                    {[
                        { label: 'Risk Level', value: result.label || 'Unknown', valueColor: riskColor },
                        { label: 'Severity', value: result.severity || 'Unknown', valueColor: T.textPrimary },
                        { label: 'Evidence', value: result.cpicLevel || 'N/A', valueColor: '#34D399' },
                    ].map(m => (
                        <div key={m.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: T.textLabel, marginBottom: 5, fontFamily: "'JetBrains Mono',monospace" }}>
                                {m.label}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: m.valueColor }}>
                                {m.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Confidence ring */}
                <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                    <svg width="72" height="72" viewBox="0 0 72 72" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                        <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                        <circle
                            cx="36" cy="36" r="30"
                            fill="none"
                            stroke={riskColor}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${(result.confidence || 0) * 188.5} 188.5`}
                            style={{ filter: `drop-shadow(0 0 4px ${riskColor}80)` }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: riskColor, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>
                            {((result.confidence || 0) * 100).toFixed(0)}
                        </span>
                        <span style={{ fontSize: 9, color: T.textMuted, fontFamily: "'JetBrains Mono',monospace", marginTop: 1 }}>%</span>
                    </div>
                </div>
            </div>

            {/* ── COLLAPSIBLE SECTIONS ─────────────────────────────────────────── */}
            <div>

                {/* 1. Pharmacogenomic Profile */}
                <div style={{ borderBottom: `1px solid ${T.border}` }}>
                    <SectionHeader
                        id="profile"
                        accentColor="#818CF8"
                        textColor="#C4B5FD"
                        headerBg="rgba(99,102,241,0.08)"
                        label="Pharmacogenomic Profile"
                        icon={<><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></>}
                    />
                    <AnimatePresence initial={false}>
                        {expandedSection === 'profile' && (
                            <motion.div
                                key="profile-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ padding: '16px 18px', background: T.innerBg }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 16, marginBottom: 16 }}>
                                        {[
                                            { label: 'Primary Gene', value: result.gene || 'Unknown', mono: true, color: '#60A5FA' },
                                            { label: 'Diplotype', value: result.diplotype || 'Unknown', mono: true, color: '#A78BFA' },
                                            { label: 'Phenotype', value: result.phenotype || 'Unknown', mono: false, color: T.textPrimary },
                                            { label: 'Enzyme Activity', value: result.activity || 'N/A', mono: false, color: T.textPrimary },
                                        ].map(d => (
                                            <div key={d.label}>
                                                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: T.textLabel, marginBottom: 5, fontFamily: "'JetBrains Mono',monospace" }}>
                                                    {d.label}
                                                </div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: d.color, fontFamily: d.mono ? "'JetBrains Mono',monospace" : 'inherit' }}>
                                                    {d.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {result.rawResponse?.pharmacogenomic_profile?.detected_variants?.length > 0 && (
                                        <div style={{ paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
                                                Detected Variants ({result.rawResponse.pharmacogenomic_profile.detected_variants.length})
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {result.rawResponse.pharmacogenomic_profile.detected_variants.map((v, i) => (
                                                    <div key={i} style={{ padding: '9px 12px', background: '#1A2744', border: `1px solid #2D4080`, borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
                                                        {[['RSID', v.rsid], ['Allele', v.allele], ['Genotype', v.genotype], ['Effect', v.effect]].map(([lbl, val]) => (
                                                            <div key={lbl}>
                                                                <span style={{ color: T.textMuted }}>{lbl}: </span>
                                                                <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", color: '#93C5FD' }}>{val}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Clinical Recommendation */}
                <div style={{ borderBottom: `1px solid ${T.border}` }}>
                    <SectionHeader
                        id="recommendation"
                        accentColor="#FCD34D"
                        textColor="#FDE68A"
                        headerBg="rgba(252,211,77,0.07)"
                        label="Clinical Recommendation"
                        icon={<><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" /></>}
                    />
                    <AnimatePresence initial={false}>
                        {expandedSection === 'recommendation' && (
                            <motion.div
                                key="rec-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ padding: '16px 18px', background: T.innerBg }}>
                                    <div style={{ padding: '14px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderLeft: '4px solid #F59E0B', borderRadius: '0 8px 8px 0', marginBottom: 12, fontSize: 13, color: '#E2E8F0', lineHeight: 1.7 }}>
                                        {result.rawResponse?.clinical_recommendation?.recommendation || result.recommendation || 'No recommendation available'}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                                        <span style={{ fontSize: 12, color: T.textMuted }}>Evidence Level</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#34D399', fontFamily: "'JetBrains Mono',monospace" }}>
                                            {result.rawResponse?.clinical_recommendation?.evidence_level || result.cpicLevel || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. AI-Generated Insight */}
                <div style={{ borderBottom: `1px solid ${T.border}` }}>
                    <SectionHeader
                        id="explanation"
                        accentColor="#818CF8"
                        textColor="#C7D2FE"
                        headerBg="linear-gradient(135deg,rgba(99,102,241,0.2) 0%,rgba(59,130,246,0.15) 100%)"
                        label="AI-Generated Insight"
                        icon={null}
                    />
                    <AnimatePresence initial={false}>
                        {expandedSection === 'explanation' && (
                            <motion.div
                                key="explanation-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                style={{ overflow: 'hidden' }}
                            >
                                <AIInsightContent result={result} tokens={T} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 4. Quality Metrics */}
                {result.rawResponse?.quality_metrics && (
                    <div>
                        <SectionHeader
                            id="metrics"
                            accentColor="#4ADE80"
                            textColor="#86EFAC"
                            headerBg="rgba(22,163,74,0.08)"
                            label="Quality Metrics"
                            icon={<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />}
                        />
                        {expandedSection === 'metrics' && (
                            <div style={{ padding: '16px 18px', background: T.innerBg }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 16 }}>
                                    {[
                                        { label: 'Total Variants', value: result.rawResponse.quality_metrics.total_variants_scanned || 0, color: T.textPrimary },
                                        { label: 'PGx Variants', value: result.rawResponse.pharmacogenomic_profile.detected_variants?.length || 0, color: '#60A5FA' },
                                        { label: 'Non-PGx', value: result.rawResponse.quality_metrics.non_pgx_variants_count || 0, color: T.textSecondary },
                                        {
                                            label: 'Parsing',
                                            value: result.rawResponse.quality_metrics.vcf_parsing_success ? '✓ Success' : '✗ Failed',
                                            color: result.rawResponse.quality_metrics.vcf_parsing_success ? '#4ADE80' : '#F87171',
                                        },
                                    ].map(m => (
                                        <div key={m.label}>
                                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: T.textLabel, marginBottom: 5, fontFamily: "'JetBrains Mono',monospace" }}>
                                                {m.label}
                                            </div>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: m.color, fontFamily: "'JetBrains Mono',monospace" }}>
                                                {m.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── FOOTER ───────────────────────────────────────────────────────── */}
            <div style={{
                padding: '9px 18px',
                background: 'rgba(0,0,0,0.25)',
                borderTop: `1px solid ${T.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 11,
                color: T.textMuted,
                fontFamily: "'JetBrains Mono',monospace",
            }}>
                <span>Analyzed: {result.rawResponse?.timestamp || '—'}</span>
                <span>Patient ID: {result.rawResponse?.patient_id || '—'}</span>
            </div>
        </div>
    );
};

export default RiskCard;
