import requests
import json

# Test with the proper VCF file
with open("backend/test_variants.vcf", "rb") as f:
    files = {"file": f}
    data = {"drug": "CODEINE", "patient_id": "test123"}
    
    # Make sure backend file reading works
    f.seek(0)
    response = requests.post("http://localhost:8000/analyze", files=files, data=data, timeout=10)
    
    if response.status_code == 200:
        result = response.json()
        if isinstance(result, list):
            result = result[0]
        
        print("✓ Analysis successful!")
        print(f"  Drug: {result.get('drug')}")
        print(f"  Gene: {result.get('pharmacogenomic_profile', {}).get('primary_gene')}")
        print(f"  Risk: {result.get('risk_assessment', {}).get('risk_label')}")
        print(f"  Phenotype: {result.get('pharmacogenomic_profile', {}).get('phenotype')}")
        print(f"  Variants scanned: {result.get('quality_metrics', {}).get('total_variants_scanned')}")
        print(f"  PGx variants detected: {len(result.get('pharmacogenomic_profile', {}).get('detected_variants', []))}")
    else:
        print(f"✗ Error: {response.status_code}")
        print(response.text)
