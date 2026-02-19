from collections import defaultdict

CRITICAL_GENES = {
    "CYP2D6",
    "CYP2C19",
    "CYP2C9",
    "SLCO1B1",
    "TPMT",
    "DPYD"
}

def infer_phenotypes(mapped_variants):
    """
    Infer phenotype per gene.
    If no variant detected → default to NM.
    """

    gene_effect_counts = defaultdict(lambda: {"loss": 0, "reduced": 0})

    for variant in mapped_variants:
        gene = variant["gene"]
        effect = variant["effect"]
        genotype = variant.get("genotype", "0/1")

        if genotype == "1/1":
            allele_count = 2
        elif genotype == "0/1":
            allele_count = 1
        else:
            allele_count = 0

        if effect == "loss_of_function":
            gene_effect_counts[gene]["loss"] += allele_count

        elif effect == "reduced_function":
            gene_effect_counts[gene]["reduced"] += allele_count

    phenotypes = {}

    # Ensure all critical genes are evaluated
    for gene in CRITICAL_GENES:

        loss = gene_effect_counts[gene]["loss"]
        reduced = gene_effect_counts[gene]["reduced"]

        if loss >= 2:
            phenotype = "PM"

        elif loss == 1:
            phenotype = "IM"

        elif reduced >= 2:
            phenotype = "PM"

        elif reduced == 1:
            phenotype = "IM"

        else:
            phenotype = "NM"

        phenotypes[gene] = phenotype

    return phenotypes