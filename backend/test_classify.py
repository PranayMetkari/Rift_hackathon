from vcf_parser import extract_variants
from variant_mapper import classify_variants

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
print(f"Total variants: {classification['total_variants_scanned']}")
print(f"Recognized PGx variants: {len(classification['recognized_pgx_variants'])}")
print(f"Non-PGx variants: {classification['non_pgx_variants_count']}")
for v in classification['recognized_pgx_variants']:
    print(f"  {v['rsid']} - {v['gene']} - {v['genotype']}")
