#!/usr/bin/env python
# Test the phenotype engine with sample data
from phenotype_engine import infer_phenotypes
from cpic_engine import apply_cpic_guideline

# Simulate different variant profiles
test_cases = [
    {
        "case": "No variants (all 0/0)",
        "variants": []
    },
    {
        "case": "CYP2C19 IM (1 loss)",
        "variants": [
            {"gene": "CYP2C19", "effect": "loss_of_function", "genotype": "0/1"}
        ]
    },
    {
        "case": "CYP2D6 IM (1 loss)",
        "variants": [
            {"gene": "CYP2D6", "effect": "loss_of_function", "genotype": "0/1"}
        ]
    },
    {
        "case": "TPMT PM (2 losses)",
        "variants": [
            {"gene": "TPMT", "effect": "loss_of_function", "genotype": "1/1"}
        ]
    }
]

print("="*60)
print("PHENOTYPE INFERENCE TEST")
print("="*60)

for test in test_cases:
    phenotypes = infer_phenotypes(test["variants"])
    print(f"\n{test['case']}:")
    print(f"  Phenotypes: {phenotypes}")
    
    # Test CPIC lookup for different drugs
    drugs_to_test = ["CODEINE", "WARFARIN", "CLOPIDOGREL", "AZATHIOPRINE"]
    for drug in drugs_to_test:
        result = apply_cpic_guideline(phenotypes, drug)
        risk = result.get(drug, {}).get("risk_category", "Unknown")
        gene = result.get(drug, {}).get("gene", "N/A")
        print(f"    {drug}: {gene} -> {risk}")

print("\n" + "="*60)
