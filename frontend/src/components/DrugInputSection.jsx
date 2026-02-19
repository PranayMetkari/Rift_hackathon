import React from 'react';

const DRUGS = [
    { value: 'CODEINE', label: 'CODEINE' },
    { value: 'WARFARIN', label: 'WARFARIN' },
    { value: 'CLOPIDOGREL', label: 'CLOPIDOGREL' },
    { value: 'SIMVASTATIN', label: 'SIMVASTATIN' },
    { value: 'AZATHIOPRINE', label: 'AZATHIOPRINE' },
    { value: 'FLUOROURACIL', label: 'FLUOROURACIL' },
];

const DrugInputSection = ({ selectedDrugs, setSelectedDrugs }) => {
    const toggle = (value) => {
        setSelectedDrugs(prev =>
            prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
        );
    };

    return (
        <div className="drug-options-grid">
            {DRUGS.map(d => {
                const selected = selectedDrugs.includes(d.value);
                return (
                    <div
                        key={d.value}
                        className={`drug-option-card${selected ? ' selected' : ''}`}
                        onClick={() => toggle(d.value)}
                    >
                        <div className="drug-check-box">
                            {selected && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                        <span className="drug-option-name">{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default DrugInputSection;
