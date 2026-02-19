# Quick Start Guide - Frontend & Backend Integration

## 📋 Prerequisites
- Node.js installed (for frontend)
- Python 3.8+ installed (for backend)
- Virtual environment set up for backend

---

## 🚀 Start Here: 5-Minute Setup

### Step 1: Start the Backend (Terminal 1)
```bash
cd backend

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Run backend server (port 8000)
uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Step 2: Start the Frontend (Terminal 2)
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Run frontend dev server (port 5173)
npm run dev
```

**Expected output:**
```
  VITE v6.0.5  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 3: Test the Integration
1. Open browser: `http://localhost:5173`
2. Upload a VCF file (test file provided or use your own)
3. Select a drug (e.g., CODEINE)
4. Click "Analyze"
5. Wait 2-3 seconds for results
6. You should see:
   - Drug name
   - Risk level (Safe, Warn, or High Risk)
   - Confidence score
   - Recommendations
   - Gene information

**✅ If you see results, integration is working!**

---

## 🔍 Verify Each Layer

### Frontend Layer
```
http://localhost:5173 loads? ✓
Can upload VCF file? ✓
Can select drugs? ✓
Can click Analyze button? ✓
```

### Backend Layer
```
http://localhost:8000 returns {"message":"PharmaGuard Backend Running"}? ✓
```

### Network Communication
1. Open DevTools (F12)
2. Go to Network tab
3. Perform analysis
4. Look for POST request to `/analyze`
5. Response status should be 200 ✓

### Display Results
1. Results appear in 2-3 seconds ✓
2. Data shows actual values (not random) ✓
3. Multiple drugs show separate cards ✓

---

## 🐛 Troubleshooting

### "Can't connect to backend"
```bash
# Check if backend is running
curl http://localhost:8000

# If error, start backend in terminal 1:
cd backend
.\venv\Scripts\Activate.ps1  # Windows
uvicorn main:app --reload --port 8000
```

### "CORS error in console"
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- CORS middleware should be in `backend/main.py`
- Verify it's there by checking the file
- If missing, add it and restart backend

### "Can't find .env.local"
**Solution:**
- Frontend should have `.env.local` in root
- If missing, create it:
```bash
cd frontend
echo "VITE_API_URL=http://localhost:8000" > .env.local
```

### "Request fails with 404"
**Solution:**
- Check that `/analyze` endpoint exists in backend
- Check endpoint path is correct in API service

### "Results don't update"
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart frontend dev server
3. Make sure `.env.local` has correct API URL

---

## 📊 What You Should See

### On First Load
```
Frontend loads with:
- Upload VCF area
- Device toggle
- Drug selection grid
- Step indicator (1, 2)
```

### After Upload
```
VCF file shown as loaded:
- File name displayed
- File size shown
- "Ready to analyze" message
```

### After Drug Selection
```
Selected drugs highlighted:
- Drug card has checkmark
- Blue border around drug
- Analyze button becomes active
```

### During Analysis
```
Loading bar appears:
- Progresses from 0% to 100%
- Takes 2-3 seconds
- Smooth animation
```

### Final Results
```
Risk cards appear:
- One card per drug
- Shows: drug name, risk, confidence, recommendations
- Can copy JSON or download results
```

---

## 🔐 Security Notes

### CORS Configuration
Currently allows:
- `http://localhost:5173` ✓
- `http://localhost:3000` ✓
- `http://127.0.0.1:5173` ✓

### For Production
Update CORS origins:
```python
allow_origins=["https://yourdomain.com"],  # Your actual domain
```

### Environment Variables
Keep `.env.local` out of git:
```bash
# In .gitignore
.env.local
.env
```

---

## 📁 File Structure

```
Rfit/
├── backend/
│   ├── main.py (✅ CORS added)
│   ├── requirements.txt
│   ├── models.py
│   ├── vcf_parser.py
│   ├── variant_mapper.py
│   ├── phenotype_engine.py
│   ├── cpic_engine.py
│   ├── scoring_engine.py
│   ├── llm_engine.py
│   └── venv/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx (✅ Real API calls)
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── services/
│   │   │   └── api.js (✅ NEW - API service)
│   │   └── components/
│   │       ├── FileUploadSection.jsx
│   │       ├── DrugInputSection.jsx
│   │       ├── ResultsSection.jsx
│   │       └── ...
│   ├── .env.local (✅ NEW - API config)
│   ├── .env.example (✅ NEW - template)
│   ├── package.json
│   ├── vite.config.js
│   └── node_modules/
│
├── INTEGRATION_GUIDE.md (✅ Detailed guide)
├── INTEGRATION_SUMMARY.md (✅ Overview)
├── ARCHITECTURE.md (✅ System design)
├── SETUP_CHECKLIST.md (✅ Verification)
└── README.md
```

---

## 🧪 Manual API Testing

### Test 1: Health Check
```bash
curl http://localhost:8000
```

Expected:
```json
{"message":"PharmaGuard Backend Running"}
```

### Test 2: VCF Analysis (with test VCF file)
```bash
curl -X POST \
  -F "file=@path/to/test.vcf" \
  -F "drug=CODEINE" \
  -F "patient_id=test123" \
  http://localhost:8000/analyze
```

Expected: Large JSON response with risk assessment

---

## 📞 Support

### Check These First:
1. ✅ Backend running on port 8000?
2. ✅ Frontend running on port 5173?
3. ✅ `.env.local` exists with API URL?
4. ✅ CORS middleware in backend?
5. ✅ Both terminals showing "running" message?

### Debug Steps:
1. Check browser DevTools → Console for errors
2. Check browser DevTools → Network tab for failed requests
3. Check backend terminal for error messages
4. Check `.env.local` for correct API URL

### Still Having Issues?
1. Restart both frontend and backend
2. Clear browser cache
3. Verify all files were created
4. Check that ports 5173 and 8000 are available

---

## 🎉 You're All Set!

Once you see analysis results with real data (not random), integration is complete.

**Key Indicators of Success:**
- ✅ Upload VCF works
- ✅ Drug selection works
- ✅ Analysis completes in 2-3 seconds
- ✅ Results show actual drug-gene interactions
- ✅ No CORS errors in console
- ✅ Network request shows 200 status

---

## Next Steps

1. Test with multiple VCF files
2. Try different drug combinations
3. Monitor backend logs during analysis
4. Verify results accuracy with known drug-gene pairs
5. When ready for production, update API URL in `.env.local`

Enjoy! 🚀
