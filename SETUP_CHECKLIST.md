# Integration Checklist

## Backend Setup ✅
- [ ] Virtual environment activated
- [ ] `pip install -r requirements.txt` executed
- [ ] CORS middleware added to `main.py`
- [ ] Backend running: `uvicorn main:app --reload` (port 8000)
- [ ] Health check passes: `curl http://localhost:8000`
- [ ] API docs accessible: `http://localhost:8000/docs`

## Frontend Setup ✅
- [ ] Dependencies installed: `npm install`
- [ ] `.env.local` created with `VITE_API_URL=http://localhost:8000`
- [ ] API service file exists: `src/services/api.js`
- [ ] App.jsx updated with API imports and real calls
- [ ] Frontend running: `npm run dev` (port 5173)

## Integration Testing ✅
- [ ] Frontend loads at `http://localhost:5173`
- [ ] Can upload VCF file
- [ ] Can select drugs
- [ ] Analysis button triggers API call (check Network tab)
- [ ] Backend processes request without errors
- [ ] Results display in frontend
- [ ] No CORS errors in console
- [ ] No network errors in console

## Validation ✅
- [ ] **Backend CORS:** Request includes proper origin headers
- [ ] **API Request:** POST to `/analyze` with FormData
- [ ] **Response:** Full JSON response with all fields
- [ ] **Frontend Transform:** Data correctly mapped to UI format
- [ ] **UI Display:** Results show drugs, risk levels, recommendations

## Troubleshooting Checklist
- [ ] Backend running on port 8000?
- [ ] Frontend running on port 5173?
- [ ] `.env.local` exists with correct API URL?
- [ ] VCF file is valid?
- [ ] At least one drug selected?
- [ ] Browser console showing the XHR request?
- [ ] Network tab showing 200 status?

## Files to Verify
```
backend/main.py
  └─ CORS middleware imported and added

frontend/src/
  ├─ services/api.js (NEW - API service)
  └─ App.jsx (MODIFIED - uses real API)

frontend/
  ├─ .env.local (NEW - API configuration)
  └─ .env.example (NEW - template)
```

---

## Quick Test Commands

### Backend
```bash
cd backend
# Activate venv, then:
uvicorn main:app --reload
```

### Frontend  
```bash
cd frontend
npm run dev
```

### Test API Connectivity
```bash
curl http://localhost:8000
```

### View Backend API Docs
```
http://localhost:8000/docs
```

---

## Expected Network Request

**When user clicks "Analyze":**
1. Frontend creates FormData with file and selected drugs
2. Sends POST request to `http://localhost:8000/analyze`
3. Backend processes and returns structured JSON
4. Frontend transforms and displays results

**To verify:**
- Open DevTools → Network tab
- Perform analysis
- Look for POST request to `/analyze`
- Response should have `risk_assessment`, `pharmacogenomic_profile`, etc.
