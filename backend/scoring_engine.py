def calculate_confidence(mapped_variants, phenotypes):

    if not mapped_variants:
        # If no PGx variants detected but VCF parsed correctly
        return 0.9

    score = 0.6

    for variant in mapped_variants:

        gq = variant.get("gq", 0)
        dp = variant.get("dp", 0)
        filter_status = variant.get("filter", "")

        # Quality contributions
        if gq >= 90:
            score += 0.1

        if dp >= 30:
            score += 0.1

        if filter_status == "PASS":
            score += 0.1

        # Pathogenic impact contribution
        if variant["effect"] == "loss_of_function":
            if variant["genotype"] == "1/1":
                score += 0.1
            elif variant["genotype"] == "0/1":
                score += 0.05

    # Severe phenotype boost
    for phenotype in phenotypes.values():
        if phenotype == "PM":
            score += 0.05

    return round(min(score, 0.99), 2)