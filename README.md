# PRECISION MEDICINE ALGORITHM
## Sanjeevani AI: Pharmacogenomic Risk Prediction System

A comprehensive web application that analyzes patient genetic data (VCF files) to predict pharmacogenomic risks and provide personalized drug recommendations based on CPIC (Clinical Pharmacogenetics Implementation Consortium) guidelines.

**🌐 Live Deployment:**
- **Backend API**: Deployed on [Render](https://render.com)
- **Frontend**: Deployed on [Vercel](https://vercel.com)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Installation Instructions](#installation-instructions)
- [Deployment Instructions](#-deployment-instructions)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)
- [Team Members](#team-members)

---

## 🎯 Project Overview

Sanjeevani AI is a precision medicine platform that leverages pharmacogenomics to predict patient-specific drug responses. The system analyzes genetic variants from VCF (Variant Call Format) files, maps them to pharmacogenomically relevant genes, infers metabolic phenotypes, and provides evidence-based clinical recommendations using CPIC guidelines.

### Key Features

- **VCF File Processing**: Parse and extract genetic variants from standard VCF files
- **Variant Mapping**: Identify pharmacogenomically relevant variants across critical genes (CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD)
- **Phenotype Inference**: Determine metabolic phenotypes based on detected variants
- **CPIC Guideline Application**: Generate clinical recommendations following CPIC standards
- **AI-Powered Explanations**: LLM-generated explanations of pharmacogenomic interactions
- **Confidence Scoring**: Calculate confidence metrics for risk assessments
- **Modern UI**: Beautiful, responsive frontend with real-time analysis visualization
- **Production Ready**: Fully deployed on Render (backend) and Vercel (frontend) with CORS configuration

---

## 🏗️ Architecture Overview

The application follows a **client-server architecture** with clear separation between frontend and backend:

```
┌───────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ File Upload  │  │ Drug Input   │  │   Results    │     │
│  │   Section    │→ │   Section    │→ │   Section    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────┬──────────────────────────────┘
                             │ HTTP/REST API
                             │ (JSON)
┌────────────────────────────┴──────────────────────────────┐
│              Backend (FastAPI + Python)                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              API Endpoints Layer                    │  │
│  │  /analyze, /test-vcf, /test-mapping, etc.           │  │
│  └─────────────────────────────────────────────────────┘  │
│                              │                            │
│  ┌───────────────────────────┼─────────────────────────┐  │
│  │                           │                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │ VCF Parser   │→ │   Variant    │→ │ Phenotype  │ │  │
│  │  │              │  │   Mapper     │  │   Engine   │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  │                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │   CPIC       │← │   Scoring    │  │    LLM     │ │  │
│  │  │   Engine     │  │   Engine     │  │   Engine   │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │         External Services                            │ │
│  │  • Mistral AI API (for LLM explanations)             │ │
│  │  • CPIC Database (embedded variant mappings)         │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Input**: User uploads VCF file and selects a drug
2. **Parsing**: VCF parser extracts variants (rsIDs, genotypes)
3. **Mapping**: Variant mapper identifies pharmacogenomic variants
4. **Phenotyping**: Phenotype engine infers metabolic phenotypes
5. **Guideline Application**: CPIC engine applies drug-specific guidelines
6. **Scoring**: Confidence engine calculates assessment confidence
7. **Explanation**: LLM engine generates human-readable explanations
8. **Output**: Comprehensive risk assessment with recommendations

---

## 🛠️ Tech Stack

### Backend

- **Framework**: FastAPI 0.115.5
- **Server**: Uvicorn 0.32.1
- **Language**: Python 3.x
- **AI/ML**:
  - OpenAI SDK (for Mistral AI integration) >= 1.54.0
  - Pandas >= 2.2.0
  - NumPy >= 1.26.0
- **Data Validation**: Pydantic >= 2.9.0
- **HTTP Client**: httpx >= 0.27.0
- **Environment Management**: python-dotenv 1.0.1
- **File Handling**: python-multipart 0.0.12

### Frontend

- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.5
- **Package Manager**: npm (dependencies managed via `package.json`)
- **Styling**: TailwindCSS 3.4.17
- **Animations**: Framer Motion 12.34.2
- **Icons**: Lucide React 0.469.0
- **UI Components**: React Select 5.10.0
- **Utilities**: 
  - clsx 2.1.1
  - tailwind-merge 2.6.0

**Note**: All frontend dependencies are defined in `frontend/package.json`. Run `npm install` to install all required packages.

### Deployment

This application is deployed using:
- **Backend**: [Render](https://render.com) - Python web service hosting for FastAPI
- **Frontend**: [Vercel](https://vercel.com) - Static hosting for React/Vite application
- **Environment**: Production-ready with CORS configuration between Render and Vercel

---

## 📦 Installation Instructions

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 18+** and **npm** (for frontend)
- **Mistral AI API Key** (for LLM explanations)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd Rift_hackathon/backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Mistral API key:
   ```env
   MISTRAL_API_KEY=your_mistral_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```

5. **Run the backend server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

**Note**: The frontend requires `package.json` for dependency management. All frontend dependencies are defined in `frontend/package.json`.

1. **Navigate to frontend directory**:
   ```bash
   cd Rift_hackathon/frontend
   ```

2. **Install dependencies** (uses `package.json`):
   ```bash
   npm install
   ```
   This will install all dependencies listed in `package.json`:
   - React 18.3.1 & React DOM
   - Vite 6.0.5 (build tool)
   - TailwindCSS 3.4.17 (styling)
   - Framer Motion 12.34.2 (animations)
   - Lucide React (icons)
   - React Select (UI components)
   - And other dev dependencies

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

---

## 🚀 Deployment Instructions

This application is deployed on **Render** (backend) and **Vercel** (frontend). This section provides step-by-step instructions for deploying both services to production.

### Quick Deployment Summary

| Component | Platform | Configuration File | Status |
|-----------|----------|-------------------|--------|
| **Backend API** | [Render](https://render.com) | `render.yaml` | ✅ Configured |
| **Frontend** | [Vercel](https://vercel.com) | `vercel.json` | ✅ Configured |

**Deployment Flow**: Backend (Render) → Frontend (Vercel) → Configure CORS

### Prerequisites for Deployment

- GitHub repository with your code pushed
- Mistral AI API key (required for backend LLM features)
- Accounts on deployment platforms:
  - **Render** account - [Sign up here](https://render.com) (for backend)
  - **Vercel** account - [Sign up here](https://vercel.com) (for frontend)

---

### Backend Deployment on Render

The FastAPI backend is deployed on **Render**. The project includes a `render.yaml` configuration file for streamlined deployment.

#### Option 1: Using Render Dashboard (Recommended)

1. **Sign in to Render**:
   - Go to [render.com](https://render.com) and sign in with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this project

3. **Configure Service Settings**:
   - **Name**: `sanjeevani-backend` (or your preferred name)
   - **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**:
   Click "Environment" tab and add:
   ```
   MISTRAL_API_KEY=your_mistral_api_key_here
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
   **Important**: Replace `your_mistral_api_key_here` with your actual Mistral API key.

5. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your backend
   - Wait for deployment to complete (usually 2-5 minutes)
   - Your backend URL will be: `https://sanjeevani-backend.onrender.com` (or your custom name)

6. **Verify Deployment**:
   ```bash
   curl https://your-backend.onrender.com/
   ```
   Should return: `{"message":"PharmaGuard Backend Running"}`

#### Option 2: Using render.yaml (Infrastructure as Code)

The project includes `render.yaml` for automated deployment:

1. **Push render.yaml to your repository** (already included)

2. **In Render Dashboard**:
   - Go to "New +" → "Blueprint"
   - Connect your repository
   - Render will detect `render.yaml` and create the service automatically

3. **Set Environment Variables**:
   - Go to your service → "Environment"
   - Add `MISTRAL_API_KEY` manually (not synced for security)

---

### Frontend Deployment on Vercel

The React frontend is deployed on **Vercel**. The project includes `vercel.json` configuration for optimal Vite deployment.

#### Step-by-Step Deployment

1. **Sign in to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project Settings**:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Set Environment Variables**:
   Click "Environment Variables" and add:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
   **Important**: Replace `https://your-backend.onrender.com` with your actual Render backend URL from the previous step.

5. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Deployment typically takes 1-3 minutes
   - Your frontend URL will be: `https://your-project.vercel.app`

6. **Update Backend CORS** (if needed):
   - Go back to Render dashboard
   - Update `FRONTEND_URL` environment variable to your Vercel URL
   - Redeploy backend if CORS issues occur

---

### Complete Deployment Workflow

**Recommended Order**: Deploy backend first, then frontend (so you can configure CORS properly)

1. **Deploy Backend on Render** → Get backend URL
2. **Deploy Frontend on Vercel** → Use backend URL in environment variables
3. **Update Backend CORS** → Add Vercel URL to Render environment variables
4. **Test End-to-End** → Verify frontend can communicate with backend

---

### Alternative Deployment Options

> **Note**: This application is configured for **Render + Vercel** deployment. The following are alternative options if you prefer different platforms.

#### Backend Alternatives (if not using Render)

**Heroku**:
```bash
# Create Procfile in backend/ directory
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > backend/Procfile

# Deploy via Heroku CLI
heroku create your-app-name
heroku config:set MISTRAL_API_KEY=your_key
git push heroku main
```

**Railway**:
1. Connect GitHub repository
2. Select `backend` as root directory
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables

**AWS/GCP/Azure**:
- Use containerized deployment (Docker)
- See Docker deployment section below

#### Frontend Alternatives (if not using Vercel)

**Netlify**:
1. Connect GitHub repository
2. Set build directory: `frontend`
3. Build command: `cd frontend && npm install && npm run build`
4. Publish directory: `frontend/dist`
5. Add environment variable: `VITE_API_URL`

**GitHub Pages**:
```bash
cd frontend
npm run build
# Deploy dist/ folder to gh-pages branch
```

---

### Docker Deployment (Optional - For Self-Hosting)

For containerized deployment, create a `Dockerfile` in the backend directory:

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and Run**:
```bash
cd backend
docker build -t sanjeevani-backend .
docker run -p 8000:8000 -e MISTRAL_API_KEY=your_key sanjeevani-backend
```

---

### Post-Deployment Checklist

- [ ] Backend is accessible and returns health check response
- [ ] Frontend can communicate with backend (check browser console)
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly
- [ ] File upload functionality works
- [ ] API endpoints respond correctly
- [ ] SSL certificates are active (HTTPS)
- [ ] Error handling works in production

---

### Troubleshooting Deployment Issues

#### Backend Issues

**Issue**: Backend fails to start
- **Solution**: Check logs in Render dashboard, verify `requirements.txt` is correct

**Issue**: CORS errors
- **Solution**: Update `FRONTEND_URL` in backend environment variables

**Issue**: API key not found
- **Solution**: Verify `MISTRAL_API_KEY` is set in Render environment variables

#### Frontend Issues

**Issue**: Cannot connect to backend
- **Solution**: Verify `VITE_API_URL` matches your backend URL exactly

**Issue**: Build fails
- **Solution**: Check `package.json` dependencies, ensure Node.js version is compatible

**Issue**: Blank page after deployment
- **Solution**: Check browser console for errors, verify `vercel.json` routing configuration

---

### Monitoring & Maintenance

1. **Monitor Backend Logs**: Use Render dashboard → Logs tab
2. **Monitor Frontend Analytics**: Use Vercel Analytics (built-in)
3. **Set up Alerts**: Configure uptime monitoring (e.g., UptimeRobot)
4. **Regular Updates**: Keep dependencies updated for security patches
5. **Backup**: Ensure your code is in version control (GitHub)

---

### Deployment Platform Details

#### Render (Backend)
- **Free Tier**: Available but spins down after 15 minutes of inactivity
- **Paid Plans**: Start at $7/month for always-on service
- **Features**: Automatic SSL, custom domains, environment variables, log access
- **Best For**: Python/FastAPI applications, API services
- **Documentation**: [Render Docs](https://render.com/docs)

#### Vercel (Frontend)
- **Free Tier**: Generous limits including 100GB bandwidth/month
- **Paid Plans**: Start at $20/month for team features
- **Features**: Automatic SSL, CDN, preview deployments, analytics
- **Best For**: React/Next.js/Vite applications, static sites
- **Documentation**: [Vercel Docs](https://vercel.com/docs)

#### Mistral AI (LLM Service)
- **Pricing**: Pay-per-use model
- **Check**: [Mistral AI pricing](https://mistral.ai/pricing)
- **Usage**: Used for generating pharmacogenomic explanations

### Cost Optimization Tips

- **Development**: Use free tiers for testing
- **Production**: Consider paid tiers for:
  - Always-on backend (Render)
  - Better performance and reliability
  - Custom domains
  - Advanced analytics
- **Monitoring**: Track API usage to optimize Mistral AI costs
- **Caching**: Implement caching strategies to reduce API calls

---

## 📚 API Documentation

### Base URL

- **Development**: `http://localhost:8000`
- **Production (Render)**: `https://your-backend.onrender.com` (replace with your actual Render URL)

### Endpoints

#### `GET /`

Health check endpoint.

**Response**:
```json
{
  "message": "PharmaGuard Backend Running"
}
```

---

#### `POST /analyze`

Main analysis endpoint. Analyzes a VCF file for pharmacogenomic risks related to a specific drug.

**Request**:
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (File, required): VCF file to analyze
  - `drug` (String, required): Drug name (e.g., "CODEINE", "WARFARIN", "CLOPIDOGREL")
  - `patient_id` (String, optional): Patient identifier (default: "unknown")

**Example Request** (cURL):
```bash
curl -X POST "http://localhost:8000/analyze" \
  -F "file=@patient_sample.vcf" \
  -F "drug=CODEINE" \
  -F "patient_id=PATIENT_001"
```

**Response**:
```json
{
  "patient_id": "PATIENT_001",
  "drug": "CODEINE",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "risk_assessment": {
    "risk_label": "High Risk",
    "confidence_score": 0.85,
    "severity": "high"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2D6",
    "diplotype": "*1/*4",
    "phenotype": "Intermediate Metabolizer",
    "detected_variants": [
      {
        "rsid": "rs1065852",
        "gene": "CYP2D6",
        "allele": "*4",
        "effect": "No Function",
        "genotype": "0/1"
      }
    ]
  },
  "clinical_recommendation": {
    "recommendation": "Consider dose reduction of 25% or monitor for inadequate pain control.",
    "evidence_level": "Level A"
  },
  "llm_generated_explanation": {
    "summary": "Patient carries CYP2D6*4 allele (rs1065852) resulting in intermediate metabolizer phenotype...",
    "variant_citations": [
      {
        "rsid": "rs1065852",
        "allele": "*4",
        "genotype": "0/1"
      }
    ]
  },
  "quality_metrics": {
    "vcf_parsing_success": true,
    "total_variants_scanned": 1250,
    "non_pgx_variants_count": 1245,
    "confidence_score": 0.85
  }
}
```

---

#### `POST /test-vcf`

Test endpoint to verify VCF file parsing.

**Request**:
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (File, required): VCF file

**Response**:
```json
{
  "detected_rsids": [
    {
      "rsid": "rs1065852",
      "genotype": "0/1",
      "chrom": "22",
      "pos": 42522500
    }
  ]
}
```

---

#### `POST /test-mapping`

Test endpoint to verify variant mapping functionality.

**Request**:
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (File, required): VCF file

**Response**: Returns mapped variants with gene associations and effects.

---

#### `POST /test-phenotype`

Test endpoint to verify phenotype inference.

**Request**:
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (File, required): VCF file

**Response**: Returns inferred phenotypes for each pharmacogenomic gene.

---

#### `POST /test-cpic`

Test endpoint to verify CPIC guideline application.

**Request**:
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (File, required): VCF file

**Response**: Returns CPIC recommendations for CLOPIDOGREL (hardcoded for testing).

---

#### `POST /analyze-manual`

Manual analysis endpoint (alternative to VCF upload).

**Request**:
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "gene": "CYP2D6",
  "phenotype": "Intermediate Metabolizer",
  "drug": "CODEINE"
}
```

**Response**:
```json
{
  "gene": "CYP2D6",
  "phenotype": "Intermediate Metabolizer",
  "drug": "CODEINE"
}
```

---

### Supported Drugs

The system currently supports analysis for the following drugs:

- **CODEINE** (CYP2D6)
- **WARFARIN** (CYP2C9, VKORC1)
- **CLOPIDOGREL** (CYP2C19)
- **SIMVASTATIN** (SLCO1B1)
- **MERCAPTOPURINE** (TPMT)
- **FLUOROURACIL** (DPYD)

### Supported Genes

- **CYP2D6**: Cytochrome P450 2D6
- **CYP2C19**: Cytochrome P450 2C19
- **CYP2C9**: Cytochrome P450 2C9
- **SLCO1B1**: Solute Carrier Organic Anion Transporter Family Member 1B1
- **TPMT**: Thiopurine S-Methyltransferase
- **DPYD**: Dihydropyrimidine Dehydrogenase

---

## 💡 Usage Examples

### Example 1: Analyzing Codeine Risk

**Scenario**: A patient's VCF file needs to be analyzed for codeine prescription safety.

**Steps**:
1. Upload the patient's VCF file through the web interface
2. Select "CODEINE" from the drug dropdown
3. Click "Analyze"
4. Review the results:
   - Risk assessment (Safe/Warning/High Risk)
   - Detected variants and diplotype
   - Clinical recommendation
   - AI-generated explanation

**Expected Output**:
- If patient is an **Ultra-Rapid Metabolizer**: "High Risk - Avoid codeine"
- If patient is a **Normal Metabolizer**: "Safe - Standard dosing"
- If patient is an **Intermediate Metabolizer**: "Warning - Consider dose adjustment"

---

### Example 2: Using cURL for API Testing

```bash
# Test VCF parsing
curl -X POST "http://localhost:8000/test-vcf" \
  -F "file=@sample.vcf"

# Full analysis
curl -X POST "http://localhost:8000/analyze" \
  -F "file=@patient_data.vcf" \
  -F "drug=WARFARIN" \
  -F "patient_id=PT_12345"
```

---

### Example 3: Frontend Integration

```javascript
import { analyzeVCF } from './services/api';

const handleAnalysis = async (file, drug) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('drug', drug);
    formData.append('patient_id', 'PATIENT_001');
    
    const result = await analyzeVCF(formData);
    console.log('Risk Assessment:', result.risk_assessment);
    console.log('Recommendation:', result.clinical_recommendation);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

---

### Example 4: VCF File Format

The system expects standard VCF format:

```vcf
##fileformat=VCFv4.3
##contig=<ID=22>
#CHROM  POS     ID          REF  ALT  QUAL  FILTER  INFO  FORMAT  SAMPLE
22      42522500  rs1065852   G    A    .     PASS    .     GT      0/1
22      42525000  rs4244285   G    A    .     PASS    .     GT      1/1
```

---

## 👥 Team Members

<!-- Add your team members here -->
- **Dhruv Mishra** - Role/Contribution
- **Soham Dhamankar** - Role/Contribution
- **Pranay Metkari** - Role/Contribution
- **Sinan Shaikh** - Role/Contribution

---

## 📝 Notes

- The system uses a curated variant database based on CPIC and PharmVar references
- LLM explanations are generated using Mistral AI's API
- Confidence scores are calculated based on variant detection quality and phenotype inference certainty
- All recommendations follow CPIC (Clinical Pharmacogenetics Implementation Consortium) guidelines

---

## 🔒 Security & Privacy

- Patient data is processed server-side and not stored permanently
- VCF files are processed in-memory and not persisted
- API keys should be kept secure and never committed to version control
- CORS is configured to restrict frontend origins

---


