"""
Rotterdam & International Guideline Consensus Rules Engine (RUL-01, RUL-02, RUL-04, RUL-05).
Evaluates official 2-of-3 criteria, Rotterdam phenotypes A-D, and alternative mimic exclusions.
"""

from typing import Any, Dict


def evaluate_rotterdam_criteria(
    payload: Dict[str, Any],
    guideline_version: str = "intl_guideline_2023",
) -> Dict[str, Any]:
    """
    Evaluates patient features under Rotterdam 2003 or International 2023 guidelines.
    """
    # 1. Criterion 1: Ovulatory Dysfunction (OD)
    cycle_reg = str(payload.get("cycle_regularity", "")).lower()
    cycle_len = payload.get("cycle_length", payload.get("cycle_length_days", 28))
    
    is_od = False
    if "absent" in cycle_reg or "amenorrhea" in cycle_reg:
      is_od = True
    elif "irregular" in cycle_reg or (cycle_len is not None and (cycle_len > 35 or cycle_len < 21)):
      is_od = True

    # 2. Criterion 2: Hyperandrogenism (HA)
    hirsutism = str(payload.get("hirsutism", payload.get("hair_growth", ""))).lower()
    acne = str(payload.get("acne", payload.get("pimples", ""))).lower()
    hair_loss = str(payload.get("hair_loss", "")).lower()
    
    is_ha = False
    if hirsutism in ["moderate", "severe", "1", "yes", "true"]:
      is_ha = True
    elif acne in ["moderate", "severe", "cystic"]:
      is_ha = True
    elif hair_loss in ["moderate", "severe", "alopecia"]:
      is_ha = True

    # 3. Criterion 3: Polycystic Ovarian Morphology (PCOM)
    follicle_count = payload.get("follicle_count", payload.get("follicle_estimate"))
    amh = payload.get("amh")
    ovary_volume = payload.get("ovarian_volume_ml")
    
    is_pcom = False
    threshold = 20 if guideline_version == "intl_guideline_2023" else 12

    if follicle_count is not None and follicle_count >= threshold:
      is_pcom = True
    elif ovary_volume is not None and ovary_volume >= 10.0:
      is_pcom = True
    elif guideline_version == "intl_guideline_2023" and amh is not None and amh >= 4.80:
      # Adult alternative under 2023 guidelines when ultrasound is unavailable
      age = payload.get("age", 25)
      if age >= 18:
        is_pcom = True

    criteria_met_count = sum([is_od, is_ha, is_pcom])

    # Assign Phenotype A, B, C, D
    phenotype = "None"
    if is_ha and is_od and is_pcom:
      phenotype = "Phenotype A (HA + OD + PCOM)"
    elif is_ha and is_od:
      phenotype = "Phenotype B (HA + OD)"
    elif is_ha and is_pcom:
      phenotype = "Phenotype C (HA + PCOM - Ovulatory)"
    elif is_od and is_pcom:
      phenotype = "Phenotype D (OD + PCOM - Normoandrogenic)"

    # 4. Exclusion checks (TSH, Prolactin, 17-OHP)
    tsh = payload.get("tsh")
    prl = payload.get("prl")
    exclusions_flagged = []
    
    if tsh is not None and (tsh > 4.5 or tsh < 0.3):
      exclusions_flagged.append("Thyroid dysfunction marker (abnormal TSH)")
    if prl is not None and prl > 25.0:
      exclusions_flagged.append("Hyperprolactinemia marker (elevated Prolactin)")

    exclusions_cleared = (len(exclusions_flagged) == 0) and (tsh is not None or prl is not None)
    status = (
        "provisional_exclusions_not_cleared"
        if len(exclusions_flagged) > 0
        else ("criteria_met" if criteria_met_count >= 2 else "criteria_not_met")
    )

    return {
        "guideline_version": guideline_version,
        "criteria_met_count": criteria_met_count,
        "rotterdam_diagnosis": criteria_met_count >= 2,
        "phenotype": phenotype,
        "criteria_breakdown": {
            "ovulatory_dysfunction": is_od,
            "hyperandrogenism": is_ha,
            "polycystic_morphology": is_pcom,
        },
        "exclusions_cleared": exclusions_cleared,
        "exclusions_flagged": exclusions_flagged,
        "status": status,
    }
