from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

from models import ManualInput
from vcf_parser import extract_variants
from variant_mapper import map_rsids_to_effects, classify_variants
from phenotype_engine import infer_phenotypes
from cpic_engine import apply_cpic_guideline
from scoring_engine import calculate_confidence
from llm_engine import generate_explanation


app = FastAPI()

# ---------------------------
# CORS Configuration
# ---------------------------

_frontend_url = os.getenv("FRONTEND_URL", "")
_allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

if _frontend_url:
    _allowed_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Root Endpoint
# ---------------------------

@app.get("/")
def home():
    return {"message": "PharmaGuard Backend Running"}

# ---------------------------
# Test Endpoints
# ---------------------------

@app.post("/test-vcf")
async def test_vcf(file: UploadFile = File(...)):
    variants = extract_variants(file)
    return {"detected_rsids": variants}


@app.post("/analyze-manual")
def analyze_manual(data: ManualInput):
    return {
        "gene": data.gene,
        "phenotype": data.phenotype,
        "drug": data.drug
    }

# ---------------------------
# Main Analyze Endpoint
# ---------------------------

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    drug: str = Form(...),
    patient_id: str = Form("unknown")
):

    variants = extract_variants(file)

    classification = classify_variants(variants)
    mapped = classification["recognized_pgx_variants"]

    phenotypes = infer_phenotypes(mapped)

    cpic_result = apply_cpic_guideline(phenotypes, drug)

    confidence = calculate_confidence(mapped, phenotypes)

    # Diplotype helper
    def compute_diplotype(variants_for_gene):
        if not variants_for_gene:
            return "*1/*1"

        alleles = []

        for v in variants_for_gene:
            allele = v.get("allele")
            gt = v.get("genotype")

            if gt == "1/1":
                alleles.extend([allele, allele])
            elif gt == "0/1":
                alleles.append(allele)

        while len(alleles) < 2:
            alleles.append("*1")

        return f"{alleles[0]}/{alleles[1]}"

    drug_list = [d.strip().upper() for d in drug.split(",")]

    drug_results = {}

    for drug_key in drug_list:

        risk_entry = cpic_result.get(drug_key)

        if not risk_entry:
            drug_results[drug_key] = {
                "primary_gene": None,
                "diplotype": None,
                "phenotype": None,
                "risk_assessment": {
                    "risk_label": "Unknown",
                    "confidence_score": confidence,
                    "severity": "Unknown"
                },
                "clinical_recommendation": {
                    "recommendation": "No CPIC guideline available",
                    "evidence_level": None
                },
                "llm_generated_explanation": {
                    "summary": "No gene/variant match to generate explanation.",
                    "variant_citations": []
                }
            }
            continue

        primary_gene = risk_entry.get("gene")
        variants_for_primary = [v for v in mapped if v.get("gene") == primary_gene] if primary_gene else []

        diplotype = compute_diplotype(variants_for_primary)

        # LLM explanation per drug
        llm_resp = generate_explanation(
            primary_gene,
            risk_entry.get("phenotype"),
            drug_key,
            variants_for_primary
        )

        drug_results[drug_key] = {
            "primary_gene": primary_gene,
            "diplotype": diplotype,
            "phenotype": risk_entry.get("phenotype"),
            "risk_assessment": {
                "risk_label": risk_entry.get("risk_category"),
                "confidence_score": confidence,
                "severity": risk_entry.get("severity")
            },
            "clinical_recommendation": {
                "recommendation": risk_entry.get("recommendation"),
                "evidence_level": risk_entry.get("evidence_level")
            },
            "llm_generated_explanation": {
                "summary": llm_resp.get("explanation_text"),
                "variant_citations": llm_resp.get("variant_citations")
            }
        }

    quality_metrics = {
        "vcf_parsing_success": len(variants) > 0,
        "total_variants_scanned": classification["total_variants_scanned"],
        "non_pgx_variants_count": classification["non_pgx_variants_count"],
        "confidence_score": confidence
    }

    return {
        "patient_id": patient_id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "drug_results": drug_results,
        "quality_metrics": quality_metrics
    }

# ---------------------------
# Additional Test Routes
# ---------------------------

@app.post("/test-mapping")
async def test_mapping(file: UploadFile = File(...)):
    variants = extract_variants(file)
    mapped = map_rsids_to_effects(variants)
    return mapped


@app.post("/test-phenotype")
async def test_phenotype(file: UploadFile = File(...)):
    variants = extract_variants(file)
    mapped = map_rsids_to_effects(variants)
    phenotypes = infer_phenotypes(mapped)
    return phenotypes


@app.post("/test-cpic")
async def test_cpic(file: UploadFile = File(...)):
    variants = extract_variants(file)
    mapped = map_rsids_to_effects(variants)
    phenotypes = infer_phenotypes(mapped)

    result = apply_cpic_guideline(phenotypes, "CLOPIDOGREL")
    return result


@app.post("/test-full")
async def test_full(file: UploadFile = File(...)):
    variants = extract_variants(file)
    mapped = map_rsids_to_effects(variants)
    phenotypes = infer_phenotypes(mapped)

    cpic_result = apply_cpic_guideline(phenotypes, "CLOPIDOGREL")
    confidence = calculate_confidence(mapped, phenotypes)

    return {
        "cpic_result": cpic_result,
        "confidence_score": confidence
    }


@app.post("/test-complete")
async def test_complete(file: UploadFile = File(...)):
    variants = extract_variants(file)
    mapped = map_rsids_to_effects(variants)
    phenotypes = infer_phenotypes(mapped)

    cpic_result = apply_cpic_guideline(phenotypes, "CLOPIDOGREL")
    confidence = calculate_confidence(mapped, phenotypes)

    explanations = {}

    for gene in cpic_result.keys():
        explanations[gene] = generate_explanation(
            gene,
            phenotypes.get(gene),
            "CLOPIDOGREL"
        )

    return {
        "cpic_result": cpic_result,
        "confidence_score": confidence,
        "mechanism_explanation": explanations
    }