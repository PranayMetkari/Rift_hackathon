import React, { useRef, useState } from 'react';
import ManualEntryForm from './ManualEntryForm';

const UploadIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--mint)' }}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="12" y2="12" />
        <line x1="15" y1="15" x2="12" y2="12" />
    </svg>
);

const FileUploadSection = ({ mode, setMode, file, setFile, manualVariants, setManualVariants }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', text }

    const processFile = (f) => {
        if (!f.name.endsWith('.vcf') && !f.name.endsWith('.vcf.gz')) {
            setFeedback({ type: 'error', text: 'Invalid file type. Please upload a .vcf or .vcf.gz file.' });
            setFile(null);
            return;
        }
        if (f.size > 50 * 1024 * 1024) {
            setFeedback({ type: 'error', text: 'File too large. Maximum size is 50 MB.' });
            setFile(null);
            return;
        }
        setFile(f);
        setFeedback({ type: 'success', text: `${f.name} (${(f.size / 1024).toFixed(1)} KB) loaded successfully` });
    };

    const handleDrop = (e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); };
    const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
    const handleDragLeave = () => setDragActive(false);
    const handleChange = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); };
    const removeFile = () => { setFile(null); setFeedback(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

    return (
        <div>
            {/* Toggle */}
            <div className="source-toggle">
                <button className={`source-toggle-btn${mode === 'upload' ? ' active' : ''}`} onClick={() => setMode('upload')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload VCF File
                </button>
                <button className={`source-toggle-btn${mode === 'manual' ? ' active' : ''}`} onClick={() => setMode('manual')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
                    </svg>
                    Manual Entry
                </button>
            </div>

            {/* Upload Section */}
            {mode === 'upload' && (
                <div>
                    {!file ? (
                        <div
                            className={`upload-zone${dragActive ? ' drag-active' : ''}`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input ref={fileInputRef} type="file" accept=".vcf,.vcf.gz" onChange={handleChange} style={{ display: 'none' }} />
                            <div className="upload-icon"><UploadIcon /></div>
                            <div className="upload-zone-title">Drop VCF file here or click to browse</div>
                            <div className="upload-zone-sub">Supports Variant Call Format files from WGS/WES pipelines</div>
                            <div className="upload-meta">.vcf / .vcf.gz · Max 50MB</div>
                        </div>
                    ) : (
                        <div className="file-loaded">
                            <div className="file-loaded-info">
                                <div style={{ width: 36, height: 36, background: 'var(--mint-soft)', borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--mint-dark)' }}>
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="file-loaded-name">{file.name}</div>
                                    <div className="file-loaded-meta">{(file.size / 1024).toFixed(1)} KB · Ready to analyze</div>
                                </div>
                            </div>
                            <button className="btn-file-remove" onClick={removeFile} title="Remove file">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {feedback && (
                        <div className={`upload-feedback ${feedback.type}`}>
                            {feedback.type === 'success' ? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            ) : (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            )}
                            {feedback.text}
                        </div>
                    )}
                </div>
            )}

            {/* Manual Section */}
            {mode === 'manual' && (
                <ManualEntryForm variants={manualVariants} setVariants={setManualVariants} />
            )}
        </div>
    );
};

export default FileUploadSection;
