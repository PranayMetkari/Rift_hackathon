def extract_variants(file):
    """
    Extract rsID, genotype, REF, ALT from authentic VCF
    """

    variants = []

    contents = file.file.read().decode("utf-8").splitlines()

    for line in contents:

        if line.startswith("#"):
            continue

        columns = line.split("\t")

        if len(columns) < 10:
            continue  # skip malformed lines

        chrom = columns[0]
        pos = columns[1]
        rsid = columns[2]
        ref = columns[3]
        alt = columns[4]
        format_field = columns[8]
        sample_field = columns[9]

        # Extract GT from FORMAT
        format_keys = format_field.split(":")
        sample_values = sample_field.split(":")

        if "GT" in format_keys:
            gt_index = format_keys.index("GT")
            genotype = sample_values[gt_index]
        else:
            genotype = None

        if rsid.startswith("rs") and genotype is not None:

            variants.append({
                "rsid": rsid,
                "genotype": genotype,
                "ref": ref,
                "alt": alt
            })

    return variants
