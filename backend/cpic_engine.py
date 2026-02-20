CPIC_GUIDELINES = {

    "CLOPIDOGREL": {
        "CYP2C19": {
            "PM": {
                "risk_category": "Ineffective",
                "severity": "High",
                "recommendation": "Avoid clopidogrel; use alternative antiplatelet therapy",
                "evidence_level": "CPIC Level A"
            },
            "IM": {
                "risk_category": "Reduced efficacy",
                "severity": "Moderate",
                "recommendation": "Consider alternative therapy",
                "evidence_level": "CPIC Level A"
            },
            "NM": {
                "risk_category": "Safe",
                "severity": "Low",
                "recommendation": "Standard dosing",
                "evidence_level": "CPIC Level A"
            }
        }
    },

    "CODEINE": {
        "CYP2D6": {
            "PM": {
                "risk_category": "Ineffective",
                "severity": "Moderate",
                "recommendation": "Use alternative analgesic",
                "evidence_level": "CPIC Level A"
            },
            "IM": {
                "risk_category": "Reduced efficacy",
                "severity": "Low",
                "recommendation": "Monitor response",
                "evidence_level": "CPIC Level A"
            },
            "NM": {
                "risk_category": "Safe",
                "severity": "Low",
                "recommendation": "Standard dosing",
                "evidence_level": "CPIC Level A"
            }
        }
    },

    "WARFARIN": {
        "CYP2C9": {
            "PM": {
                "risk_category": "Toxic",
                "severity": "High",
                "recommendation": "Reduce dose significantly and monitor INR closely",
                "evidence_level": "CPIC Level A"
            },
            "IM": {
                "risk_category": "Adjust Dosage",
                "severity": "Moderate",
                "recommendation": "Reduce starting dose",
                "evidence_level": "CPIC Level A"
            },
            "NM": {
                "risk_category": "Safe",
                "severity": "Low",
                "recommendation": "Standard dosing",
                "evidence_level": "CPIC Level A"
            }
        }
    },

    "SIMVASTATIN": {
        "SLCO1B1": {
            "PM": {
                "risk_category": "Toxic",
                "severity": "High",
                "recommendation": "Avoid high doses; consider alternative statin",
                "evidence_level": "CPIC Level A"
            },
            "IM": {
                "risk_category": "Adjust Dosage",
                "severity": "Moderate",
                "recommendation": "Use lower dose",
                "evidence_level": "CPIC Level A"
            },
            "NM": {
                "risk_category": "Safe",
                "severity": "Low",
                "recommendation": "Standard dosing",
                "evidence_level": "CPIC Level A"
            }
        }
    },

    "AZATHIOPRINE": {
        "TPMT": {
            "PM": {
                "risk_category": "Toxic",
                "severity": "High",
                "recommendation": "Avoid use; high risk of myelosuppression",
                "evidence_level": "CPIC Level A"
            },
            "IM": {
                "risk_category": "Adjust Dosage",
                "severity": "Moderate",
                "recommendation": "Reduce dose by 30–70%",
                "evidence_level": "CPIC Level A"
            },
            "NM": {
                "risk_category": "Safe",
                "severity": "Low",
                "recommendation": "Standard dosing",
                "evidence_level": "CPIC Level A"
            }
        }
    },

    "FLUOROURACIL": {
        "DPYD": {
            "PM": {
                "risk_category": "Toxic",
                "severity": "High",
                "recommendation": "Avoid use; severe toxicity risk",
                "evidence_level": "CPIC Level A"
            },
            "IM": {
                "risk_category": "Adjust Dosage",
                "severity": "Moderate",
                "recommendation": "Reduce starting dose",
                "evidence_level": "CPIC Level A"
            },
            "NM": {
                "risk_category": "Safe",
                "severity": "Low",
                "recommendation": "Standard dosing",
                "evidence_level": "CPIC Level A"
            }
        }
    }
}


def apply_cpic_guideline(phenotypes, drugs):

    drug_list = [d.strip().upper() for d in drugs.split(",")]
    results = {}

    for drug in drug_list:

        if drug not in CPIC_GUIDELINES:
            results[drug] = {
                "gene": None,
                "phenotype": None,
                "risk_category": "Unknown",
                "severity": "Unknown",
                "recommendation": "No CPIC guideline available",
                "evidence_level": None
            }
            continue

        drug_rules = CPIC_GUIDELINES[drug]

        # Each drug currently maps to one gene
        for gene in drug_rules.keys():

            phenotype = phenotypes.get(gene, "NM")

            if phenotype in drug_rules[gene]:

                rule = drug_rules[gene][phenotype]

                risk_label = rule.get("risk_category")
                if risk_label == "Reduced efficacy":
                    risk_label = "Adjust Dosage"

                results[drug] = {
                    "gene": gene,
                    "phenotype": phenotype,
                    "risk_category": risk_label,
                    "severity": rule["severity"],
                    "recommendation": rule["recommendation"],
                    "evidence_level": rule["evidence_level"]
                }

        # Safety fallback
        if drug not in results:
            results[drug] = {
                "gene": None,
                "phenotype": None,
                "risk_category": "Unknown",
                "severity": "Unknown",
                "recommendation": "No applicable CPIC rule",
                "evidence_level": None
            }

    return results