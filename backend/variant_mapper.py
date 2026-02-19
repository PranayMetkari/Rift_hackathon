# Curated Pharmacogenomic Variant Database
# Based on CPIC & PharmVar references (simplified for hackathon)

CRITICAL_GENES = {
    "CYP2D6",
    "CYP2C19",
    "CYP2C9",
    "SLCO1B1",
    "TPMT",
    "DPYD"
}


def classify_variants(variants):
    """
    Minimal classification layer:
    - Recognized pharmacogenomic variants
    - Non-PGx variants count
    """

    recognized = []
    non_pgx_count = 0

    for variant in variants:

        rsid = variant["rsid"]
        genotype = variant["genotype"]

        if rsid in VARIANT_DATABASE:

            variant_info = VARIANT_DATABASE[rsid]
            gene = variant_info["gene"]

            if gene in CRITICAL_GENES:
                recognized.append({
                    "rsid": rsid,
                    "gene": gene,
                    "allele": variant_info["allele"],
                    "effect": variant_info["effect"],
                    "genotype": genotype
                })
            else:
                non_pgx_count += 1
        else:
            non_pgx_count += 1

    return {
        "total_variants_scanned": len(variants),
        "recognized_pgx_variants": recognized,
        "non_pgx_variants_count": non_pgx_count
    }


VARIANT_DATABASE = {
    "rs4244285": {
        "gene": "CYP2C19",
        "allele": "*2",
        "effect": "loss_of_function"
    },
    "rs4986893": {
        "gene": "CYP2C19",
        "allele": "*3",
        "effect": "loss_of_function"
    },
    "rs3892097": {
        "gene": "CYP2D6",
        "allele": "*4",
        "effect": "loss_of_function"
    },
    "rs4149056": {
        "gene": "SLCO1B1",
        "allele": "*5",
        "effect": "reduced_function"
    },
    "rs1142345": {
        "gene": "TPMT",
        "allele": "*3A",
        "effect": "loss_of_function"
    },
    "rs3918290": {
        "gene": "DPYD",
        "allele": "*2A",
        "effect": "loss_of_function"
    }
}
def map_rsids_to_effects(variants):
    """
    Convert rsIDs into biological allele effect information
    """

    mapped_variants = []

    for variant in variants:
        rsid = variant["rsid"]
        genotype = variant["genotype"]

        if rsid in VARIANT_DATABASE:
            variant_info = VARIANT_DATABASE[rsid]

            mapped_variants.append({
                "rsid": rsid,
                "gene": variant_info["gene"],
                "allele": variant_info["allele"],
                "effect": variant_info["effect"],
                "genotype": genotype
            })

    return mapped_variants
