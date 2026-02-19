import React from 'react';

const ManualEntryForm = ({ variants, setVariants }) => {
    const addRow = () =>
        setVariants([...variants, { id: Date.now(), chromosome: '', position: '', refAllele: '', altAllele: '' }]);

    const removeRow = (id) => {
        if (variants.length > 1) setVariants(variants.filter(v => v.id !== id));
    };

    const update = (id, field, value) =>
        setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));

    return (
        <div>
            <div id="variantRows">
                {variants.map((v) => (
                    <div key={v.id} className="variant-row">
                        <div className="form-group">
                            <label>Gene / Chromosome</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. CYP2D6 or chr1"
                                value={v.chromosome}
                                onChange={e => update(v.id, 'chromosome', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Diplotype / Position</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. *1/*4 or 123456"
                                value={v.position}
                                onChange={e => update(v.id, 'position', e.target.value)}
                            />
                        </div>
                        <button className="btn-remove-row" onClick={() => removeRow(v.id)} title="Remove">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
            <button className="btn-add-row" onClick={addRow}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Variant
            </button>
        </div>
    );
};

export default ManualEntryForm;
