#!/usr/bin/env python
import sys
from vcf_parser import extract_variants
from variant_mapper import classify_variants
from phenotype_engine import infer_phenotypes
from cpic_engine import apply_cpic_guideline
from io import BytesIO

# Mock file object
class MockFile:
    def __init__(self, content):
        self.file = BytesIO(content)

# Read the VCF file
with open("test_variants.vcf", "rb") as f:
    vcf_content = f.read()

mock_file = MockFile(vcf_content)

# Step 1: Extract variants
variants = extract_variants(mock_file)
print(f"✓ Extracted {len(variants)} variants")
for v in variants:
    print(f"  - {v['rsid']}: {v['genotype']}")

# Step 2: Classify variants
classification = classify_variants(variants)
mapped = classification["recognized_pgx_variants"]
print(f"\n✓ Classified {len(mapped)} as PGx variants")
for v in mapped:
    print(f"  - {v['rsid']} ({v['gene']}): {v['effect']} {v['genotype']}")

# Step 3: Infer phenotypes
phenotypes = infer_phenotypes(mapped)
print(f"\n✓ Inferred phenotypes:")
for gene, phenotype in phenotypes.items():
    if phenotype != "NM":
        print(f"  - {gene}: {phenotype}")
    else:
        print(f"  - {gene}: {phenotype} (default)")

# Step 4: Test different drugs
print(f"\n✓ CPIC Guideline Lookups:")
drugs = ["CODEINE", "WARFARIN", "CLOPIDOGREL", "SIMVASTATIN", "AZATHIOPRINE", "FLUOROURACIL"]
for drug in drugs:
    result = apply_cpic_guideline(phenotypes, drug)
    drug_result = result.get(drug, {})
    gene = drug_result.get("gene", "N/A")
    risk = drug_result.get("risk_category", "Unknown")
    rec = drug_result.get("recommendation", "N/A")
    print(f"\n  {drug}")
    print(f"    Gene: {gene}")
    print(f"    Risk: {risk}")
    print(f"    Rec: {rec}")
