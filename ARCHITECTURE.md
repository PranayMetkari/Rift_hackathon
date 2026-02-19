# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SANJEEVANI AI PLATFORM                             │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      FRONTEND (React + Vite)                           │ │
│  │                    http://localhost:5173                              │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │                         App.jsx                                  │ │ │
│  │  │  • Manages overall flow (step 1 → 2 → results)                  │ │ │
│  │  │  • Imports analyzeVCF from services/api.js                      │ │ │
│  │  │  • Handles user interactions                                    │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                              ↓                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │                    services/api.js                              │ │ │
│  │  │  • analyzeVCF() - Main API call                                 │ │ │
│  │  │  • handleFormData preparation                                  │ │ │
│  │  │  • Error handling & response transformation                    │ │ │
│  │  │  • Uses VITE_API_URL from .env.local                           │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                              ↓                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │                  HTTP Request Layer                             │ │ │
│  │  │  • FormData: {file, drug, patient_id}                          │ │ │
│  │  │  • POST http://localhost:8000/analyze                          │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                  ↕                                          │
│                           [CORS Enabled]                                    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    BACKEND (FastAPI)                                   │ │
│  │                 http://localhost:8000                                 │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │           FastAPI App with CORS Middleware                      │ │ │
│  │  │  • Configured for http://localhost:5173                         │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                              ↓                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │              POST /analyze Endpoint                             │ │ │
│  │  │  • Receives: VCF file + drug name + patient_id                 │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                              ↓                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────┐  │ │
│  │  │ Processing Pipeline:                                          │  │ │
│  │  │                                                               │  │ │
│  │  │ ┌─────────────────────────────────────────────────────────┐ │  │ │
│  │  │ │ 1. vcf_parser.extract_variants()                        │ │  │ │
│  │  │ │    → Parse VCF file, extract genetic variants           │ │  │ │
│  │  │ └─────────────────────────────────────────────────────────┘ │  │ │
│  │  │                          ↓                                   │  │ │
│  │  │ ┌─────────────────────────────────────────────────────────┐ │  │ │
│  │  │ │ 2. variant_mapper.classify_variants()                   │ │  │ │
│  │  │ │    → Map to pharmacogenomic variants                   │ │  │ │
│  │  │ └─────────────────────────────────────────────────────────┘ │  │ │
│  │  │                          ↓                                   │  │ │
│  │  │ ┌─────────────────────────────────────────────────────────┐ │  │ │
│  │  │ │ 3. phenotype_engine.infer_phenotypes()                  │ │  │ │
│  │  │ │    → Infer metabolizer phenotype from variants          │ │  │ │
│  │  │ └─────────────────────────────────────────────────────────┘ │  │ │
│  │  │                          ↓                                   │  │ │
│  │  │ ┌─────────────────────────────────────────────────────────┐ │  │ │
│  │  │ │ 4. cpic_engine.apply_cpic_guideline()                   │ │  │ │
│  │  │ │    → Get CPIC recommendations for drug                 │ │  │ │
│  │  │ └─────────────────────────────────────────────────────────┘ │  │ │
│  │  │                          ↓                                   │  │ │
│  │  │ ┌─────────────────────────────────────────────────────────┐ │  │ │
│  │  │ │ 5. scoring_engine.calculate_confidence()                │ │  │ │
│  │  │ │    → Calculate confidence score                         │ │  │ │
│  │  │ └─────────────────────────────────────────────────────────┘ │  │ │
│  │  │                          ↓                                   │  │ │
│  │  │ ┌─────────────────────────────────────────────────────────┐ │  │ │
│  │  │ │ 6. llm_engine.generate_explanation()                    │ │  │ │
│  │  │ │    → Generate AI explanations using LLM                │ │  │ │
│  │  │ └─────────────────────────────────────────────────────────┘ │  │ │
│  │  │                          ↓                                   │  │ │
│  │  │ ┌─────────────────────────────────────────────────────────┐ │  │ │
│  │  │ │ 7. Structure Response                                  │ │  │ │
│  │  │ │    • risk_assessment                                   │ │  │ │
│  │  │ │    • pharmacogenomic_profile                           │ │  │ │
│  │  │ │    • clinical_recommendation                           │ │  │ │
│  │  │ │    • llm_generated_explanation                         │ │  │ │
│  │  │ │    • quality_metrics                                   │ │  │ │
│  │  │ └─────────────────────────────────────────────────────────┘ │  │ │
│  │  └────────────────────────────────────────────────────────────────┘  │ │
│  │                              ↓                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │           JSON Response to Frontend                             │ │ │
│  │  │  Returns structured analysis results                            │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                  ↕                                          │
│                           [CORS Enabled]                                    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    FRONTEND - Display Results                          │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │               ResultsSection Component                          │ │ │
│  │  │  • Transform backend response to frontend format               │ │ │
│  │  │  • Map risk levels (safe, warn, toxic)                        │ │ │
│  │  │  • Extract confidence scores                                  │ │ │
│  │  │  • Display recommendations                                    │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                              ↓                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │               RiskCard Components (per drug)                    │ │ │
│  │  │  • Drug name & class                                           │ │ │
│  │  │  • Risk level color-coded                                      │ │ │
│  │  │  • Phenotype & diplotype                                       │ │ │
│  │  │  • Confidence score                                            │ │ │
│  │  │  • Clinical recommendations                                    │ │ │
│  │  │  • Severity level                                              │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                              ↓                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │                  User Sees Final Report                         │ │ │
│  │  │  ✓ Personalized drug safety recommendations                    │ │ │
│  │  │  ✓ Based on patient's genomic profile                         │ │ │
│  │  │  ✓ With confidence scores & evidence levels                   │ │ │
│  │  │  ✓ AI-generated explanations                                  │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Dependencies

```
App.jsx (Main Component)
├── Imports: analyzeVCF from services/api
├── State Management:
│   ├── file (VCF file)
│   ├── selectedDrugs (array)
│   ├── results (analysis output)
│   ├── loading (boolean)
│   ├── error (string)
│   └── step (wizard step)
├── 
├── FileUploadSection
│   ├── Handles file selection
│   ├── Validates VCF format
│   └── Returns file to App
├── 
├── DrugInputSection
│   ├── Shows available drugs
│   ├── Handles selection
│   └── Returns selected drugs to App
├── 
├── handleAnalyze() Function
│   ├── Calls: analyzeVCF(file, selectedDrugs)
│   ├── Transforms response
│   └── Passes results to ResultsSection
└── 
    └── ResultsSection
        ├── Receives results array
        ├── Maps to RiskCard components
        ├── Shows each drug's analysis
        └── Provides download/copy options
```

---

## API Contract

### Request (Frontend → Backend)

```
POST /analyze HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="sample.vcf"
Content-Type: text/plain

[VCF file contents]
------WebKitFormBoundary
Content-Disposition: form-data; name="drug"

CODEINE
------WebKitFormBoundary
Content-Disposition: form-data; name="patient_id"

unknown
------WebKitFormBoundary--
```

### Response (Backend → Frontend)

```json
{
  "patient_id": "unknown",
  "drug": "CODEINE",
  "timestamp": "2026-02-19T10:30:00Z",
  
  "risk_assessment": {
    "risk_label": "Safe",
    "confidence_score": 0.92,
    "severity": "none"
  },
  
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2D6",
    "diplotype": "*1/*1",
    "phenotype": "Normal Metabolizer",
    "detected_variants": []
  },
  
  "clinical_recommendation": {
    "recommendation": "Standard codeine dosing...",
    "evidence_level": "Level A"
  },
  
  "llm_generated_explanation": {
    "summary": "Your genetic profile...",
    "variant_citations": []
  },
  
  "quality_metrics": {
    "vcf_parsing_success": true,
    "total_variants_scanned": 0,
    "non_pgx_variants_count": 0,
    "confidence_score": 0.92
  }
}
```

---

## Environment Configuration

```
Frontend (.env.local)
├─ VITE_API_URL = http://localhost:8000

Backend (implicit)
├─ CORS Origins:
│  ├─ http://localhost:5173 (default Vite)
│  ├─ http://localhost:3000 (alternative)
│  └─ http://127.0.0.1:5173 (localhost variant)
├─ Methods: GET, POST, OPTIONS, etc.
└─ Headers: All allowed
```

---

## Error Handling Flow

```
User Action (Upload + Select Drug + Analyze)
    ↓
Frontend validates input
    ├─ NO FILE → Show error: "Please select a VCF file"
    └─ NO DRUG → Show error: "Please select at least one drug"
    ↓
Call API: analyzeVCF()
    ├─ NETWORK ERROR → Catch: "Failed to fetch" / "Connection refused"
    ├─ CORS ERROR → Browser blocks: "CORS policy blocked"
    ├─ API ERROR → Show: Backend error message
    └─ SUCCESS → Process response
    ↓
Transform response
    ├─ TRANSFORM ERROR → Show: "Failed to process results"
    └─ SUCCESS → Display results
    ↓
Display Results or Error Message
```

---

## Testing Strategy

### Level 1: Backend Only
```bash
curl -X POST -F "file=@sample.vcf" -F "drug=CODEINE" http://localhost:8000/analyze
```

### Level 2: CORS Verification
```javascript
// In browser console:
fetch('http://localhost:8000/').then(r => r.json()).then(console.log)
```

### Level 3: Full Integration
1. Start backend
2. Start frontend
3. Upload VCF
4. Select drug
5. Check Network tab for POST request
6. Verify response data
7. Check Results display

---

## Performance Considerations

| Component | Typical Time |
|-----------|--------------|
| VCF Parsing | ~500ms |
| Variant Classification | ~200ms |
| Phenotype Inference | ~100ms |
| CPIC Lookup | ~50ms |
| LLM Explanation | ~1000-2000ms |
| **Total Backend** | **~2-3 seconds** |
| Frontend Transformation | ~50ms |
| **Total Round Trip** | **~2-3 seconds** |

Frontend shows loading bar to indicate processing.
