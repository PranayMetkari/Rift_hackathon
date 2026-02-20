from vcf_parser import extract_variants
from variant_mapper import classify_variants
from phenotype_engine import infer_phenotypes

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

print(f"Phenotypes inferred:")
for gene, phenotype in phenotypes.items():
    print(f"  {gene}: {phenotype}")
