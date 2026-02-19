def calculate_confidence(mapped_variants, phenotypes):
    """
    Calculate confidence score based on:
    - Evidence strength
    - Allele impact count
    - Phenotype severity
    """

    score = 0.5

    loss_count = 0

    for variant in mapped_variants:
        if variant["effect"] == "loss_of_function":
            genotype = variant["genotype"]

            if genotype == "1/1":
                loss_count += 2
            elif genotype == "0/1":
                loss_count += 1

    # Add based on allele severity
    score += min(loss_count * 0.1, 0.3)

    # Add if severe phenotype
    for phenotype in phenotypes.values():
        if phenotype == "PM":
            score += 0.1

    # Cap score
    if score > 0.95:
        score = 0.95

    return round(score, 2)
