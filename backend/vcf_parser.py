def extract_variants(file):

    variants = []

    contents = file.file.read().decode("utf-8").splitlines()

    for line in contents:

        if line.startswith("#"):
            continue

        columns = line.split("\t")

        if len(columns) < 10:
            continue

        chrom = columns[0]
        pos = columns[1]
        rsid = columns[2]
        ref = columns[3]
        alt = columns[4]
        qual = columns[5]
        filter_status = columns[6]
        info = columns[7]
        format_field = columns[8]
        sample_field = columns[9]

        format_keys = format_field.split(":")
        sample_values = sample_field.split(":")

        format_dict = dict(zip(format_keys, sample_values))

        genotype = format_dict.get("GT")
        dp = int(format_dict.get("DP", 0)) if format_dict.get("DP") else 0
        gq = int(format_dict.get("GQ", 0)) if format_dict.get("GQ") else 0

        if rsid.startswith("rs") and genotype is not None:

            variants.append({
                "rsid": rsid,
                "genotype": genotype.replace("|", "/"),
                "ref": ref,
                "alt": alt,
                "qual": float(qual) if qual != "." else 0,
                "filter": filter_status,
                "dp": dp,
                "gq": gq
            })

    return variants
