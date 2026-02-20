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
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
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
    print(f"DEBUG test-vcf: Extracted {len(variants)} raw variants")
    
    classification = classify_variants(variants)
    mapped = classification["recognized_pgx_variants"]
    print(f"DEBUG test-vcf: Classified {len(mapped)} as PGx variants")
    
    phenotypes = infer_phenotypes(mapped)
    print(f"DEBUG test-vcf: Phenotypes = {phenotypes}")
    
    return {
        "raw_variants": len(variants),
        "pgx_variants": len(mapped),
        "detected_rsids": [v["rsid"] for v in mapped],
        "phenotypes": phenotypes,
        "mapped_variants": mapped
    }


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
    print(f"DEBUG: Extracted {len(variants)} variants from VCF")
    if variants:
        print(f"DEBUG: First variant: {variants[0]}")

    classification = classify_variants(variants)
    mapped = classification["recognized_pgx_variants"]
    print(f"DEBUG: Classified {len(mapped)} as pharmacogenomic variants")
    if mapped:
        print(f"DEBUG: First recognized variant: {mapped[0]}")

    # Check if any pharmacogenomic variants were detected
    if not mapped:
        print("WARNING: No pharmacogenomic variants detected in VCF")

    phenotypes = infer_phenotypes(mapped)
    print(f"DEBUG: Inferred phenotypes: {phenotypes}")

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

    # Build response in frontend-expected format
    results = []
    
    for drug_key, drug_data in drug_results.items():
        result = {
            "patient_id": patient_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "drug": drug_key,
            "pharmacogenomic_profile": {
                "primary_gene": drug_data.get("primary_gene"),
                "diplotype": drug_data.get("diplotype"),
                "phenotype": drug_data.get("phenotype"),
                "detected_variants": [v for v in mapped if v.get("gene") == drug_data.get("primary_gene")] if drug_data.get("primary_gene") else []
            },
            "risk_assessment": drug_data.get("risk_assessment", {}),
            "clinical_recommendation": drug_data.get("clinical_recommendation", {}),
            "llm_generated_explanation": drug_data.get("llm_generated_explanation", {}),
            "quality_metrics": quality_metrics
        }
        results.append(result)
    
    # Return single result if one drug, array if multiple
    return results[0] if len(results) == 1 else results

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