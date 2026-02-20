from vcf_parser import extract_variants
from variant_mapper import classify_variants
from phenotype_engine import infer_phenotypes
from cpic_engine import apply_cpic_guideline

class MockFile:
    def read(self):
        with open('test_sample.vcf', 'rb') as f:
            return f.read()

class MockUploadFile:
    def __init__(self):
        self.file = MockFile()

file = MockUploadFile()
variants = extract_variants(file)
classification = classify_variants(variants)
mapped = classification['recognized_pgx_variants']
phenotypes = infer_phenotypes(mapped)

drugs = "CLOPIDOGREL,CODEINE,SIMVASTATIN,WARFARIN"
cpic_result = apply_cpic_guideline(phenotypes, drugs)

print("CPIC Results:")
for drug, result in cpic_result.items():
    print(f"{drug}: {result['risk_category']} (Severity: {result['severity']}) - Gene: {result['gene']}, Phenotype: {result['phenotype']}")
