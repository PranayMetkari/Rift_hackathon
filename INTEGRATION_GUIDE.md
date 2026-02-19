# Frontend & Backend Integration Guide

## Overview
This document describes all changes made to integrate the React frontend with the FastAPI backend for the PharmaGuard Sanjeevani AI system.

---

## Changes Made

### 1. **Backend CORS Configuration** ✅
**File:** `backend/main.py`

**Changes:**
- Added CORS middleware to allow cross-origin requests from frontend
- Configured to accept requests from:
  - `http://localhost:5173` (Vite dev server)
  - `http://localhost:3000` (Alternative port)
  - `http://127.0.0.1:5173` (Localhost variant)

**Code Added:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Why:** FastAPI blocks CORS requests by default. Without this, the frontend cannot make requests to the backend.

---

### 2. **API Service Layer** ✅
**File:** `frontend/src/services/api.js` (NEW)

**Functions Created:**
- `analyzeVCF()` - Main analysis endpoint for VCF files with drug selection
- `testVCFParsing()` - Test VCF parsing
- `analyzeManualInput()` - Manual variant analysis (future enhancement)
- `healthCheck()` - Test backend connectivity

**Key Features:**
- Centralized API calls (single source of truth)
- Error handling with meaningful messages
- Supports multiple drugs in one request
- Uses environment variable for API URL base

**Example Usage:**
```javascript
import { analyzeVCF } from './services/api';

const results = await analyzeVCF(vcfFile, ['CODEINE', 'WARFARIN']);
```

---

### 3. **Frontend Environment Configuration** ✅
**Files Created:**
- `frontend/.env.local` - Local development environment
- `frontend/.env.example` - Template for developers

**Configuration:**
```
VITE_API_URL=http://localhost:8000
```

**Why:** Allows easy switching between development and production backend URLs without code changes.

---

### 4. **App.jsx Integration** ✅
**File:** `frontend/src/App.jsx`

**Changes:**
1. **Added Import:**
   ```javascript
   import { analyzeVCF } from './services/api';
   ```

2. **Replaced Mock Data with Real API Calls:**
   - Old: Used `setTimeout` with hardcoded mock results
   - New: Calls `analyzeVCF()` with real backend processing

3. **Added Risk Mapping Function:**
   - Maps backend risk categories to frontend UI states
   - Handles variations in backend response format

4. **Improved Error Handling:**
   - Catches and displays API errors to user
   - Shows specific error messages in UI

**Key Changes in `handleAnalyze()`:**
```javascript
const handleAnalyze = async () => {
    // ... validation code ...

    try {
        const analysisResults = await analyzeVCF(sourceFile, selectedDrugs);
        // Transform and display results
    } catch (err) {
        setError(`Analysis failed: ${err.message}`);
    }
};
```

---

## API Endpoints

### **POST /analyze**
Analyzes VCF file with specified drugs

**Request:**
```
FormData:
  - file: File (VCF format)
  - drug: string (drug name)
  - patient_id: string (optional)
```

**Response:**
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
    "recommendation": "Standard codeine dosing is appropriate...",
    "evidence_level": "Level A"
  },
  "llm_generated_explanation": {
    "summary": "...",
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

### **POST /test-vcf**
Tests VCF file parsing

**Request:**
```
FormData:
  - file: File (VCF format)
```

**Response:**
```json
{
  "detected_rsids": [...]
}
```

---

## Development Setup

### **Backend Setup:**
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Run backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend Setup:**
```bash
cd frontend
npm install

# Create .env.local (if not present)
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Run frontend
npm run dev
```

### **Access the Application:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Backend Docs: `http://localhost:8000/docs`

---

## Testing the Integration

### **Step 1: Start Backend**
```bash
cd backend
# Activate virtual environment
uvicorn main:app --reload
```

### **Step 2: Start Frontend**
```bash
cd frontend
npm run dev
```

### **Step 3: Test in Browser**
1. Open `http://localhost:5173`
2. Upload a VCF file
3. Select one or more drugs
4. Click "Analyze"
5. View results from backend

### **Step 4: Check Console (DevTools)**
- **Network Tab:** Should see POST request to `http://localhost:8000/analyze`
- **Console:** Check for errors (should be none)
- **Response:** Should show full backend response

### **Step 5: Test Backend Directly (Optional)**
```bash
# Test API health
curl http://localhost:8000

# You should see:
# {"message":"PharmaGuard Backend Running"}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│
│  1. User uploads VCF file
│  2. User selects drugs
│  3. App.jsx calls analyzeVCF() from services/api.js
│
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP POST
                    /analyze endpoint
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│
│  1. Receives VCF file + drug name
│  2. Parses VCF (vcf_parser.py)
│  3. Maps variants (variant_mapper.py)
│  4. Infers phenotypes (phenotype_engine.py)
│  5. Applies CPIC guidelines (cpic_engine.py)
│  6. Calculates confidence (scoring_engine.py)
│  7. Generates explanations (llm_engine.py)
│  8. Returns structured JSON response
│
└─────────────────────────────────────────────────────────────┘
                            ↓ JSON Response
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│
│  1. Receives analysis results
│  2. Transforms to frontend format
│  3. Displays in ResultsSection
│  4. Shows risk cards, recommendations, confidence scores
│
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### **CORS Error in Browser**
**Error Message:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Ensure backend CORS middleware is properly added
- Check that frontend URL is in `allow_origins` list
- Restart backend server

### **Backend Not Running**
**Error Message:** `Failed to fetch` or `Connection refused`

**Solution:**
```bash
# Make sure backend is running
uvicorn main:app --reload --port 8000

# Check if port 8000 is available
# On Windows:
netstat -ano | findstr :8000
```

### **API URL Incorrect**
**Solution:**
- Check `frontend/.env.local`
- Ensure `VITE_API_URL=http://localhost:8000`
- Restart frontend dev server after changing

### **VCF File Not Processing**
**Solution:**
- Ensure file is valid VCF format
- Check backend logs for parsing errors
- Try with a test VCF file

---

## Future Enhancements

1. **Manual Entry Support:**
   - Connect manual variant entry to new backend endpoint
   - Allow analysis without VCF file

2. **Batch Analysis:**
   - Analyze multiple files simultaneously
   - Support for multiple patients

3. **Production Deployment:**
   - Use environment variables for all URLs
   - Implement proper authentication
   - Add rate limiting

4. **Enhanced Error Messages:**
   - User-friendly error messages in UI
   - Detailed error logs on backend

5. **Response Caching:**
   - Cache frequently analyzed VCF files
   - Improve performance for repeated analyses

---

## Files Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `backend/main.py` | Modified | Added CORS middleware |
| `frontend/src/services/api.js` | Created | API service layer |
| `frontend/src/App.jsx` | Modified | Real API integration |
| `frontend/.env.local` | Created | Environment config |
| `frontend/.env.example` | Created | Config template |

---

## Contact & Support

For issues or questions about the integration:
1. Check backend logs: `uvicorn main:app --reload` output
2. Check browser console (F12 → Console)
3. Check Network tab to see actual requests/responses
