from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("MISTRAL_API_KEY")

if not api_key:
    raise ValueError("MISTRAL_API_KEY not found in .env")

client = OpenAI(
    api_key=api_key,
    base_url="https://api.mistral.ai/v1"
)

def generate_explanation(gene, phenotype, drug, variants_for_gene=None):

    # Build a variant citation list for the prompt
    citations = []
    if variants_for_gene:
        for v in variants_for_gene:
            citations.append(f"{v.get('rsid')} ({v.get('allele')}) genotype={v.get('genotype')}")

    variant_section = "\n".join(citations) if citations else "None"

    prompt = f"""
Provide a brief, clinician-facing explanation (3-4 sentences max) of this pharmacogenomic interaction.
Include explicit variant citations (rsID and star allele) and the biological mechanism linking variant to drug effect.

Gene: {gene}
Phenotype: {phenotype}
Drug: {drug}
Variants: {variant_section}

Focus on:
1. Which specific variants (rsIDs, allele names) drive this phenotype
2. The molecular/biological mechanism affecting the drug
3. Clear clinical action (cite CPIC where applicable)

Return a concise plain-text explanation and be sure to mention the rsIDs and allele names.
"""

    try:
        response = client.chat.completions.create(
            model="mistral-large-latest",
            messages=[
                {"role": "system", "content": "You are a clinical pharmacogenomics expert. Provide concise explanations suitable for healthcare professionals. Always cite rsIDs and allele names when available."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=200
        )

        text = response.choices[0].message.content

        # Build citation objects
        citation_objs = []
        if variants_for_gene:
            for v in variants_for_gene:
                citation_objs.append({
                    "rsid": v.get("rsid"),
                    "allele": v.get("allele"),
                    "genotype": v.get("genotype")
                })

        return {
            "explanation_text": text,
            "variant_citations": citation_objs
        }

    except Exception as e:
        return {
            "explanation_text": f"LLM Error: {str(e)}",
            "variant_citations": []
        }
