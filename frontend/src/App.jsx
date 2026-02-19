import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUploadSection from './components/FileUploadSection';
import DrugInputSection from './components/DrugInputSection';
import ResultsSection from './components/ResultsSection';
import TiltCard from './components/TiltCard';
import StepTransition from './components/StepTransition';
import TorchEffect from './components/TorchEffect';
import SplashScreen from './components/SplashScreen';
import RippleButton from './components/RippleButton';
import ScrollReveal from './components/ScrollReveal';
import AnalysisLoader from './components/AnalysisLoader';
import { analyzeVCF } from './services/api';

const DRUG_DATA = {
    CODEINE: {
        class: 'Opioid Analgesic', gene: 'CYP2D6',
        risks: [
            { diplotype: '*1/*4', phenotype: 'Intermediate Metabolizer', risk: 'warn', label: 'Dose Adjust', recommendation: 'Patient may experience reduced analgesic effect. Consider dose reduction of 25% or monitor for inadequate pain control.', activity: '0.5', cpic: 'Level A', note: 'Codeine is metabolized to morphine via CYP2D6. Intermediate metabolizers produce less morphine.' },
            { diplotype: '*1/*1', phenotype: 'Normal Metabolizer', risk: 'safe', label: 'Safe', recommendation: 'Standard codeine dosing is appropriate. Monitor for standard adverse effects.', activity: '1.0', cpic: 'Level A', note: 'Normal CYP2D6 activity. Expected analgesic response.' },
            { diplotype: '*1/*2xN', phenotype: 'Ultra-Rapid Metabolizer', risk: 'toxic', label: 'High Risk', recommendation: 'Avoid codeine. Ultra-rapid conversion to morphine may cause life-threatening respiratory toxicity.', activity: '>2.0', cpic: 'Level A', note: 'CRITICAL: Risk of opioid toxicity including respiratory depression.' },
        ]
    },
    WARFARIN: {
        class: 'Anticoagulant', gene: 'CYP2C9 · VKORC1',
        risks: [
            { diplotype: 'CYP2C9*2/*3', phenotype: 'Poor Metabolizer', risk: 'toxic', label: 'High Risk', recommendation: 'Start with significantly reduced dose (30-40% of standard). Frequent INR monitoring required.', activity: '0.2', cpic: 'Level A', note: 'Markedly reduced warfarin clearance. High bleeding risk with standard dosing.' },
            { diplotype: 'VKORC1 -1639 A/G', phenotype: 'Intermediate Sensitivity', risk: 'warn', label: 'Dose Adjust', recommendation: 'Reduce initial dose by approximately 25-30%. Weekly INR monitoring for first month.', activity: 'Intermediate', cpic: 'Level A', note: 'Intermediate VKORC1 sensitivity increases bleeding risk at standard doses.' },
            { diplotype: '*1/*1 + TT', phenotype: 'Normal Metabolizer', risk: 'safe', label: 'Safe', recommendation: 'Standard warfarin dosing. Routine INR monitoring.', activity: '1.0', cpic: 'Level A', note: 'Normal CYP2C9 and VKORC1 function.' },
        ]
    },
    CLOPIDOGREL: {
        class: 'Antiplatelet Agent', gene: 'CYP2C19',
        risks: [
            { diplotype: '*2/*2', phenotype: 'Poor Metabolizer', risk: 'toxic', label: 'High Risk', recommendation: 'Use alternative antiplatelet (prasugrel or ticagrelor). Clopidogrel will have minimal antiplatelet effect.', activity: '0', cpic: 'Level A', note: 'No CYP2C19 activity. Clopidogrel cannot be converted to active metabolite.' },
            { diplotype: '*1/*2', phenotype: 'Intermediate Metabolizer', risk: 'warn', label: 'Dose Adjust', recommendation: 'Consider alternative agent in high-risk ACS. Standard clopidogrel with enhanced monitoring in lower-risk settings.', activity: '0.5', cpic: 'Level A', note: 'Reduced conversion to active metabolite. Increased risk of cardiovascular events.' },
            { diplotype: '*1/*1', phenotype: 'Normal Metabolizer', risk: 'safe', label: 'Safe', recommendation: 'Standard clopidogrel dosing. Routine monitoring.', activity: '1.0', cpic: 'Level A', note: 'Normal CYP2C19 function.' },
        ]
    },
    SIMVASTATIN: {
        class: 'HMG-CoA Reductase Inhibitor', gene: 'SLCO1B1',
        risks: [
            { diplotype: '*5/*5 (rs4149056 CC)', phenotype: 'Poor Function', risk: 'toxic', label: 'High Risk', recommendation: 'Avoid simvastatin ≥40mg. Consider pravastatin or rosuvastatin. Monitor CK levels.', activity: 'Reduced', cpic: 'Level A', note: 'Reduced hepatic uptake leads to elevated plasma simvastatin. High myopathy risk.' },
            { diplotype: '*1/*5 (rs4149056 CT)', phenotype: 'Intermediate Function', risk: 'warn', label: 'Dose Adjust', recommendation: 'Use simvastatin ≤40mg. Monitor for myopathy symptoms. CK levels at baseline recommended.', activity: 'Intermediate', cpic: 'Level A', note: 'Moderately reduced OATP1B1 function. Increased myopathy risk at high doses.' },
            { diplotype: '*1/*1 (rs4149056 TT)', phenotype: 'Normal Function', risk: 'safe', label: 'Safe', recommendation: 'Standard simvastatin dosing. Routine monitoring per standard of care.', activity: 'Normal', cpic: 'Level A', note: 'Normal SLCO1B1 function. Standard pharmacokinetics expected.' },
        ]
    },
    AZATHIOPRINE: {
        class: 'Immunosuppressant / Thiopurine', gene: 'TPMT · NUDT15',
        risks: [
            { diplotype: 'TPMT *3A/*3A', phenotype: 'Poor Metabolizer', risk: 'toxic', label: 'High Risk', recommendation: 'Start at 10% of standard dose or use alternative. Strict hematologic monitoring required.', activity: '0', cpic: 'Level A', note: 'No TPMT activity. Risk of life-threatening myelosuppression at standard doses.' },
            { diplotype: 'NUDT15 *3/*1', phenotype: 'Intermediate Metabolizer', risk: 'warn', label: 'Dose Adjust', recommendation: 'Reduce starting dose by 30-50%. Monitor CBC weekly for first 4 weeks, then monthly.', activity: 'Reduced', cpic: 'Level A', note: 'NUDT15 variants increase thiopurine nucleotide accumulation. Increased myelosuppression risk.' },
            { diplotype: 'TPMT *1/*1', phenotype: 'Normal Metabolizer', risk: 'safe', label: 'Safe', recommendation: 'Standard dosing. Routine CBC monitoring.', activity: 'Normal', cpic: 'Level A', note: 'Normal TPMT function.' },
        ]
    },
    FLUOROURACIL: {
        class: 'Antimetabolite / Chemotherapy', gene: 'DPYD',
        risks: [
            { diplotype: 'DPYD*2A/*1 (IVS14+1G>A)', phenotype: 'Intermediate DPD Activity', risk: 'toxic', label: 'High Risk', recommendation: 'Reduce dose by 50%. Consider alternative. Monitor for severe fluoropyrimidine toxicity.', activity: '~50%', cpic: 'Level A', note: 'CRITICAL: Reduced DPYD activity leads to accumulation of 5-FU. Risk of severe, potentially fatal toxicity.' },
            { diplotype: 'DPYD c.2846A>T/*1', phenotype: 'Intermediate DPD Activity', risk: 'warn', label: 'Dose Adjust', recommendation: 'Reduce initial dose by 25-50%. Monitor closely for Grade 3/4 hematologic and GI toxicity.', activity: '~75%', cpic: 'Level A', note: 'Partial reduction in DPYD activity. Increased fluoropyrimidine toxicity risk.' },
            { diplotype: 'DPYD *1/*1', phenotype: 'Normal DPD Activity', risk: 'safe', label: 'Safe', recommendation: 'Standard fluorouracil dosing. Routine monitoring.', activity: '~100%', cpic: 'Level A', note: 'Normal DPYD function.' },
        ]
    }
};

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }) {
    const steps = [
        { n: 1, label: 'Genomic Input' },
        { n: 2, label: 'Drug Selection' },
    ];
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
            {steps.map((s, i) => {
                const done = current > s.n;
                const active = current === s.n;
                return (
                    <React.Fragment key={s.n}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <motion.div
                                animate={{
                                    background: done ? '#34D399' : active ? '#3B82F6' : '#1E293B',
                                    borderColor: done ? '#34D399' : active ? '#3B82F6' : '#334155',
                                    boxShadow: active ? '0 0 16px rgba(59,130,246,0.5)' : done ? '0 0 10px rgba(52,211,153,0.4)' : 'none',
                                }}
                                style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    border: '2px solid',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontWeight: 700, fontSize: 14, color: '#fff',
                                    transition: 'all 0.4s ease',
                                }}
                            >
                                {done ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : s.n}
                            </motion.div>
                            <span style={{
                                fontSize: 11, color: active ? '#93C5FD' : done ? '#34D399' : '#475569',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: active ? 600 : 400,
                                letterSpacing: '0.3px',
                                transition: 'color 0.3s',
                            }}>{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <motion.div
                                animate={{ background: done ? '#34D399' : '#1E293B' }}
                                style={{ flex: 1, height: 2, margin: '0 12px', marginBottom: 22, borderRadius: 99, transition: 'background 0.5s' }}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
    const [mode, setMode] = useState('upload');
    const [file, setFile] = useState(null);
    const [manualVariants, setManualVariants] = useState([{ id: 1, chromosome: '', position: '', refAllele: '', altAllele: '' }]);
    const [selectedDrugs, setSelectedDrugs] = useState([]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loaderWidth, setLoaderWidth] = useState(0);

    // Wizard state: 1 | 'transition' | 2 | 'results'
    const [step, setStep] = useState(1);

    // ── Interactive effects state ──────────────────────────────────────────
    const [showSplash, setShowSplash] = useState(true);
    const navRef = useRef(null);

    // Navbar glass effect on scroll
    useEffect(() => {
        const onScroll = () => {
            const nav = navRef.current;
            if (!nav) return;
            if (window.scrollY > 30) {
                nav.classList.add('pgx-nav--scrolled');
            } else {
                nav.classList.remove('pgx-nav--scrolled');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);


    const step1Done = mode === 'manual'
        ? manualVariants.some(v => v.chromosome && v.position)
        : !!file;

    const canAnalyze = selectedDrugs.length > 0;

    // Step 1 → transition → Step 2
    const handleNextStep = () => {
        if (!step1Done) return;
        setStep('transition');
    };

    const handleTransitionDone = () => setStep(2);

    // Analyze
    const handleAnalyze = async () => {
        setError('');
        if (!canAnalyze) { setError('Please select at least one drug.'); return; }

        // Determine which file/source to use
        let sourceFile = file;
        if (mode === 'manual' && manualVariants.some(v => v.chromosome && v.position)) {
            // For manual entry, we would need a different endpoint
            // For now, we'll show a message that manual mode needs VCF
            setError('Full analysis currently requires VCF file. Please upload a VCF file.');
            return;
        }

        if (!sourceFile) {
            setError('Please select a VCF file or enter variants manually.');
            return;
        }

        setLoading(true);
        setResults(null);

        let pct = 0;
        const grow = setInterval(() => {
            pct = Math.min(pct + Math.random() * 12, 88);
            setLoaderWidth(pct);
        }, 80);

        try {
            // Call the backend API
            const analysisResults = await analyzeVCF(sourceFile, selectedDrugs);

            // Ensure we always have an array
            const resultsArray = Array.isArray(analysisResults) ? analysisResults : [analysisResults];

            // Transform backend response to frontend format
            const transformedResults = resultsArray.map((result) => {
                const drug = result.drug || selectedDrugs[0];
                const data = DRUG_DATA[drug] || { class: 'Unknown', gene: 'Unknown' };

                return {
                    drug: drug,
                    drugClass: data.class,
                    gene: result.pharmacogenomic_profile?.primary_gene || 'Unknown',
                    risk: mapRiskToFrontend(result.risk_assessment?.risk_label),
                    label: result.risk_assessment?.risk_label || 'Unknown',
                    severity: result.risk_assessment?.severity || 'Unknown',
                    diplotype: result.pharmacogenomic_profile?.diplotype || 'N/A',
                    phenotype: result.pharmacogenomic_profile?.phenotype || 'Unknown',
                    activity: 'N/A', // Can be enhanced if backend provides this
                    cpicLevel: result.clinical_recommendation?.evidence_level || 'N/A',
                    note: result.llm_generated_explanation?.summary || 'Analysis complete',
                    recommendation: result.clinical_recommendation?.recommendation || 'See full report',
                    confidence: result.risk_assessment?.confidence_score || 0.85,
                    rawResponse: result, // Store full response for potential deep inspection
                };
            });

            clearInterval(grow);
            setLoaderWidth(100);
            setResults(transformedResults);
            setLoading(false);
            setStep('results');

            setTimeout(() => setLoaderWidth(0), 400);
            setTimeout(() => document.getElementById('pgx-results')?.scrollIntoView({ behavior: 'smooth' }), 200);
        } catch (err) {
            clearInterval(grow);
            setLoaderWidth(0);
            setLoading(false);
            setError(`Analysis failed: ${err.message}`);
            console.error('Analysis error:', err);
        }
    };

    // Helper function to map backend risk categories to frontend risk levels
    const mapRiskToFrontend = (riskLabel) => {
        if (!riskLabel) return 'safe';
        const label = riskLabel.toLowerCase();
        if (label.includes('high') || label.includes('toxic')) return 'toxic';
        if (label.includes('warn') || label.includes('adjust')) return 'warn';
        return 'safe';
    };

    // Go back to step 1 and clear the uploaded file so user can re-upload
    const handleGoBack = () => {
        setFile(null);
        setManualVariants([{ id: 1, chromosome: '', position: '', refAllele: '', altAllele: '' }]);
        setError('');
        setStep(1);
    };

    const pageVariants = {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
        exit: { opacity: 0, x: -40, transition: { duration: 0.25, ease: 'easeIn' } },
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* ── Interactive overlays ── */}
            <TorchEffect />
            {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

            {/* 3D FLOATING ORBS */}
            <div className="bg-orbs">
                <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
                <div className="orb orb-4" /><div className="orb orb-5" />
            </div>

            {/* Thin top progress bar (non-analysis loading) */}
            {!loading && <div className="pgx-loader" style={{ width: loaderWidth + '%' }} />}

            {/* Full-screen Analysis Loader */}
            <AnimatePresence>
                {loading && <AnalysisLoader key="analysis-loader" />}
            </AnimatePresence>

            {/* 3D STEP TRANSITION OVERLAY */}
            {step === 'transition' && (
                <StepTransition
                    label={mode === 'manual' ? 'Processing variants…' : 'Loading VCF file…'}
                    onDone={handleTransitionDone}
                />
            )}

            {/* NAVBAR */}
            <nav ref={navRef} className="pgx-nav">
                <div className="pgx-nav-inner">
                    <a href="#" className="pgx-nav-logo" onClick={() => { setStep(1); setResults(null); }}>
                        <div className="pgx-nav-logo-icon" style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
                            </svg>
                        </div>
                        <span className="pgx-nav-brand" style={{ background: 'linear-gradient(90deg,#E2E8F0,#93C5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Sanjeevani<span style={{ WebkitTextFillColor: '#60A5FA' }}> AI</span>
                        </span>
                    </a>
                    <ul className="pgx-nav-links">
                        <li><a href="#">Documentation</a></li>
                        <li><a href="#">Gene Panel</a></li>
                        <li><a href="#">Research</a></li>
                        <li><span className="pgx-nav-badge">Beta v1.0</span></li>
                    </ul>
                </div>
            </nav>

            {/* HERO */}
            <div className="pgx-hero">
                <div>
                    <div className="pgx-hero-eyebrow" style={{ color: '#FCD34D' }}>AI-Powered Pharmacogenomics Platform</div>
                    <h1>Personalised drug safety through <em style={{ background: 'linear-gradient(90deg,#34D399,#3B82F6,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic' }}>AI genomic intelligence</em></h1>
                    <p>Upload a VCF file or enter variants manually to get evidence-based pharmacogenomic risk assessments — powered by Sanjeevani AI.</p>
                </div>
                <div className="pgx-hero-stats">
                    <div className="stat-pill">
                        <div className="stat-dot" style={{ background: '#3B82F6', boxShadow: '0 0 8px rgba(59,130,246,0.6)' }} />
                        <span><strong>6</strong> drug interactions</span>
                    </div>
                    <div className="stat-pill">
                        <div className="stat-dot" style={{ background: '#FCD34D', boxShadow: '0 0 8px rgba(252,211,77,0.6)' }} />
                        <span>CPIC <strong>Tier A/B</strong> guidelines</span>
                    </div>
                    <div className="stat-pill">
                        <div className="stat-dot" style={{ background: '#34D399', boxShadow: '0 0 8px rgba(52,211,153,0.6)' }} />
                        <span>FDA-recognized <strong>biomarkers</strong></span>
                    </div>
                </div>
            </div>

            {/* MAIN — Wizard steps with sidebar */}
            {step !== 'results' && (
                <div className="pgx-main">
                    {/* Left */}
                    <div>
                        {/* Step indicator — only during wizard steps */}
                        {(step === 1 || step === 2) && <StepIndicator current={step} />}

                        {error && (
                            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                {error}
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {/* ── STEP 1 ── */}
                            {step === 1 && (
                                <motion.div key="step1" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                                    <TiltCard style={{ marginBottom: 16 }}>
                                        <div className="pgx-card">
                                            <div className="pgx-card-header">
                                                <span className="pgx-card-title">Genomic Input</span>
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Step 1 of 2</span>
                                            </div>
                                            <div className="pgx-card-body">
                                                <FileUploadSection mode={mode} setMode={setMode} file={file} setFile={setFile} manualVariants={manualVariants} setManualVariants={setManualVariants} />

                                                {/* Next button */}
                                                <div style={{ textAlign: 'center', paddingTop: 24 }}>
                                                    <motion.button
                                                        onClick={handleNextStep}
                                                        disabled={!step1Done}
                                                        whileHover={step1Done ? { scale: 1.03, boxShadow: '0 0 24px rgba(59,130,246,0.5)' } : {}}
                                                        whileTap={step1Done ? { scale: 0.97 } : {}}
                                                        style={{
                                                            fontFamily: "'Plus Jakarta Sans',sans-serif",
                                                            display: 'inline-flex', alignItems: 'center', gap: 8,
                                                            padding: '13px 32px', borderRadius: 10, border: 'none', cursor: step1Done ? 'pointer' : 'not-allowed',
                                                            background: step1Done ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : '#1E293B',
                                                            color: step1Done ? '#fff' : '#475569',
                                                            fontSize: 14, fontWeight: 600,
                                                            transition: 'all 0.3s',
                                                        }}
                                                    >
                                                        {step1Done ? (
                                                            <>
                                                                Continue to Drug Selection
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                                                </svg>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                                                                </svg>
                                                                Upload or enter variants to continue
                                                            </>
                                                        )}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </TiltCard>
                                </motion.div>
                            )}

                            {/* ── STEP 2 ── */}
                            {step === 2 && (
                                <motion.div key="step2" variants={pageVariants} initial="initial" animate="animate" exit="exit">

                                    {/* Prominent go-back banner */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            background: 'rgba(59,130,246,0.08)',
                                            border: '1px solid rgba(59,130,246,0.2)',
                                            borderRadius: 10, padding: '10px 16px',
                                            marginBottom: 14,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#93C5FD', fontFamily: "'JetBrains Mono',monospace" }}>
                                                    {mode === 'manual' ? 'Manual variants entered' : (file?.name || 'VCF file loaded')}
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                                    Step 1 complete — genomic data ready
                                                </div>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={handleGoBack}
                                            whileHover={{ scale: 1.04, background: 'rgba(248,113,113,0.18)' }}
                                            whileTap={{ scale: 0.96 }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                background: 'rgba(248,113,113,0.1)',
                                                border: '1px solid rgba(248,113,113,0.3)',
                                                borderRadius: 8, padding: '6px 14px',
                                                color: '#F87171', fontSize: 12.5, fontWeight: 600,
                                                cursor: 'pointer', fontFamily: "'Inter',sans-serif",
                                                transition: 'background 0.2s',
                                            }}
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                                            </svg>
                                            Change file
                                        </motion.button>
                                    </motion.div>

                                    <TiltCard style={{ marginBottom: 16 }}>
                                        <div className="pgx-card">
                                            <div className="pgx-card-header">
                                                <span className="pgx-card-title">Drug Selection</span>
                                            </div>
                                            <div className="pgx-card-body">
                                                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 4 }}>Select one or more drugs to assess pharmacogenomic risk.</p>
                                                <DrugInputSection selectedDrugs={selectedDrugs} setSelectedDrugs={setSelectedDrugs} />
                                                <div style={{ textAlign: 'center', paddingTop: 24 }}>
                                                    <RippleButton
                                                        className="btn-analyze"
                                                        onClick={handleAnalyze}
                                                        disabled={!canAnalyze || loading}
                                                        rippleColor="rgba(255,255,255,0.25)"
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <motion.svg
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
                                                                    width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                                >
                                                                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                                                                </motion.svg>
                                                                Analysing…
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                                                </svg>
                                                                Analyze Risk Profile
                                                            </>
                                                        )}
                                                    </RippleButton>
                                                </div>
                                            </div>
                                        </div>
                                    </TiltCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* SIDEBAR — only shown during wizard steps */}
                    <div className="pgx-sidebar">
                        <TiltCard strength={6}>
                            <div className="info-card" style={{ borderTop: '3px solid #3B82F6' }}>
                                <div className="info-card-title" style={{ color: '#60A5FA' }}>Gene Coverage</div>
                                <div className="gene-list">
                                    {[
                                        { gene: 'CYP2D6', drug: 'Codeine', dot: '#F87171' },
                                        { gene: 'CYP2C9 · VKORC1', drug: 'Warfarin', dot: '#FB923C' },
                                        { gene: 'CYP2C19', drug: 'Clopidogrel', dot: '#FCD34D' },
                                        { gene: 'SLCO1B1', drug: 'Simvastatin', dot: '#34D399' },
                                        { gene: 'TPMT · NUDT15', drug: 'Azathioprine', dot: '#60A5FA' },
                                        { gene: 'DPYD', drug: 'Fluorouracil', dot: '#A78BFA' },
                                    ].map(r => (
                                        <div className="gene-item" key={r.gene} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.dot, flexShrink: 0, boxShadow: `0 0 6px ${r.dot}80` }} />
                                            <span className="gene-name">{r.gene}</span>
                                            <span className="gene-drug" style={{ marginLeft: 'auto' }}>{r.drug}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TiltCard>

                        <TiltCard strength={6}>
                            <div className="info-card" style={{ borderTop: '3px solid #F59E0B' }}>
                                <div className="info-card-title" style={{ color: '#FCD34D' }}>Risk Legend</div>
                                <div className="legend-list">
                                    <div className="legend-item">
                                        <div className="legend-dot" style={{ background: 'var(--safe)' }} />
                                        <div>
                                            <span className="legend-label">SAFE — Normal metabolizer</span>
                                            <span className="legend-desc">Standard dosing recommended</span>
                                        </div>
                                    </div>
                                    <div className="legend-item">
                                        <div className="legend-dot" style={{ background: 'var(--warn)' }} />
                                        <div>
                                            <span className="legend-label">DOSE ADJUST — Intermediate</span>
                                            <span className="legend-desc">Dose modification may be needed</span>
                                        </div>
                                    </div>
                                    <div className="legend-item">
                                        <div className="legend-dot" style={{ background: 'var(--danger)' }} />
                                        <div>
                                            <span className="legend-label">HIGH RISK — Poor/Ultra-rapid</span>
                                            <span className="legend-desc">Alternative drug recommended</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TiltCard>

                        <TiltCard strength={6}>
                            <div className="info-card" style={{ borderTop: '3px solid #A78BFA', background: 'var(--mint-pale)' }}>
                                <div className="info-card-title" style={{ color: '#A78BFA' }}>Guideline Source</div>
                                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                    Based on <strong>CPIC</strong> (Clinical Pharmacogenomics Implementation Consortium) Level A &amp; B guidelines and <strong>PharmGKB</strong> curated evidence.
                                </p>
                            </div>
                        </TiltCard>
                    </div>
                </div>
            )}

            {/* RESULTS PAGE — full width, no sidebar */}
            {step === 'results' && results && (
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 40px' }}>
                    {error && (
                        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {error}
                        </div>
                    )}

                    {/* Back button */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <button
                            onClick={() => { setStep(2); setResults(null); }}
                            style={{ marginBottom: 20, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                            Change drug selection
                        </button>
                    </motion.div>

                    {/* Results section */}
                    <ScrollReveal y={20}>
                        <div id="pgx-results">
                            <ResultsSection results={results} />
                        </div>
                    </ScrollReveal>

                    {/* Start New Analysis banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            marginTop: 8,
                            padding: '20px 28px',
                            background: 'rgba(52,211,153,0.07)',
                            border: '1px solid rgba(52,211,153,0.22)',
                            borderRadius: 14,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: 20, flexWrap: 'wrap',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#6EE7B7', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Analysis complete</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Want to test a different patient or file?</div>
                            </div>
                        </div>
                        <motion.button
                            onClick={() => {
                                setResults(null);
                                setFile(null);
                                setManualVariants([{ id: 1, chromosome: '', position: '', refAllele: '', altAllele: '' }]);
                                setSelectedDrugs([]);
                                setError('');
                                setStep(1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(52,211,153,0.35)' }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '11px 24px', borderRadius: 10, border: 'none',
                                background: 'linear-gradient(135deg,#34D399,#059669)',
                                color: '#fff', fontSize: 14, fontWeight: 600,
                                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
                            }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                            </svg>
                            Start New Analysis
                        </motion.button>
                    </motion.div>
                </div>
            )}


            {/* FOOTER */}
            <footer className="pgx-footer">
                <div className="pgx-footer-inner">
                    <div className="pgx-footer-text">© 2025 Sanjeevani AI · Research Use Only</div>
                    <div className="pgx-footer-disclaimer">This tool provides pharmacogenomic risk information based on published guidelines. Clinical decisions must be made by qualified healthcare professionals.</div>
                </div>
            </footer>
        </div>
    );
}

export default App;
